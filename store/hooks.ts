import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import type { RootState, AppDispatch } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Chart data selector hook
export const useChartData = () => {
  const { history, selectedSymbol } = useAppSelector((state) => state.stock);

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

    const binCount = Math.min(10, Math.max(3, Math.ceil(prices.length / 5)));
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
