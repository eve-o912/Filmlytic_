"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import VoterQRScanner from "@/components/voter/qr-scanner"
import VoterFilmSelection from "@/components/voter/film-selection"

export default function VotePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [voterId, setVoterId] = useState<string | null>(null)
  const [voterSerial, setVoterSerial] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [votingEndsAt, setVotingEndsAt] = useState<string | null>(null)

  useEffect(() => {
    const qrToken = searchParams.get("token")
    if (qrToken) {
      console.log("[v0] QR token from URL:", qrToken)
      validateVoter(qrToken)
    }
  }, [searchParams])

  const validateVoter = async (qrToken: string) => {
    try {
      const supabase = createClient()
      console.log("[v0] Validating voter with token:", qrToken)

      const { data: voter, error: voterError } = await supabase
        .from("voters")
        .select("*")
        .eq("qr_code_token", qrToken)
        .single()

      console.log("[v0] Voter data:", voter, "Error:", voterError)

      if (!voter) {
        alert("Invalid QR code - voter not found")
        return
      }

      if (voter.has_voted) {
        alert("This QR code has already been used to vote")
        return
      }

      const { data: session, error: sessionError } = await supabase
        .from("voting_sessions")
        .select("*")
        .eq("id", voter.session_id)
        .single()

      console.log("[v0] Session data:", session, "Error:", sessionError)

      if (!session) {
        alert("Voting session not found")
        return
      }

      if (session.status !== "active") {
        alert(`Voting is not currently active. Status: ${session.status}`)
        return
      }

      console.log("[v0] Validation successful")
      setVoterId(voter.id)
      setVoterSerial(voter.voter_serial_number)
      setSessionId(session.id)
      setVotingEndsAt(session.voting_ends_at)
      setSessionActive(true)
    } catch (error) {
      console.error("[v0] Validation error:", error)
      alert("Error validating QR code. Please try again.")
    }
  }

  const handleQRScanned = async (qrToken: string) => {
    console.log("[v0] QR scanned:", qrToken)
    await validateVoter(qrToken)
  }

  if (!voterId) {
    return <VoterQRScanner onScanned={handleQRScanned} />
  }

  return (
    <VoterFilmSelection
      voterId={voterId}
      voterSerial={voterSerial!}
      sessionId={sessionId!}
      votingEndsAt={votingEndsAt!}
    />
  )
}
