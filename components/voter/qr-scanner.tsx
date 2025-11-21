"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    jsQR: any
  }
}

export default function VoterQRScanner({ onScanned }: { onScanned: (token: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(true)
  const [manualInput, setManualInput] = useState("")
  const [jsQRReady, setJsQRReady] = useState(false)

  // Load jsQR library
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"
    script.onload = () => setJsQRReady(true)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!jsQRReady) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          // Start scanning after video is ready
          videoRef.current.onloadedmetadata = () => {
            startScanning()
          }
        }
      } catch (err) {
        setError("Camera access denied. Please allow camera permissions or enter QR code manually.")
        setScanning(false)
      }
    }

    const startScanning = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const scanFrame = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          const code = window.jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            console.log("[v0] QR Code detected:", code.data)
            onScanned(code.data)
            return
          }
        }
        if (scanning) {
          requestAnimationFrame(scanFrame)
        }
      }

      scanFrame()
    }

    startCamera()

    return () => {
      setScanning(false)
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [jsQRReady, scanning, onScanned])

  const handleManualEntry = () => {
    if (manualInput.trim()) {
      console.log("[v0] Manual entry:", manualInput)
      onScanned(manualInput.trim())
      setManualInput("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center p-4 relative">
      {/* Background animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Filmlytic
            </CardTitle>
            <CardDescription className="text-base mt-2">Scan your ticket QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Scanner */}
            <div className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-primary/30">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              {/* Scanner crosshair overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg shadow-lg shadow-primary/50" />
                <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-10 right-10 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-10 left-10 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Manual Entry Fallback */}
            <div className="space-y-3 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center font-semibold">Can't scan? Enter manually</p>
              <input
                type="text"
                placeholder="Enter QR token"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualEntry()}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleManualEntry}
                disabled={!manualInput.trim()}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all font-bold"
              >
                Submit Token
              </Button>
            </div>

            {/* Scanning Status */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground animate-pulse">
                {scanning && jsQRReady ? "🔴 Scanning..." : "Initializing..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
