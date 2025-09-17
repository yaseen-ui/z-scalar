import { NextResponse } from "next/server"
import Stock from "@/lib/models/Stock"
import sequelize from "@/lib/db"

// Seed database with initial stock data
export async function POST() {
  try {
    await sequelize.authenticate()
    await Stock.sync({ force: true }) // This will drop and recreate the table

    const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
    const basePrices = {
      AAPL: 150,
      GOOGL: 2800,
      MSFT: 300,
      AMZN: 3200,
      TSLA: 800,
    }

    const seedData = []
    const now = new Date()

    // Generate 100 records for each symbol over the past 100 hours
    for (const symbol of symbols) {
      const basePrice = basePrices[symbol as keyof typeof basePrices]

      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(now.getTime() - (99 - i) * 60 * 60 * 1000) // 1 hour intervals
        const price = basePrice + (Math.random() - 0.5) * basePrice * 0.2 // ±20% variation
        const volume = Math.floor(Math.random() * 1000000) + 100000

        seedData.push({
          stock_symbol: symbol,
          price: Math.round(price * 100) / 100,
          volume,
          timestamp,
        })
      }
    }

    await Stock.bulkCreate(seedData)

    return NextResponse.json({
      message: "Database seeded successfully",
      recordsCreated: seedData.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
