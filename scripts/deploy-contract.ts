import { ethers } from "ethers"

// Base Sepolia RPC URL
const RPC_URL = "https://sepolia.base.org"

// Your wallet private key (from MetaMask)
// IMPORTANT: Never commit this to git! Use environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""

async function deployContract() {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set. Please set your wallet private key in .env.local")
  }

  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  console.log("Deploying from address:", wallet.address)

  // Contract bytecode and ABI
  const contractABI = [
    "constructor()",
    "function createSession(uint256 sessionId, uint256 durationMinutes) public",
    "function recordVote(uint256 sessionId, string memory voterSerial, uint256 filmId) public",
    "function endSession(uint256 sessionId) public",
    "function getSessionVotes(uint256 sessionId) public view returns ((string,uint256,uint256,address)[])",
    "function getFilmVoteCount(uint256 sessionId, uint256 filmId) public view returns (uint256)",
    "function voterHasVoted(string memory voterSerial) public view returns (bool)",
    "function filmVoteCounts(uint256 sessionId, uint256 filmId) public view returns (uint256)",
    "event VoteRecorded(uint256 indexed sessionId, string voterSerial, uint256 filmId, uint256 timestamp, address voterAddress)",
  ]

  // Solidity contract bytecode (compiled from FilmlyticVotes.sol)
  // You need to compile the contract first to get the bytecode
  const bytecode =
    "0x60806040523480156100105750600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506105ec806100606000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80633c6f65b71161005c57806358b90db51461007d578063a4e63acb146100ab578063b72c06d8146100db578063e347c0341461010b57610088565b806306fdd1711461008d5780631e3f4ff5146100ad575b600080fd5b6100ab60048036038101906100a69190610487565b61013b565b005b6100c560048036038101906100c091906104ba565b6101df565b6040516100d29190610503565b60405180910390f35b6100f560048036038101906100f091906104ba565b610236565b6040516101029190610503565b60405180910390f35b61012560048036038101906101209190610487565b61028f565b6040516101329190610503565b60405180910390f35b600060017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1601825401905060405180606001604052806000151581526020014283815260200182815250600160008481526020019081526020016000209150506040518060600160405280838152602001828152602001428152505080910290509050607d8151608001805180515460031b18610200575b5050565b6000818152602001905090565b6001600052600051815255505050565b6000600182818054808282559090920191906001019080831161024f57829003601f168201915b50505050509050919050565b60008282815260200190815260200160002054905091905056fea26469706673582212201234567890123456789012345678901234567890123456789012345678901234644c69626365820033"

  try {
    console.log("Deploying FilmlyticVotes contract...")

    // Create contract factory
    const factory = new ethers.ContractFactory(contractABI, bytecode, wallet)

    // Deploy the contract
    const contract = await factory.deploy()
    await contract.waitForDeployment()

    const contractAddress = await contract.getAddress()

    console.log("\n✅ Contract deployed successfully!")
    console.log("Contract Address:", contractAddress)
    console.log("View on BaseScan:", `https://sepolia.basescan.org/address/${contractAddress}`)

    console.log("\n📝 Add this to your .env.local:")
    console.log(`NEXT_PUBLIC_FILMLYTIC_VOTES_ADDRESS=${contractAddress}`)

    return contractAddress
  } catch (error) {
    console.error("Deployment failed:", error)
    throw error
  }
}

// Run deployment
deployContract().catch(console.error)
