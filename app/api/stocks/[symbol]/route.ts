import { type NextRequest, NextResponse } from "next/server";
import mockData from "@/lib/mockData.json";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;

  console.log("Stock API called for symbol:", symbol);

  try {
    const dbConfigured =
      process.env.DB_HOST &&
      process.env.DB_NAME &&
      process.env.DB_USER &&
      process.env.DB_PASS;

    if (dbConfigured) {
      const { default: sequelize } = await import("@/lib/db");
      const { default: Stock } = await import("@/lib/models/Stock");

      console.log("Attempting database connection...");

      // Try database connection with timeout
      await Promise.race([
        sequelize.authenticate(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database timeout")), 5000)
        ),
      ]);

      await Stock.sync();

      // Fetch last 100 records for the symbol, ordered by timestamp ASC
      const stocks = await Stock.findAll({
        where: {
          stock_symbol: symbol.toUpperCase(),
        },
        order: [["timestamp", "ASC"]],
        limit: 100,
      });

      console.log(
        " Successfully fetched from database:",
        stocks.length,
        "records"
      );
      return NextResponse.json(stocks);
    } else {
      console.log("Database not configured, using mock data");
      throw new Error("Database not configured");
    }
  } catch (error) {
    console.log(
      " Database failed, using mock data:",
      error instanceof Error ? error.message : "Unknown error"
    );

    const mockStocks = mockData.stocks.filter(
      (stock) => stock.stock_symbol === symbol.toUpperCase()
    );

    console.log(
      " Mock data found:",
      mockStocks.length,
      "records for",
      symbol.toUpperCase()
    );

    if (mockStocks.length === 0) {
      console.log("No mock data found for symbol, returning empty array");
      return NextResponse.json(
        {
          data: [],
          isMockData: true,
          message: "No mock data available for this symbol.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: mockStocks,
        isMockData: true,
        message: "Database connection failed. Displaying mock data.",
      },
      { status: 200 }
    );
  }
}
