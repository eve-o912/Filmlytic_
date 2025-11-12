"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRankedResults, getVoteStats } from "@/lib/utils/voting"

export default function LiveResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      const supabase = createClient()

      // Get active session
      const { data: session } = await supabase
        .from("voting_sessions")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .single()

      if (session) {
        setSessionActive(true)

        const { data: votes } = await supabase.from("votes").select("*").eq("session_id", session.id)

        if (votes) {
          setTotalVotes(votes.length)
          const stats = getVoteStats(votes)
          const ranked = getRankedResults(stats)
          setResults(ranked)
        }
      }
      setLoading(false)
    }

    fetchResults()

    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel("live-results")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => {
        fetchResults()
      })
      .subscribe()

    // Refresh every 2 seconds as fallback
    const interval = setInterval(fetchResults, 2000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-600 dark:text-slate-400 text-center">Voting is not currently active</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-cyan-950 dark:to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4">
            Live Voting Results
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-400 mb-2">
            Total Votes: <span className="font-bold text-blue-600 dark:text-blue-400">{totalVotes}</span>
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400">Refreshing live...</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {results.map((result, index) => (
            <Card key={result.filmId} className={`${index < 3 ? "border-2 border-yellow-500" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    #{index + 1} Film {result.filmId}
                  </CardTitle>
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{result.voteCount}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-8 rounded-full flex items-center justify-end pr-4 transition-all duration-500"
                    style={{ width: `${(result.voteCount / (results[0]?.voteCount || 1)) * 100}%` }}
                  >
                    {result.voteCount > 0 && (
                      <span className="text-white font-bold text-sm">
                        {Math.round((result.voteCount / totalVotes) * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                {result.voters.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Votes from:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.voters.map((voter: string) => (
                        <span
                          key={voter}
                          className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-mono font-bold animate-pulse"
                        >
                          {voter}
                          <span className="ml-2 text-xs">🔗</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                      All votes are permanently recorded on Base blockchain for complete transparency
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
