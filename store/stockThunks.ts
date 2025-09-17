import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Stock } from "./types";
import { setLiveData, setEventSource, setPollingInterval } from "./stockSlice";

export const fetchStockHistory = createAsyncThunk<
  { data: Stock[]; isMockData: boolean },
  string,
  { rejectValue: string }
>("stock/fetchHistory", async (symbol, { rejectWithValue }) => {
  try {
    console.log("Fetching history for:", symbol);
    const response = await fetch(`/api/stocks/${symbol}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Received history data:", result);

    if (result.isMockData) {
      console.log("Using mock data mode");
      return {
        data: Array.isArray(result.data) ? result.data : [],
        isMockData: true,
      };
    } else {
      console.log("Using database data");
      return {
        data: Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : [],
        isMockData: false,
      };
    }
  } catch (error) {
    console.error(" Error fetching stock history:", error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch stock data"
    );
  }
});

const generateClientMockData = (): Stock => {
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

export const subscribeLiveData = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("stock/subscribeLive", async (_, { dispatch, rejectWithValue }) => {
  try {
    console.log("Starting live data with polling fallback");

    const eventSource = new EventSource("/api/live");
    let sseWorking = false;

    eventSource.onmessage = (event) => {
      try {
        sseWorking = true;
        const stockData = JSON.parse(event.data);
        console.log("SSE received:", stockData);

        if (stockData.stock_symbol && typeof stockData.price === "number") {
          dispatch(setLiveData(stockData));
        }
      } catch (error) {
        console.error(" Error parsing SSE data:", error);
      }
    };

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onerror = () => {
      console.log("SSE failed, switching to polling");
      eventSource.close();

      const startPolling = () => {
        const interval = setInterval(() => {
          const mockData = generateClientMockData();
          console.log("Polling generated:", mockData);
          dispatch(setLiveData(mockData));
        }, 3000);

        dispatch(setPollingInterval(interval));
      };

      setTimeout(() => {
        if (!sseWorking) {
          startPolling();
        }
      }, 2000);
    };

    dispatch(setEventSource(eventSource));

    // Fallback to polling after timeout
    setTimeout(() => {
      if (!sseWorking) {
        console.log("SSE timeout, switching to polling");
        eventSource.close();

        const interval = setInterval(() => {
          const mockData = generateClientMockData();
          console.log("Polling generated:", mockData);
          dispatch(setLiveData(mockData));
        }, 3000);

        dispatch(setPollingInterval(interval));
      }
    }, 5000);
  } catch (error) {
    console.error(" Failed to create EventSource, using polling:", error);

    const interval = setInterval(() => {
      const mockData = generateClientMockData();
      console.log("Polling generated:", mockData);
      dispatch(setLiveData(mockData));
    }, 3000);

    dispatch(setPollingInterval(interval));
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to subscribe to live data"
    );
  }
});
