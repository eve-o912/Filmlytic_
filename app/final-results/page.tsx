"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRankedResults, getVoteStats } from "@/lib/utils/voting"

export default function FinalResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      const supabase = createClient()

      // Get closed sessions (most recent)
      const { data: sessions } = await supabase
        .from("voting_sessions")
        .select("*")
        .eq("status", "closed")
        .order("voting_ended_at", { ascending: false })
        .limit(1)

      if (sessions && sessions.length > 0) {
        const closedSession = sessions[0]
        setSession(closedSession)

        const { data: votes } = await supabase.from("votes").select("*").eq("session_id", closedSession.id)

        if (votes) {
          const stats = getVoteStats(votes)
          const ranked = getRankedResults(stats)
          setResults(ranked)
        }
      }
      setLoading(false)
    }

    fetchResults()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-600 dark:text-slate-400 text-center">No completed voting sessions yet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0)
  const winners = results.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-2">{session.name}</h1>
          <p className="text-2xl text-slate-600 dark:text-slate-400 mb-4">Final Results</p>
          <p className="text-lg text-slate-600 dark:text-slate-400">Total Votes Cast: {totalVotes}</p>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Winners - Prize Recipients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {winners.map((result, index) => (
              <Card
                key={result.filmId}
                className={`border-2 ${
                  index === 0
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                    : index === 1
                      ? "border-gray-400 bg-gray-50 dark:bg-gray-900"
                      : "border-orange-400 bg-orange-50 dark:bg-orange-900"
                }`}
              >
                <CardHeader>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                    <CardTitle className="text-2xl">Film {result.filmId}</CardTitle>
                    <CardDescription className="text-lg mt-2">{result.voteCount} votes</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium mb-3">Voted by:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {result.voters.map((voter: string) => (
                        <span
                          key={voter}
                          className="inline-block bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono"
                        >
                          {voter}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Rankings</CardTitle>
            <CardDescription>All films ranked by votes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={result.filmId} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      #{index + 1} - Film {result.filmId}
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.voteCount}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(result.voteCount / (results[0]?.voteCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
