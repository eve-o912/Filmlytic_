"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg animate-glow">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Filmlytic
              </h1>
              <p className="text-xs text-muted-foreground">TUFA Voting</p>
            </div>
          </div>
          <Link href="/profile">
            <Button className="rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all text-primary-foreground font-semibold">
              Admin →
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-8 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 text-primary rounded-full text-sm font-bold backdrop-blur-sm hover:border-primary/50 transition-all">
            ✨ The Upcoming Filmmakers Award - Edition 1
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent block mb-2">Vote for</span>
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Cinema</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-3 font-light">
            Select your 3 favorite films. Real-time results. Verified votes.
          </p>
          <p className="text-sm text-muted-foreground">
            100% Transparent • Voter IDs Tracked • Recorded on Blockchain
          </p>
        </div>

        {/* Main CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          <Link href="/vote">
            <Card className="h-full cursor-pointer group border-2 hover:border-primary/50 transition-all overflow-hidden hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎬</div>
                <CardTitle className="text-3xl font-black">Cast Your Vote</CardTitle>
                <CardDescription className="text-base">Scan QR • Select 3 Films • Vote</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all text-primary-foreground font-bold h-12 text-base">
                  Begin Voting →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/live-display">
            <Card className="h-full cursor-pointer group border-2 hover:border-secondary/50 transition-all overflow-hidden hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <CardTitle className="text-3xl font-black">Live Results</CardTitle>
                <CardDescription className="text-base">Big Screen Display • Voter IDs • Real-time</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-gradient-to-r from-secondary to-accent hover:shadow-lg transition-all text-secondary-foreground font-bold h-12 text-base">
                  Watch Live →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Secondary Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <Link href="/live-results">
            <Card className="h-full cursor-pointer group hover:shadow-xl transition-all overflow-hidden border hover:border-primary/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">📈</div>
                <h3 className="font-bold text-lg">Live Tracker</h3>
                <p className="text-sm text-muted-foreground">Real-time vote counts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/final-results">
            <Card className="h-full cursor-pointer group hover:shadow-xl transition-all overflow-hidden border hover:border-accent/50">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">🏆</div>
                <h3 className="font-bold text-lg">Winners</h3>
                <p className="text-sm text-muted-foreground">Top 3 awarded films</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/results">
            <Card className="h-full cursor-pointer group hover:shadow-xl transition-all overflow-hidden border hover:border-secondary/50">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">✓</div>
                <h3 className="font-bold text-lg">Full Results</h3>
                <p className="text-sm text-muted-foreground">Complete rankings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Simple blockchain note at bottom */}
        <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-border/50 bg-muted/30 backdrop-blur-sm text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Recorded on blockchain</span> • All votes immutably stored on Base Sepolia
          </p>
        </div>
      </div>
    </div>
  )
}
