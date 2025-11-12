"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { connectWallet, switchToBaseTestnet } from "@/lib/blockchain/ethers-integration"

interface WalletConnectProps {
  onConnected?: (address: string) => void
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or a Web3 wallet")
      return
    }

    setConnecting(true)
    try {
      await switchToBaseTestnet()
      const userAddress = await connectWallet()

      setAddress(userAddress)
      setConnected(true)

      if (onConnected) {
        onConnected(userAddress)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet")
    } finally {
      setConnecting(false)
    }
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <span className="ml-auto text-xs text-slate-600 dark:text-slate-400">Base Sepolia</span>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
