export interface Stock {
  id: number
  stock_symbol: string
  price: number
  volume: number
  timestamp: string
  createdAt: string
  updatedAt: string
  isMockData?: boolean
}

export interface StockState {
  history: Stock[]
  live: Stock | null
  selectedSymbol: string
  isLoading: boolean
  error: string | null
  eventSource: EventSource | null
  isMockMode: boolean
  pollingInterval: NodeJS.Timeout | null
}
