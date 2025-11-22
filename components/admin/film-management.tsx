"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Voter {
  id: string
  voter_serial_number: string
  qr_code_token: string
  has_voted: boolean
  voted_at: string | null
}

export default function AdminVoterManagement({ sessionId }: { sessionId: string }) {
  const [voters, setVoters] = useState<Voter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVoters()
  }, [sessionId])

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

  const generateQRCode = (voterToken: string) => {
    const qrUrl = `${window.location.origin}/vote?token=${voterToken}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
  }

  const downloadQRCodes = () => {
    voters.forEach((voter) => {
      const qrUrl = generateQRCode(voter.qr_code_token)
      const link = document.createElement("a")
      link.href = qrUrl
      link.download = `QR_${voter.voter_serial_number}.png`
      link.click()
    })
  }

  if (loading) return <p>Loading voters...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voter Management</CardTitle>
        <CardDescription>Total voters: {voters.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={downloadQRCodes}>Download All QR Codes</Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {voters.map((voter) => (
            <div
              key={voter.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded"
            >
              <div>
                <span className="font-mono font-bold">{voter.voter_serial_number}</span>
                {voter.has_voted && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Voted</span>
                )}
              </div>
              <img
                src={generateQRCode(voter.qr_code_token)}
                alt={`QR Code for ${voter.voter_serial_number}`}
                className="w-16 h-16"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

