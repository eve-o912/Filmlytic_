"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRankedResults, getVoteStats } from "@/lib/utils/voting"

export default function AdminResults({ sessionId }: { sessionId: string }) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      const supabase = createClient()
      const { data: votes } = await supabase.from("votes").select("*").eq("session_id", sessionId)

      if (votes) {
        const stats = getVoteStats(votes)
        const ranked = getRankedResults(stats)
        setResults(ranked)
      }
      setLoading(false)
    }

    fetchResults()

    // Subscribe to vote changes
    const supabase = createClient()
    const channel = supabase
      .channel(`votes-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => {
        fetchResults()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  if (loading) return <p>Loading results...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Results</CardTitle>
        <CardDescription>Real-time vote count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={result.filmId} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-900 dark:text-white">
                  #{index + 1} Film {result.filmId}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{result.voteCount} votes</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded h-2">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${(result.voteCount / (results[0]?.voteCount || 1)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-x-1 flex flex-wrap">
                {result.voters.map((v: string) => (
                  <span key={v} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

