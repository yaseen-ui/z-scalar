import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Stock, StockState } from "./types";
import { fetchStockHistory, subscribeLiveData } from "./stockThunks";

const generateInitialMockData = (): Stock[] => {
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
  const basePrices = {
    AAPL: 175,
    GOOGL: 2850,
    MSFT: 415,
    AMZN: 3240,
    TSLA: 790,
  };

  const allData: Stock[] = [];

  symbols.forEach((symbol) => {
    const basePrice = basePrices[symbol as keyof typeof basePrices];
    // Generate 20 historical points for each symbol
    for (let i = 0; i < 20; i++) {
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.05;
      const volume = Math.floor(Math.random() * 50000000) + 1000000;
      const timestamp = new Date(Date.now() - (19 - i) * 60000).toISOString(); // 1 minute intervals

      allData.push({
        id: Date.now() + i + symbols.indexOf(symbol) * 1000,
        stock_symbol: symbol,
        price: Math.round(price * 100) / 100,
        volume,
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        isMockData: true,
      });
    }
  });

  console.log("Generated initial mock data:", allData.length, "records");
  return allData;
};

const initialState: StockState = {
  history: generateInitialMockData(),
  live: null,
  selectedSymbol: "AAPL",
  isLoading: false,
  error: null,
  eventSource: null,
  isMockMode: true,
  pollingInterval: null,
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    setSelectedSymbol: (state, action: PayloadAction<string>) => {
      state.selectedSymbol = action.payload;
    },
    setLiveData: (state, action: PayloadAction<Stock>) => {
      state.live = action.payload;
      // Add to history if it matches selected symbol
      if (state.selectedSymbol === action.payload.stock_symbol) {
        state.history = [...state.history.slice(-99), action.payload];
      }
    },
    setEventSource: (state, action: PayloadAction<EventSource | null>) => {
      state.eventSource = action.payload;
    },
    setPollingInterval: (
      state,
      action: PayloadAction<NodeJS.Timeout | null>
    ) => {
      state.pollingInterval = action.payload;
    },
    setMockMode: (state, action: PayloadAction<boolean>) => {
      state.isMockMode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    cleanup: (state) => {
      if (state.eventSource) {
        state.eventSource.close();
        state.eventSource = null;
      }
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval);
        state.pollingInterval = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stock history
      .addCase(fetchStockHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload.data;
        state.isMockMode = action.payload.isMockData;
        state.error = null;
      })
      .addCase(fetchStockHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isMockMode = true;
      })
      // Subscribe live data
      .addCase(subscribeLiveData.pending, (state) => {
        state.error = null;
      })
      .addCase(subscribeLiveData.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(subscribeLiveData.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedSymbol,
  setLiveData,
  setEventSource,
  setPollingInterval,
  setMockMode,
  clearError,
  cleanup,
} = stockSlice.actions;

export default stockSlice.reducer;
