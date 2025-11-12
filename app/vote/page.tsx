"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
      validateVoter(qrToken)
    }
  }, [searchParams])

  const validateVoter = async (qrToken: string) => {
    const supabase = createClient()

    const { data: voter } = await supabase.from("voters").select("*").eq("qr_code_token", qrToken).single()

    if (voter && !voter.has_voted) {
      const { data: session } = await supabase.from("voting_sessions").select("*").eq("id", voter.session_id).single()

      if (session && session.status === "active") {
        setVoterId(voter.id)
        setVoterSerial(voter.voter_serial_number)
        setSessionId(session.id)
        setVotingEndsAt(session.voting_ends_at)
        setSessionActive(true)
      } else {
        alert("Voting is not currently active")
      }
    } else {
      alert("Invalid QR code or already voted")
    }
  }

  const handleQRScanned = async (qrToken: string) => {
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
