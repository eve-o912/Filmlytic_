import { ethers } from "ethers"

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

export const recordVoteOnBlockchain = async (
  contractAddress: string,
  contractABI: any,
  voterId: string,
  filmIds: number[],
) => {
  try {
    const signer = await getSigner()
    const contract = new ethers.Contract(contractAddress, contractABI, signer)

    // Record vote on blockchain
    const tx = await contract.recordVote(voterId, filmIds)
    const receipt = await tx.wait()

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockExplorerUrl: `https://sepolia.basescan.org/tx/${receipt.hash}`,
    }
  } catch (error) {
    console.error("Error recording vote on blockchain:", error)
    throw error
  }
}
