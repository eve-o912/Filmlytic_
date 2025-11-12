"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50 dark:from-slate-950 dark:via-purple-950 dark:to-cyan-950">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Filmlytic
            </h1>
          </div>
          <Link href="/profile">
            <Button variant="outline" className="rounded-full bg-transparent">
              👤 Profile
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary dark:text-primary rounded-full text-sm font-semibold backdrop-blur">
            The Upcoming Filmmakers Award
          </div>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-br from-slate-900 via-primary to-secondary dark:from-white dark:via-primary dark:to-secondary bg-clip-text text-transparent mb-6 leading-tight">
            Vote on Blockchain
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-2">
            100% Transparent Film Voting with Blockchain Verification
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time results • Voter IDs tracked • Base testnet powered
          </p>
        </div>

        {/* Main CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          <Link href="/vote">
            <Card className="h-full cursor-pointer group hover:shadow-2xl transition-all border-2 hover:border-primary/50 dark:hover:border-primary/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="text-5xl mb-4">🎬</div>
                <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
                <CardDescription>Scan QR code and select 3 films</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold">
                  Vote Now →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/live-display">
            <Card className="h-full cursor-pointer group hover:shadow-2xl transition-all border-2 hover:border-secondary/50 dark:hover:border-secondary/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="text-5xl mb-4">📊</div>
                <CardTitle className="text-2xl">Live Display</CardTitle>
                <CardDescription>Big screen vote tracker with IDs</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white font-semibold">
                  Watch Live →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Secondary Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/live-results">
            <Card className="h-full cursor-pointer group hover:shadow-xl transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6 space-y-3">
                <div className="text-3xl">📈</div>
                <h3 className="font-semibold">Live Results</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time vote tracking</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/final-results">
            <Card className="h-full cursor-pointer group hover:shadow-xl transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6 space-y-3">
                <div className="text-3xl">🏆</div>
                <h3 className="font-semibold">Final Results</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Winners & rankings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/results">
            <Card className="h-full cursor-pointer group hover:shadow-xl transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6 space-y-3">
                <div className="text-3xl">✅</div>
                <h3 className="font-semibold">Verified</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Blockchain verified</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Blockchain Info */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 dark:border-primary/30 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔗</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Blockchain Verified</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Every vote is permanently recorded on Base Sepolia testnet. Voters receive transaction hashes to verify
                their vote exists forever on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
