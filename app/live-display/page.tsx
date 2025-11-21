"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

interface VoteResult {
  filmId: number
  voteCount: number
  voters: string[]
}

export default function LiveDisplayPage() {
  const [results, setResults] = useState<VoteResult[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    const fetchActiveSession = async () => {
      const supabase = createClient()
      const { data: session } = await supabase
        .from("voting_sessions")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .single()

      if (session) {
        setSessionId(session.id)
        fetchAndDisplayResults(session.id)
      }
    }

    fetchActiveSession()
  }, [])

  const fetchAndDisplayResults = async (sessionId: string) => {
    const supabase = createClient()
    const { data: votes } = await supabase.from("votes").select("*").eq("session_id", sessionId)

    if (votes) {
      const grouped: { [key: number]: string[] } = {}
      votes.forEach((vote) => {
        if (!grouped[vote.film_id]) {
          grouped[vote.film_id] = []
        }
        grouped[vote.film_id].push(vote.voter_serial_number)
      })

      const results = Object.entries(grouped)
        .map(([filmId, voters]) => ({
          filmId: Number(filmId),
          voteCount: voters.length,
          voters: voters.sort(),
        }))
        .sort((a, b) => b.voteCount - a.voteCount)

      setResults(results)
      setTotalVotes(votes.length)
    }
  }

  useEffect(() => {
    if (!sessionId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`live-display-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => {
        fetchAndDisplayResults(sessionId)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-foreground via-primary/20 to-foreground">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-8xl md:text-9xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">TUFA</span>
          </h1>
          <p className="text-3xl font-bold text-white mb-6">Live Vote Tracker</p>
          <div className="text-6xl font-black text-white font-mono">{totalVotes}</div>
          <p className="text-white/60 text-lg mt-2">votes cast</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {results.map((result, index) => (
            <Card
              key={result.filmId}
              className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-primary/50 transition-all group overflow-hidden hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 space-y-4 relative text-white">
                <div className="text-center">
                  <div className="text-7xl font-black text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text mb-2">
                    #{index + 1}
                  </div>
                  <div className="text-2xl font-bold">Film {result.filmId}</div>
                </div>

                <div className="text-center py-4 border-y border-white/10">
                  <div className="text-7xl font-black">{result.voteCount}</div>
                  <div className="text-white/60 text-sm mt-1">{result.voteCount === 1 ? "vote" : "votes"}</div>
                </div>

                <div className="bg-black/30 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-bold text-white/60">Voter IDs:</div>
                  <div className="flex flex-wrap gap-1">
                    {result.voters.map((voter, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-primary to-secondary px-2 py-1 rounded text-white font-mono font-bold text-xs"
                      >
                        {voter}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${(result.voteCount / Math.max(...results.map((r) => r.voteCount), 1)) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center text-white/60 text-4xl mt-20 font-bold">
            Waiting for votes to begin...
          </div>
        )}

        {/* Blockchain note - subtle at bottom */}
        <div className="mt-16 text-center text-white/40 text-xs">
          All votes recorded on blockchain
        </div>
      </div>
    </div>
  )
}

