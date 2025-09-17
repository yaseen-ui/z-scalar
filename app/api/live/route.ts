import type { NextRequest } from "next/server";

const generateMockStockData = () => {
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

export async function GET(request: NextRequest) {
  console.log("Starting simplified live data stream");

  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isActive = true;

      const sendData = () => {
        if (!isActive) return;

        try {
          const mockStock = generateMockStockData();
          console.log(
            " Sending data:",
            mockStock.stock_symbol,
            mockStock.price
          );

          const message = `data: ${JSON.stringify(mockStock)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error(" Error in sendData:", error);
        }
      };

      // Send data immediately and then every 3 seconds
      sendData();
      const interval = setInterval(sendData, 3000);

      // Cleanup function
      const cleanup = () => {
        console.log("Cleaning up SSE stream");
        isActive = false;
        clearInterval(interval);
        try {
          controller.close();
        } catch (e) {
          console.log("Controller already closed");
        }
      };

      // Handle client disconnect
      request.signal.addEventListener("abort", cleanup);

      // Auto-cleanup after 10 minutes
      setTimeout(cleanup, 600000);
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
