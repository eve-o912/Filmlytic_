"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import VoterFilmSelection from "@/components/voter/film-selection"
import { Card, CardContent } from "@/components/ui/card"

function VoteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [voter, setVoter] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("No QR code token provided")
      setLoading(false)
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    const supabase = createClient()

    // Find voter by QR token
    const { data: voterData, error: voterError } = await supabase
      .from("voters")
      .select("*")
      .eq("qr_code_token", token)
      .single()

    if (voterError || !voterData) {
      setError("Invalid QR code")
      setLoading(false)
      return
    }

    // Check if already voted
    if (voterData.has_voted) {
      setError("You have already voted")
      setLoading(false)
      return
    }

    // Get session details
    const { data: sessionData } = await supabase
      .from("voting_sessions")
      .select("*")
      .eq("id", voterData.session_id)
      .single()

    if (!sessionData || sessionData.status !== "active") {
      setError("Voting session is not active")
      setLoading(false)
      return
    }

    setVoter(voterData)
    setSession(sessionData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Validating...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400 text-center text-lg">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (voter && session) {
    return (
      <VoterFilmSelection
        voterId={voter.id}
        voterSerial={voter.voter_serial_number}
        sessionId={session.id}
        votingEndsAt={session.voting_ends_at}
      />
    )
  }

  return null
}

export default function VotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <VoteContent />
    </Suspense>
  )
}
    

