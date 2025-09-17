import { create } from "zustand";

export interface Stock {
  id: number;
  stock_symbol: string;
  price: number;
  volume: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  isMockData?: boolean;
}

interface StockStore {
  history: Stock[];
  live: Stock | null;
  selectedSymbol: string;
  isLoading: boolean;
  error: string | null;
  eventSource: EventSource | null;
  isMockMode: boolean;
  pollingInterval: NodeJS.Timeout | null;

  // Actions
  fetchHistory: (symbol: string) => Promise<void>;
  subscribeLive: () => void;
  unsubscribeLive: () => void;
  setSymbol: (symbol: string) => void;
  clearError: () => void;
  setMockMode: (isMock: boolean) => void;
}

const generateClientMockData = () => {
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  const basePrices = {
    AAPL: 175,
    GOOGL: 2850,
    MSFT: 415,
    AMZN: 3240,
    TSLA: 790,
  };

  const basePrice = basePrices[symbol as keyof typeof basePrices];
  const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
  const volume = Math.floor(Math.random() * 50000000) + 1000000;

  return {
    id: Date.now(),
    stock_symbol: symbol,
    price: Math.round(price * 100) / 100,
    volume,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isMockData: true,
  };
};

const generateInitialMockData = () => {
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

export const useStockStore = create<StockStore>((set, get) => ({
  history: generateInitialMockData(),
  live: null,
  selectedSymbol: "AAPL",
  isLoading: false,
  error: null,
  eventSource: null,
  isMockMode: true,
  pollingInterval: null,

  fetchHistory: async (symbol: string) => {
    console.log("Fetching history for:", symbol);
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/stocks/${symbol}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Received history data:", result);

      if (result.isMockData) {
        console.log("Using mock data mode");
        set({
          history: Array.isArray(result.data) ? result.data : [],
          isLoading: false,
          isMockMode: true,
          error: null,
        });
      } else {
        console.log("Using database data");
        set({
          history: Array.isArray(result)
            ? result
            : Array.isArray(result.data)
            ? result.data
            : [],
          isLoading: false,
          isMockMode: false,
          error: null,
        });
      }
    } catch (error) {
      console.error(" Error fetching stock history:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch stock data",
        isLoading: false,
        isMockMode: true, // Stay in mock mode on error
      });
    }
  },

  subscribeLive: () => {
    console.log("Starting live data with polling fallback");
    const { eventSource, pollingInterval } = get();

    // Clean up existing connections
    if (eventSource) {
      eventSource.close();
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    try {
      const newEventSource = new EventSource("/api/live");
      let sseWorking = false;

      newEventSource.onmessage = (event) => {
        try {
          sseWorking = true;
          const stockData = JSON.parse(event.data);
          console.log("SSE received:", stockData);

          if (stockData.stock_symbol && typeof stockData.price === "number") {
            set((state) => ({
              live: stockData,
              isMockMode: stockData.isMockData || true,
              error: null,
              history:
                state.selectedSymbol === stockData.stock_symbol
                  ? [...state.history.slice(-99), stockData]
                  : state.history,
            }));
          }
        } catch (error) {
          console.error(" Error parsing SSE data:", error);
        }
      };

      newEventSource.onopen = () => {
        console.log("SSE connection opened");
        set({ error: null });
      };

      newEventSource.onerror = () => {
        console.log("SSE failed, switching to polling");
        newEventSource.close();

        const startPolling = () => {
          const interval = setInterval(() => {
            const mockData = generateClientMockData();
            console.log("Polling generated:", mockData);

            set((state) => ({
              live: mockData,
              isMockMode: true,
              error: null,
              history:
                state.selectedSymbol === mockData.stock_symbol
                  ? [...state.history.slice(-99), mockData]
                  : state.history,
            }));
          }, 3000);

          set({ pollingInterval: interval, eventSource: null });
        };

        // Wait a moment to see if SSE recovers, then start polling
        setTimeout(() => {
          if (!sseWorking) {
            startPolling();
          }
        }, 2000);
      };

      set({ eventSource: newEventSource });

      setTimeout(() => {
        if (!sseWorking) {
          console.log("SSE timeout, switching to polling");
          newEventSource.close();

          const interval = setInterval(() => {
            const mockData = generateClientMockData();
            console.log("Polling generated:", mockData);

            set((state) => ({
              live: mockData,
              isMockMode: true,
              error: null,
              history:
                state.selectedSymbol === mockData.stock_symbol
                  ? [...state.history.slice(-99), mockData]
                  : state.history,
            }));
          }, 3000);

          set({ pollingInterval: interval, eventSource: null });
        }
      }, 5000);
    } catch (error) {
      console.error(" Failed to create EventSource, using polling:", error);

      const interval = setInterval(() => {
        const mockData = generateClientMockData();
        console.log("Polling generated:", mockData);

        set((state) => ({
          live: mockData,
          isMockMode: true,
          error: null,
          history:
            state.selectedSymbol === mockData.stock_symbol
              ? [...state.history.slice(-99), mockData]
              : state.history,
        }));
      }, 3000);

      set({ pollingInterval: interval, eventSource: null });
    }
  },

  unsubscribeLive: () => {
    const { eventSource, pollingInterval } = get();

    if (eventSource) {
      console.log("Closing SSE connection");
      eventSource.close();
    }

    if (pollingInterval) {
      console.log("Stopping polling");
      clearInterval(pollingInterval);
    }

    set({ eventSource: null, pollingInterval: null });
  },

  setSymbol: (symbol: string) => {
    set({ selectedSymbol: symbol });
    get().fetchHistory(symbol);
  },

  clearError: () => {
    set({ error: null });
  },

  setMockMode: (isMock: boolean) => {
    set({ isMockMode: isMock });
  },
}));

// Hook to get aggregated data for charts
export const useChartData = () => {
  const { history, selectedSymbol } = useStockStore();

  console.log(
    " Chart data - total history:",
    history.length,
    "selected:",
    selectedSymbol
  );

  // Filter history for selected symbol (for line and scatter charts)
  const filteredHistory = history.filter(
    (stock) => stock.stock_symbol === selectedSymbol
  );
  console.log(
    " Filtered history for",
    selectedSymbol,
    ":",
    filteredHistory.length
  );

  // Calculate average volume per symbol for bar chart
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];
  const volumeBySymbol = symbols.map((symbol) => {
    const symbolData = history.filter((stock) => stock.stock_symbol === symbol);
    const avgVolume =
      symbolData.length > 0
        ? symbolData.reduce((sum, stock) => sum + stock.volume, 0) /
          symbolData.length
        : 0;

    return {
      symbol,
      avgVolume: Math.round(avgVolume),
    };
  });

  const priceDistribution = () => {
    if (filteredHistory.length === 0) {
      console.log("No data for price distribution, returning empty bins");
      // Return empty bins for consistent chart display
      return Array.from({ length: 5 }, (_, i) => ({
        range: `${i * 20}-${(i + 1) * 20}`,
        count: 0,
        minPrice: i * 20,
        maxPrice: (i + 1) * 20,
      }));
    }

    const prices = filteredHistory.map((stock) => stock.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Handle case where all prices are the same
    if (min === max) {
      return [
        {
          range: `${min.toFixed(0)}`,
          count: prices.length,
          minPrice: min,
          maxPrice: max,
        },
      ];
    }

    const binCount = Math.min(10, Math.max(3, Math.ceil(prices.length / 5))); // Dynamic bin count
    const binSize = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(0)}-${(
        min +
        (i + 1) * binSize
      ).toFixed(0)}`,
      count: 0,
      minPrice: min + i * binSize,
      maxPrice: min + (i + 1) * binSize,
    }));

    prices.forEach((price) => {
      const binIndex = Math.min(
        Math.floor((price - min) / binSize),
        binCount - 1
      );
      bins[binIndex].count++;
    });

    return bins;
  };

  const lineChartData = filteredHistory.map((stock) => ({
    timestamp: new Date(stock.timestamp).toLocaleTimeString(),
    price: stock.price,
    volume: stock.volume,
  }));

  const scatterData = filteredHistory.map((stock) => ({
    price: stock.price,
    volume: stock.volume,
    timestamp: stock.timestamp,
  }));

  console.log("Chart data prepared:", {
    lineChartData: lineChartData.length,
    scatterData: scatterData.length,
    volumeBySymbol: volumeBySymbol.length,
    priceDistribution: priceDistribution().length,
  });

  return {
    lineChartData,
    scatterData,
    volumeBySymbol,
    priceDistribution: priceDistribution(),
  };
};
