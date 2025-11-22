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
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("voting_sessions")
      .select("*")
      .order("created_at", { ascending: false })

    setSessions(data || [])
    
    // Auto-select first active session, or first session
    const activeSession = data?.find(s => s.status === "active")
    setSelectedSession(activeSession || data?.[0] || null)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg animate-glow">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Filmlytic
            </h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/live-display" target="_blank">
              <Button className="bg-gradient-to-r from-secondary to-accent hover:shadow-lg text-secondary-foreground font-bold">
                📊 Live
              </Button>
            </Link>
            <Link href="/test-vote">
              <Button variant="outline">🧪 Test</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">← Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">Manage voting sessions and monitor results</p>
        </div>

        {/* Session Selector */}
        {sessions.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Select Session</h3>
                  <div className="flex gap-2 flex-wrap">
                    {sessions.map((session) => (
                      <Button
                        key={session.id}
                        variant={selectedSession?.id === session.id ? "default" : "outline"}
                        onClick={() => setSelectedSession(session)}
                        className="relative"
                      >
                        <span className="font-mono">{session.name}</span>
                        <span className={`ml-2 text-xs ${
                          session.status === "active" ? "text-green-400" :
                          session.status === "closed" ? "text-red-400" :
                          "text-yellow-400"
                        }`}>
                          {session.status === "active" ? "🟢" : 
                           session.status === "closed" ? "🔴" : "🟡"}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={fetchSessions}
                  variant="outline"
                  size="sm"
                >
                  🔄 Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSession ? (
          <Tabs defaultValue="session" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50">
              <TabsTrigger value="session" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                ⚙️ Session
              </TabsTrigger>
              <TabsTrigger value="voters" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                👥 Voters
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                📊 Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="session" className="space-y-6">
              <AdminSessionControl 
                currentSession={selectedSession} 
                onSessionChange={(updated: any) => {
                  setSelectedSession(updated)
                  fetchSessions() // Refresh list
                }}
              />
            </TabsContent>

            <TabsContent value="voters" className="space-y-6">
              <AdminVoterManagement sessionId={selectedSession.id} />
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <AdminResults sessionId={selectedSession.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No sessions found</p>
              <p className="text-sm text-muted-foreground">
                Run the setup SQL script in Supabase to create your first session
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

