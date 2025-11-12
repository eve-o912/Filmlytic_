"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import AdminSessionControl from "@/components/admin/session-control"
import AdminVoterManagement from "@/components/admin/voter-management"
import AdminResults from "@/components/admin/admin-results"

export default function AdminPage() {
  const [activeSession, setActiveSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveSession = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("voting_sessions").select("*").eq("status", "active").limit(1).single()

      setActiveSession(data)
      setLoading(false)
    }

    fetchActiveSession()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <div className="flex gap-2">
            <a
              href="/live-display"
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              rel="noreferrer"
            >
              Live Display
            </a>
            <a
              href="/results"
              target="_blank"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              rel="noreferrer"
            >
              Final Results
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AdminSessionControl currentSession={activeSession} onSessionChange={setActiveSession} />
          </div>

          <div className="lg:col-span-2">
            {activeSession ? (
              <div className="space-y-6">
                <AdminVoterManagement sessionId={activeSession.id} />
                <AdminResults sessionId={activeSession.id} />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-slate-600 dark:text-slate-400 text-center">
                    No active voting session. Create one to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
