"use client"

import { createWalletClient, custom } from "viem"
import { base } from "viem/chains"
import { FILMLYTIC_VOTES_ABI } from "./vote-contract"

let walletClient: any = null

export async function getWalletClient() {
  if (typeof window === "undefined") return null
  if (!window.ethereum) {
    throw new Error("MetaMask or Web3 wallet not installed")
  }

  if (!walletClient) {
    walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
    })
  }

  return walletClient
}

export async function switchToBaseNetwork() {
  if (typeof window === "undefined") return

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    })
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2105",
            chainName: "Base",
            rpcUrls: ["https://mainnet.base.org"],
            nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      })
    }
  }
}

export async function recordVoteOnBlockchain(
  sessionId: string,
  voterSerial: string,
  filmId: number,
  contractAddress: string,
): Promise<string> {
  const client = await getWalletClient()
  if (!client) throw new Error("Wallet not available")

  const [address] = await client.getAddresses()

  const hash = await client.writeContract({
    account: address,
    address: contractAddress as `0x${string}`,
    abi: FILMLYTIC_VOTES_ABI,
    functionName: "recordVote",
    args: [BigInt(sessionId), voterSerial, BigInt(filmId)],
  })

  return hash
}
