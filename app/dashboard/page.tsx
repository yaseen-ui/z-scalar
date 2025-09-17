"use client"

import { useEffect } from "react"
import { StockChart } from "@/components/StockChart"
import { LiveStockTicker } from "@/components/LiveStockTicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert" // Added Alert component
import { useStockStore } from "@/store/useStockStore"
import { RefreshCw, Database, AlertTriangle } from "lucide-react" // Added AlertTriangle icon

export default function DashboardPage() {
  const { selectedSymbol, fetchHistory, subscribeLive, isLoading, error, clearError, isMockMode } = useStockStore()

  useEffect(() => {
    subscribeLive()

    const { history } = useStockStore.getState()
    if (history.length === 0) {
      fetchHistory(selectedSymbol)
    }

    return () => {
      const { unsubscribeLive } = useStockStore.getState()
      unsubscribeLive()
    }
  }, [subscribeLive, fetchHistory, selectedSymbol])

  const handleSeedDatabase = async () => {
    try {
      const response = await fetch("/api/seed", { method: "POST" })
      const result = await response.json()

      if (response.ok) {
        alert(`Database seeded successfully! Created ${result.recordsCreated} records.`)
        // Refresh current data
        fetchHistory(selectedSymbol)
      } else {
        alert(`Error seeding database: ${result.error}`)
      }
    } catch (error) {
      alert("Failed to seed database")
      console.error("Seed error:", error)
    }
  }

  const handleRefreshPage = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {isMockMode && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-yellow-800 dark:text-yellow-200">
                Database connection failed. Displaying mock data for demonstration purposes.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshPage}
                className="ml-4 border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:text-yellow-200 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Market Dashboard</h1>
            <p className="text-muted-foreground">Real-time stock data visualization and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchHistory(selectedSymbol)} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSeedDatabase}>
              <Database className="h-4 w-4 mr-2" />
              Seed DB
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error &&
          !isMockMode && ( // Don't show error if in mock mode (handled by alert above)
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-destructive">{error}</div>
                  <Button variant="outline" size="sm" onClick={clearError}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Live Ticker */}
        <LiveStockTicker />

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <StockChart type="line" title="Price Over Time" />
          <StockChart type="scatter" title="Price vs Volume" />
          <StockChart type="bar" title="Average Volume by Symbol" />
          <StockChart type="histogram" title="Price Distribution" />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Symbol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedSymbol}</div>
              <p className="text-xs text-muted-foreground">Selected for detailed analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">Historical records per symbol</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1s</div>
              <p className="text-xs text-muted-foreground">Real-time data refresh rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. <strong>Seed Database:</strong> Click "Seed DB" to populate the database with sample stock data
            </p>
            <p className="text-sm text-muted-foreground">
              2. <strong>Select Symbols:</strong> Use the dropdowns on charts to switch between different stocks (AAPL,
              GOOGL, MSFT, AMZN, TSLA)
            </p>
            <p className="text-sm text-muted-foreground">
              3. <strong>Live Data:</strong> The live ticker shows real-time stock updates generated every second
            </p>
            <p className="text-sm text-muted-foreground">
              4. <strong>Charts:</strong> Explore different visualizations - line chart for trends, scatter plot for
              correlations, bar chart for volume comparison, and histogram for price distribution
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
