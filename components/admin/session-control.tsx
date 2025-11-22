"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FilmManagement from "@/components/admin/film-management"

export default function AdminSessionControl({ currentSession, onSessionChange }: any) {
  const [loading, setLoading] = useState(false)

  const handleStartVoting = async () => {
    if (!currentSession) return

    setLoading(true)
    const supabase = createClient()
    const votingEndsAt = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now

    const { data, error } = await supabase
      .from("voting_sessions")
      .update({
        status: "active",
        voting_started_at: new Date().toISOString(),
        voting_ends_at: votingEndsAt.toISOString(),
      })
      .eq("id", currentSession.id)
      .select()
      .single()

    if (error) {
      console.error("Error starting voting:", error)
      alert("Error starting voting: " + error.message)
    } else {
      onSessionChange(data)
    }
    setLoading(false)
  }

  const handleCloseVoting = async () => {
    if (!currentSession) return

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("voting_sessions")
      .update({ 
        status: "closed",
        voting_ended_at: new Date().toISOString()
      })
      .eq("id", currentSession.id)
      .select()
      .single()

    if (error) {
      console.error("Error closing voting:", error)
      alert("Error closing voting: " + error.message)
    } else {
      onSessionChange(data)
    }
    setLoading(false)
  }

  const handleResetVoting = async () => {
    if (!currentSession) return
    if (!confirm("Reset voting? This will:\n- Set status to pending\n- Clear all votes\n- Reset all voters")) return

    setLoading(true)
    const supabase = createClient()

    // Delete all votes
    await supabase.from("votes").delete().eq("session_id", currentSession.id)

    // Reset all voters
    await supabase
      .from("voters")
      .update({ has_voted: false, voted_at: null })
      .eq("session_id", currentSession.id)

    // Reset session
    const { data, error } = await supabase
      .from("voting_sessions")
      .update({
        status: "pending",
        voting_started_at: null,
        voting_ends_at: null,
        voting_ended_at: null
      })
      .eq("id", currentSession.id)
      .select()
      .single()

    if (error) {
      console.error("Error resetting:", error)
      alert("Error resetting: " + error.message)
    } else {
      onSessionChange(data)
      alert("Session reset successfully!")
    }
    setLoading(false)
  }

  if (!currentSession) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No active session found. Run the setup SQL script in Supabase to create one.
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600"
      case "closed": return "text-red-600"
      default: return "text-yellow-600"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Session Control</CardTitle>
          <CardDescription>Manage voting session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Session: {currentSession.name}
            </p>
            <p className={`text-sm font-semibold ${getStatusColor(currentSession.status)}`}>
              Status: {currentSession.status.toUpperCase()}
            </p>
            {currentSession.voting_started_at && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Started: {new Date(currentSession.voting_started_at).toLocaleString()}
              </p>
            )}
            {currentSession.voting_ends_at && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ends: {new Date(currentSession.voting_ends_at).toLocaleString()}
              </p>
            )}
          </div>

          {currentSession.status === "pending" && (
            <Button 
              onClick={handleStartVoting} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Starting..." : "Start Voting (20 min)"}
            </Button>
          )}

          {currentSession.status === "active" && (
            <Button 
              onClick={handleCloseVoting} 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? "Closing..." : "Close Voting"}
            </Button>
          )}

          {currentSession.status === "closed" && (
            <Button 
              onClick={handleResetVoting} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Resetting..." : "Reset Session"}
            </Button>
          )}
        </CardContent>
      </Card>

      {currentSession.status === "pending" && (
        <FilmManagement sessionId={currentSession.id} />
      )}
    </>
  )
}

