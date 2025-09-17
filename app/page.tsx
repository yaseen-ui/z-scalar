"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, Activity, Database } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Stock Market Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Real-time stock data visualization with interactive charts and live updates
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle>Real-time Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Live stock price updates every second with SSE streaming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary" />
              <CardTitle>Interactive Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Multiple chart types: line, scatter, bar, and histogram visualizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-8 w-8 text-primary" />
              <CardTitle>Live Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Real-time price and volume analysis for major tech stocks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary" />
              <CardTitle>Full-Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                PostgreSQL database with Sequelize ORM and Next.js API routes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">Built With Modern Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js 14",
              "TypeScript",
              "TailwindCSS",
              "shadcn/ui",
              "Recharts",
              "Zustand",
              "Sequelize",
              "PostgreSQL",
            ].map((tech) => (
              <div key={tech} className="rounded-full bg-secondary px-4 py-2 text-sm font-medium">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
