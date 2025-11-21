"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Film {
  film_number: number
  title: string
  logline: string
  director: string
  producer: string
  poster_url?: string
}

export default function FilmManagement({ sessionId }: { sessionId: string }) {
  const [films, setFilms] = useState<Film[]>(
    Array(10)
      .fill(null)
      .map((_, i) => ({
        film_number: i + 1,
        title: "",
        logline: "",
        director: "",
        producer: "",
      })),
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchFilms = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("films").select("*").eq("session_id", sessionId).order("film_number")

      if (data && data.length > 0) {
        setFilms(data)
      }
    }

    fetchFilms()
  }, [sessionId])

  const handleFilmChange = (index: number, field: keyof Film, value: string) => {
    const updated = [...films]
    updated[index] = { ...updated[index], [field]: value }
    setFilms(updated)
  }

  const handleSaveFilms = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Delete existing films
      await supabase.from("films").delete().eq("session_id", sessionId)

      // Insert new films
      const filmsData = films.map((film) => ({
        session_id: sessionId,
        ...film,
      }))

      await supabase.from("films").insert(filmsData)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Error saving films:", error)
      alert("Error saving films")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Film Management</CardTitle>
        <CardDescription>Configure the 10 shortlisted films</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {films.map((film, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-slate-50 dark:bg-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Film {film.film_number}</div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={film.title}
                    onChange={(e) => handleFilmChange(index, "title", e.target.value)}
                    placeholder="Film title"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Director</Label>
                  <Input
                    value={film.director}
                    onChange={(e) => handleFilmChange(index, "director", e.target.value)}
                    placeholder="Director name"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Logline</Label>
                <Input
                  value={film.logline}
                  onChange={(e) => handleFilmChange(index, "logline", e.target.value)}
                  placeholder="Film logline"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Producer</Label>
                <Input
                  value={film.producer}
                  onChange={(e) => handleFilmChange(index, "producer", e.target.value)}
                  placeholder="Producer name"
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSaveFilms} disabled={loading} className="w-full">
          {loading ? "Saving..." : saved ? "Saved!" : "Save Films"}
        </Button>
      </CardContent>
    </Card>
  )
}

