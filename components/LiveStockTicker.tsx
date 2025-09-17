"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStockStore } from "@/store/useStockStore"
import { Activity } from "lucide-react"

export function LiveStockTicker() {
  const { live, subscribeLive, unsubscribeLive } = useStockStore()

  useEffect(() => {
    subscribeLive()

    return () => {
      unsubscribeLive()
    }
  }, [subscribeLive, unsubscribeLive])

  if (!live) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Stock Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Connecting to live feed...</div>
        </CardContent>
      </Card>
    )
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          Live Stock Feed
        </CardTitle>
        <Badge variant="outline" className="ml-auto">
          LIVE
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{live.stock_symbol}</span>
              <Badge variant="secondary">{formatPrice(live.price)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Volume: {formatVolume(live.volume)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{new Date(live.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
