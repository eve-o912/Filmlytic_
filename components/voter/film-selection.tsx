"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { recordVoteOnBlockchain } from "@/lib/blockchain/client"
import WalletConnect from "@/components/blockchain/wallet-connect"

interface Film {
  id: string
  film_number: number
  title: string
  logline: string
  director: string
  producer: string
  poster_url?: string
}

export default function VoterFilmSelection({
  voterId,
  voterSerial,
  sessionId,
  votingEndsAt,
}: {
  voterId: string
  voterSerial: string
  sessionId: string
  votingEndsAt: string
}) {
  const router = useRouter()
  const [selectedFilms, setSelectedFilms] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [films, setFilms] = useState<Film[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [loading, setLoading] = useState(true)
  const [walletConnected, setWalletConnected] = useState(false)
  const [blockchainTxHash, setBlockchainTxHash] = useState<string>("")
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false)

  useEffect(() => {
    const fetchFilms = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("films").select("*").eq("session_id", sessionId).order("film_number")

      setFilms(data || [])
      setLoading(false)
    }

    fetchFilms()
  }, [sessionId])

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime()
      const end = new Date(votingEndsAt).getTime()
      const remaining = Math.max(0, end - now)
      setTimeRemaining(remaining)

      if (remaining === 0) {
        alert("Voting has ended!")
        router.push("/")
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [votingEndsAt, router])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const toggleFilmSelection = (filmId: string) => {
    if (selectedFilms.includes(filmId)) {
      setSelectedFilms(selectedFilms.filter((id) => id !== filmId))
    } else {
      if (selectedFilms.length < 3) {
        setSelectedFilms([...selectedFilms, filmId])
      }
    }
  }

  const handleSubmitVotes = async () => {
    if (selectedFilms.length !== 3) {
      alert("Please select exactly 3 films")
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    try {
      const votesData = selectedFilms.map((filmId) => {
        const film = films.find((f) => f.id === filmId)
        return {
          session_id: sessionId,
          voter_serial_number: voterSerial,
          film_id: film?.film_number || 0,
        }
      })

      // Save to Supabase first
      const { error: voteError } = await supabase.from("votes").insert(votesData)
      if (voteError) throw voteError

      const { error: voterError } = await supabase
        .from("voters")
        .update({ has_voted: true, voted_at: new Date() })
        .eq("id", voterId)
      if (voterError) throw voterError

      if (walletConnected) {
        try {
          const contractAddress = process.env.NEXT_PUBLIC_FILMLYTIC_VOTES_ADDRESS
          if (contractAddress) {
            const txHash = await recordVoteOnBlockchain(
              sessionId,
              voterSerial,
              selectedFilms[0] as unknown as number,
              contractAddress,
            )
            setBlockchainTxHash(txHash)
            setShowBlockchainInfo(true)
          }
        } catch (error) {
          console.error("Blockchain recording failed:", error)
          // Votes already saved to Supabase, blockchain is optional
        }
      }

      alert(
        `Thank you for voting! Your voter ID: ${voterSerial}\n\nLook for your ID on the big screen to confirm your votes were counted.`,
      )
      router.push("/")
    } catch (error) {
      console.error("Error submitting votes:", error)
      alert("Error submitting votes. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p>Loading films...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cast Your Votes</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                Your Voter ID:{" "}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{voterSerial}</span>
              </p>
            </div>
            <WalletConnect
              onConnected={(addr) => {
                setWalletConnected(true)
              }}
            />
          </div>
          <div
            className={`text-2xl font-bold font-mono mb-4 ${timeRemaining < 300000 ? "text-red-600" : "text-slate-600"}`}
          >
            Time Remaining: {formatTime(timeRemaining)}
          </div>
          <p className="text-slate-600 dark:text-slate-400">Select exactly 3 films you feel are your favorites</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {films.map((film) => (
            <Card
              key={film.id}
              className={`cursor-pointer transition-all ${
                selectedFilms.includes(film.id)
                  ? "ring-2 ring-blue-600 dark:ring-blue-400 shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => toggleFilmSelection(film.id)}
            >
              <CardContent className="p-4 space-y-4">
                <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded overflow-hidden">
                  <img
                    src={
                      film.poster_url || `/placeholder.svg?height=300&width=200&query=film+${film.film_number}+poster`
                    }
                    alt={film.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedFilms.includes(film.id) && (
                    <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center">
                      <div className="text-4xl text-white font-bold">✓</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{film.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{film.logline}</p>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>
                      <strong>Director:</strong> {film.director}
                    </p>
                    <p>
                      <strong>Producer:</strong> {film.producer}
                    </p>
                  </div>
                </div>

                <Button className="w-full" variant={selectedFilms.includes(film.id) ? "default" : "outline"}>
                  {selectedFilms.includes(film.id) ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showBlockchainInfo && blockchainTxHash && (
          <div className="mt-8 p-4 bg-green-100 dark:bg-green-900 rounded-lg border border-green-300 dark:border-green-700 mb-6">
            <p className="text-sm text-green-900 dark:text-green-100 mb-2">✓ Votes recorded on Base blockchain!</p>
            <p className="text-xs font-mono text-green-800 dark:text-green-200 break-all">
              Tx Hash:{" "}
              <a
                href={`https://basescan.org/tx/${blockchainTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
              >
                {blockchainTxHash}
              </a>
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              setSelectedFilms([])
              window.history.back()
            }}
            variant="outline"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitVotes}
            disabled={selectedFilms.length !== 3 || submitting}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? "Submitting..." : `Submit Votes (${selectedFilms.length}/3)`}
          </Button>
        </div>
      </div>
    </div>
  )
}
