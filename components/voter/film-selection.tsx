"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { recordVoteOnBlockchain } from "@/lib/blockchain/client"
import WalletConnect from "@/components/blockchain/wallet-connect"
import { FILMLYTIC_CONTRACT_CONFIG } from "@/lib/blockchain/contract-config"
import Link from "next/link"

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

      if (walletConnected && FILMLYTIC_CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000") {
        try {
          const filmIds = selectedFilms.map((filmId) => {
            const film = films.find((f) => f.id === filmId)
            return film?.film_number || 0
          })

          const txHash = await recordVoteOnBlockchain(voterSerial, filmIds)
          setBlockchainTxHash(txHash)
          setShowBlockchainInfo(true)
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
    <div className="min-h-screen bg-background">
      {/* Background animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 -mx-6 mb-8 px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-foreground hover:text-muted-foreground transition-colors">
            ← Back
          </Link>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cast Your Votes
          </h1>
          <WalletConnect onConnected={(addr) => setWalletConnected(true)} />
        </div>

        {/* Voter Info Card */}
        <div className="mb-8 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-6 items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Voter ID</p>
              <p className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-mono">{voterSerial}</p>
            </div>
            <div className="text-center border-l border-r border-border/50 py-4">
              <p className="text-sm text-muted-foreground mb-1">Votes Selected</p>
              <p className="text-4xl font-black text-accent">{selectedFilms.length}/3</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
              <p className={`text-3xl font-mono font-black ${timeRemaining < 300000 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-primary"}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Films Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {films.map((film) => (
            <Card
              key={film.id}
              className={`cursor-pointer transition-all group border-2 overflow-hidden hover:shadow-2xl ${
                selectedFilms.includes(film.id)
                  ? "border-primary/50 bg-primary/5 ring-2 ring-primary/30 shadow-lg"
                  : "border-border/50 hover:border-primary/30"
              }`}
              onClick={() => toggleFilmSelection(film.id)}
            >
              <CardContent className="p-0 space-y-0">
                {/* Poster Image */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={film.poster_url || `/placeholder.svg?height=300&width=200&query=film+${film.film_number}+poster`}
                    alt={film.title}
                    className={`w-full h-full object-cover transition-transform duration-300 ${selectedFilms.includes(film.id) ? "scale-110" : "group-hover:scale-105"}`}
                  />
                  {selectedFilms.includes(film.id) && (
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-6xl font-black text-white drop-shadow-lg">✓</div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-xs font-bold text-accent-foreground">Film {film.film_number}</p>
                  </div>
                </div>

                {/* Film Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-black text-lg line-clamp-2">{film.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{film.logline}</p>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Director:</span> {film.director}</p>
                    <p><span className="font-semibold text-foreground">Producer:</span> {film.producer}</p>
                  </div>

                  <Button
                    className={`w-full font-bold h-10 transition-all ${
                      selectedFilms.includes(film.id)
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-primary/20"
                    }`}
                  >
                    {selectedFilms.includes(film.id) ? "✓ Selected" : "Select Film"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blockchain note - subtle */}
        {showBlockchainInfo && blockchainTxHash && (
          <div className="mb-8 p-4 rounded-xl border border-green-500/30 bg-green-500/5 backdrop-blur-sm">
            <p className="text-xs text-green-700 dark:text-green-300 text-center">
              ✓ <span className="font-semibold">Recorded on blockchain</span> •{" "}
              <a href={`https://basescan.org/tx/${blockchainTxHash}`} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                View transaction
              </a>
            </p>
          </div>
        )}

        {/* Submit Section */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              setSelectedFilms([])
              window.history.back()
            }}
            variant="outline"
            size="lg"
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitVotes}
            disabled={selectedFilms.length !== 3 || submitting}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all text-primary-foreground font-bold px-8"
          >
            {submitting ? "Submitting..." : `Submit Votes`}
          </Button>
        </div>
      </div>
    </div>
  )
}
