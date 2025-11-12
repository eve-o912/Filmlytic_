"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminVoterManagement({ sessionId }: { sessionId: string }) {
  const [voters, setVoters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVoters = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("voters")
        .select("*")
        .eq("session_id", sessionId)
        .order("voter_serial_number")

      setVoters(data || [])
      setLoading(false)
    }

    fetchVoters()

    // Subscribe to changes
    const supabase = createClient()
    const channel = supabase
      .channel(`voters-${sessionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "voters" }, (payload) => {
        setVoters((prev) => prev.map((v) => (v.id === payload.new.id ? payload.new : v)))
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  const handleDownloadQRCodes = () => {
    const csv = voters.map((v) => `${v.voter_serial_number},${v.qr_code_token}`).join("\n")

    const element = document.createElement("a")
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent("Voter ID,QR Token\n" + csv)}`)
    element.setAttribute("download", "qr-codes.csv")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) return <p>Loading voters...</p>

  const votedCount = voters.filter((v) => v.has_voted).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voter Management</CardTitle>
        <CardDescription>
          {votedCount} / {voters.length} voters have cast their votes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownloadQRCodes} className="w-full">
          Download QR Codes
        </Button>

        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {voters.slice(0, 20).map((voter) => (
              <div
                key={voter.id}
                className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm"
              >
                <span className="font-mono font-bold text-slate-900 dark:text-white">{voter.voter_serial_number}</span>
                <span className={voter.has_voted ? "text-green-600" : "text-slate-500"}>
                  {voter.has_voted ? "✓ Voted" : "Pending"}
                </span>
              </div>
            ))}
            {voters.length > 20 && (
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center pt-2">
                +{voters.length - 20} more voters
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
