"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import { useStockStore, useChartData } from "@/store/useStockStore"

const SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
const SYMBOL_COLORS = {
  AAPL: "#1f77b4",
  GOOGL: "#ff7f0e",
  MSFT: "#2ca02c",
  AMZN: "#d62728",
  TSLA: "#9467bd",
}

interface StockChartProps {
  type: "line" | "scatter" | "bar" | "histogram"
  title: string
}

export function StockChart({ type, title }: StockChartProps) {
  const { selectedSymbol, setSymbol, isLoading, error } = useStockStore()
  const { lineChartData, scatterData, volumeBySymbol, priceDistribution } = useChartData()

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error: {error}</div>
        </div>
      )
    }

    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="timestamp" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={SYMBOL_COLORS[selectedSymbol as keyof typeof SYMBOL_COLORS]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="price"
                name="Price"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="volume"
                name="Volume"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Scatter fill={SYMBOL_COLORS[selectedSymbol as keyof typeof SYMBOL_COLORS]} fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeBySymbol}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="symbol" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="avgVolume" radius={[4, 4, 0, 0]}>
                {volumeBySymbol.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SYMBOL_COLORS[entry.symbol as keyof typeof SYMBOL_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )

      case "histogram":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="count"
                fill={SYMBOL_COLORS[selectedSymbol as keyof typeof SYMBOL_COLORS]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Unknown chart type</div>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {(type === "line" || type === "scatter" || type === "histogram") && (
          <Select value={selectedSymbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
