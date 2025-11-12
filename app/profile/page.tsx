"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminSessionControl from "@/components/admin/session-control"
import AdminVoterManagement from "@/components/admin/voter-management"
import AdminResults from "@/components/admin/admin-results"
import Link from "next/link"

export default function ProfilePage() {
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
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Filmlytic
            </h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/live-display" target="_blank">
              <Button variant="outline" size="sm">
                📊 Live Display
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage voting sessions, voters, and view live results</p>
        </div>

        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="session">Session Control</TabsTrigger>
            <TabsTrigger value="voters">Voter Management</TabsTrigger>
            <TabsTrigger value="results">Live Results</TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="space-y-6">
            <AdminSessionControl currentSession={activeSession} onSessionChange={setActiveSession} />
          </TabsContent>

          <TabsContent value="voters" className="space-y-6">
            {activeSession ? (
              <AdminVoterManagement sessionId={activeSession.id} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-slate-600 dark:text-slate-400 text-center">
                    No active session. Create one in Session Control to start.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {activeSession ? (
              <AdminResults sessionId={activeSession.id} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-slate-600 dark:text-slate-400 text-center">
                    No active session. Create one in Session Control to see results.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
