import { configureStore } from "@reduxjs/toolkit"
import stockReducer from "./stockSlice"

export const store = configureStore({
  reducer: {
    stock: stockReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["stock/setEventSource", "stock/setPollingInterval"],
        ignoredPaths: ["stock.eventSource", "stock.pollingInterval"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
