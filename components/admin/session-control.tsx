"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateQRToken, generateVoterSerialNumber } from "@/lib/utils/voting"
import FilmManagement from "@/components/admin/film-management"

export default function AdminSessionControl({ currentSession, onSessionChange }: any) {
  const [sessionName, setSessionName] = useState("TUFA - 1st Edition")
  const [numVoters, setNumVoters] = useState("50")
  const [loading, setLoading] = useState(false)

  const handleCreateSession = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Create session
      const { data: session } = await supabase
        .from("voting_sessions")
        .insert({
          name: sessionName,
          status: "pending",
          total_films: 10,
        })
        .select()
        .single()

      if (session) {
        // Generate voters
        const votersData = Array.from({ length: Number.parseInt(numVoters) }, (_, i) => ({
          session_id: session.id,
          voter_serial_number: generateVoterSerialNumber(i),
          qr_code_token: generateQRToken(),
          has_voted: false,
        }))

        await supabase.from("voters").insert(votersData)

        onSessionChange(session)
        alert(`Session created with ${numVoters} voters!`)
      }
    } catch (error) {
      console.error("Error creating session:", error)
      alert("Error creating session")
    } finally {
      setLoading(false)
    }
  }

  const handleStartVoting = async () => {
    if (!currentSession) return

    const supabase = createClient()
    const votingEndsAt = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now

    await supabase
      .from("voting_sessions")
      .update({
        status: "active",
        voting_started_at: new Date(),
        voting_ends_at: votingEndsAt,
      })
      .eq("id", currentSession.id)

    onSessionChange({ ...currentSession, status: "active", voting_started_at: new Date() })
  }

  const handleCloseVoting = async () => {
    if (!currentSession) return

    const supabase = createClient()
    await supabase.from("voting_sessions").update({ status: "closed" }).eq("id", currentSession.id)

    onSessionChange({ ...currentSession, status: "closed" })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Session Control</CardTitle>
          <CardDescription>Manage voting sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentSession ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., TUFA - 1st Edition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-voters">Number of Voters</Label>
                <Input
                  id="num-voters"
                  type="number"
                  value={numVoters}
                  onChange={(e) => setNumVoters(e.target.value)}
                  min="1"
                />
              </div>

              <Button onClick={handleCreateSession} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Session"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Session: {currentSession.name}</p>
                <p
                  className={`text-sm ${
                    currentSession.status === "active"
                      ? "text-green-600"
                      : currentSession.status === "closed"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  Status: {currentSession.status.toUpperCase()}
                </p>
              </div>

              {currentSession.status === "pending" && (
                <Button onClick={handleStartVoting} className="w-full bg-green-600 hover:bg-green-700">
                  Start Voting (20 min)
                </Button>
              )}

              {currentSession.status === "active" && (
                <Button onClick={handleCloseVoting} className="w-full bg-red-600 hover:bg-red-700">
                  Close Voting
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {currentSession && currentSession.status === "pending" && <FilmManagement sessionId={currentSession.id} />}
    </>
  )
}
