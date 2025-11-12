import { ethers } from "ethers"
import { FILMLYTIC_CONTRACT_CONFIG } from "./contract-config"

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed")
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    return accounts[0]
  } catch (error) {
    throw new Error("User rejected wallet connection")
  }
}

export const switchToBaseTestnet = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed")

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x14a34" }], // 84532 in hex
    })
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, add it
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x14a34",
            chainName: "Base Sepolia",
            rpcUrls: ["https://sepolia.base.org"],
            blockExplorerUrls: ["https://sepolia.basescan.org"],
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
          },
        ],
      })
    } else {
      throw error
    }
  }
}

export const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not installed")
  return new ethers.BrowserProvider(window.ethereum)
}

export const getSigner = async () => {
  const provider = getProvider()
  return provider.getSigner()
}

export const recordVoteOnBlockchain = async (voterId: string, filmIds: number[]) => {
  try {
    const signer = await getSigner()
    const contract = new ethers.Contract(FILMLYTIC_CONTRACT_CONFIG.address, FILMLYTIC_CONTRACT_CONFIG.abi, signer)

    // Record each vote individually
    for (const filmId of filmIds) {
      const tx = await contract.recordVote(1, voterId, filmId)
      const receipt = await tx.wait()
      console.log(`Vote recorded for film ${filmId}:`, receipt.hash)
    }

    return {
      success: true,
      blockExplorerUrl: `https://sepolia.basescan.org/address/${FILMLYTIC_CONTRACT_CONFIG.address}`,
    }
  } catch (error) {
    console.error("Error recording vote on blockchain:", error)
    throw error
  }
}
