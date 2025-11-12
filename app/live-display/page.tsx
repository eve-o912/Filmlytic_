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

    // Subscribe to vote changes
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">TUFA Voting Results</h1>
          <p className="text-2xl text-slate-300">Total Votes Cast: {totalVotes}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <Card key={result.filmId} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">#{index + 1}</div>
                  <div className="text-3xl font-bold text-blue-400">Film {result.filmId}</div>
                </div>

                <div className="text-center">
                  <div className="text-6xl font-bold text-white">{result.voteCount}</div>
                  <div className="text-slate-400">{result.voteCount === 1 ? "vote" : "votes"}</div>
                </div>

                <div className="bg-slate-900 rounded p-4 max-h-48 overflow-y-auto">
                  <div className="text-xs font-bold text-slate-400 mb-2">Voters:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.voters.map((voter, idx) => (
                      <div key={idx} className="bg-blue-600 text-white px-3 py-2 rounded font-mono font-bold text-sm">
                        {voter}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-slate-700 rounded h-2">
                  <div
                    className="bg-blue-500 h-2 rounded transition-all duration-500"
                    style={{ width: `${(result.voteCount / Math.max(...results.map((r) => r.voteCount), 1)) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && <div className="text-center text-slate-400 text-2xl mt-12">Waiting for votes...</div>}
      </div>
    </div>
  )
}
