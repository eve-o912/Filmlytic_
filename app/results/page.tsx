"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FinalResult {
  filmId: number
  voteCount: number
  voters: string[]
  title: string
  director: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<FinalResult[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      const supabase = createClient()

      // Get closed session
      const { data: session } = await supabase
        .from("voting_sessions")
        .select("*")
        .eq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (session) {
        setSessionId(session.id)

        // Get votes
        const { data: votes } = await supabase.from("votes").select("*").eq("session_id", session.id)

        // Get films
        const { data: films } = await supabase.from("films").select("*").eq("session_id", session.id)

        if (votes && films) {
          const grouped: { [key: number]: string[] } = {}
          votes.forEach((vote) => {
            if (!grouped[vote.film_id]) {
              grouped[vote.film_id] = []
            }
            grouped[vote.film_id].push(vote.voter_serial_number)
          })

          const resultsData = Object.entries(grouped)
            .map(([filmId, voters]) => {
              const film = films.find((f) => f.film_number === Number(filmId))
              return {
                filmId: Number(filmId),
                voteCount: voters.length,
                voters: voters.sort(),
                title: film?.title || `Film ${filmId}`,
                director: film?.director || "Unknown",
              }
            })
            .sort((a, b) => b.voteCount - a.voteCount)

          setResults(resultsData)
        }
      }

      setLoading(false)
    }

    fetchResults()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    )
  }

  const topThree = results.slice(0, 3)
  const prizes = ["🥇 1st Prize", "🥈 2nd Prize", "🥉 3rd Prize"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Final Results</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">The Upcoming Filmmakers Award - 1st Edition</p>
        </div>

        {/* Top 3 Winners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topThree.map((result, index) => (
            <Card key={result.filmId} className="border-2 border-yellow-400 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <Badge className="text-lg py-2 px-4 mb-3 bg-yellow-500 text-white">{prizes[index]}</Badge>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{result.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Director: {result.director}</p>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600">{result.voteCount}</div>
                  <div className="text-slate-600 dark:text-slate-400">votes</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Rankings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Complete Rankings</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.filmId}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="text-2xl font-bold text-slate-900 dark:text-white w-12 text-center">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 dark:text-white">{result.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Film {result.filmId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{result.voteCount}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">votes</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            ✓ All votes are permanently recorded on <span className="font-bold">Base blockchain</span> for complete
            transparency and immutability
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            View verification on{" "}
            <a href="https://basescan.org" target="_blank" rel="noreferrer" className="underline">
              BaseScan
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
