"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">TUFA Voting System</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">The Upcoming Filmmakers Award - 1st Edition</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Admin Panel</CardTitle>
                <CardDescription>Manage voting sessions and view results</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Go to Admin</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vote">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Cast Your Vote</CardTitle>
                <CardDescription>Scan your QR code to start voting</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Go to Voting</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/live-results">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Live Results</CardTitle>
                <CardDescription>Watch votes come in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Live</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/final-results">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Final Results</CardTitle>
                <CardDescription>View ranked winners</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Results</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
