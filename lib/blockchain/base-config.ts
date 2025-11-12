import { createPublicClient, http } from "viem"
import { baseSepolia } from "viem/chains"

export const CHAIN_ID = 84532 // Base Sepolia testnet
export const CHAIN_NAME = "Base Sepolia Testnet"
export const RPC_URL = "https://sepolia.base.org"
export const BLOCK_EXPLORER = "https://sepolia.basescan.org"

export const baseChain = baseSepolia

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
})

export const baseConfig = {
  chainId: CHAIN_ID,
  rpcUrl: RPC_URL,
  chainName: CHAIN_NAME,
  symbol: "ETH",
}
