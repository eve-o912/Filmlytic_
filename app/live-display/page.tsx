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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            TUFA Voting
          </h1>
          <p className="text-3xl font-bold text-white mb-4">Total Votes: {totalVotes}</p>
          <p className="text-slate-300 text-lg">Results updating in real-time</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((result, index) => (
            <Card
              key={result.filmId}
              className="bg-slate-800/50 border-slate-700/50 backdrop-blur hover:bg-slate-800 transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 space-y-4 relative">
                <div className="text-center">
                  <div className="text-5xl font-black text-white mb-2">#{index + 1}</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Film {result.filmId}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-6xl font-black text-white">{result.voteCount}</div>
                  <div className="text-slate-400 text-sm">{result.voteCount === 1 ? "vote" : "votes"}</div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="text-xs font-bold text-slate-400 mb-2">Voter IDs:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.voters.map((voter, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-primary to-secondary text-white px-2 py-1 rounded font-mono font-bold text-xs"
                      >
                        {voter}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
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
          <div className="text-center text-slate-300 text-3xl mt-16 font-semibold">Waiting for votes to start...</div>
        )}
      </div>
    </div>
  )
}
