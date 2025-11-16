export const FILMLYTIC_CONTRACT_CONFIG = {
  // Base Sepolia testnet address (update after deployment)
  address: "0x1d2fe923a55b0d195baaee6da329229a2d55c165" as `0x${string}`,

  // Complete contract ABI
  abi: [
    {
      type: "constructor",
      inputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "VoteRecorded",
      inputs: [
        {
          name: "sessionId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "voterSerial",
          type: "string",
          indexed: false,
          internalType: "string",
        },
        { name: "filmId", type: "uint256", indexed: false, internalType: "uint256" },
        {
          name: "timestamp",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "voterAddress",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "function",
      name: "createSession",
      inputs: [
        { name: "sessionId", type: "uint256", internalType: "uint256" },
        { name: "durationMinutes", type: "uint256", internalType: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "endSession",
      inputs: [{ name: "sessionId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "filmVoteCounts",
      inputs: [
        { name: "", type: "uint256", internalType: "uint256" },
        { name: "", type: "uint256", internalType: "uint256" },
      ],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getFilmVoteCount",
      inputs: [
        { name: "sessionId", type: "uint256", internalType: "uint256" },
        { name: "filmId", type: "uint256", internalType: "uint256" },
      ],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSessionVotes",
      inputs: [{ name: "sessionId", type: "uint256", internalType: "uint256" }],
      outputs: [
        {
          name: "",
          type: "tuple[]",
          internalType: "struct FilmlyticVotes.Vote[]",
          components: [
            {
              name: "voterSerialNumber",
              type: "string",
              internalType: "string",
            },
            { name: "filmId", type: "uint256", internalType: "uint256" },
            { name: "timestamp", type: "uint256", internalType: "uint256" },
            { name: "voterAddress", type: "address", internalType: "address" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "recordVote",
      inputs: [
        { name: "sessionId", type: "uint256", internalType: "uint256" },
        { name: "voterSerial", type: "string", internalType: "string" },
        { name: "filmId", type: "uint256", internalType: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "voterHasVoted",
      inputs: [{ name: "", type: "string", internalType: "string" }],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "votingSessions",
      inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      outputs: [
        { name: "sessionId", type: "uint256", internalType: "uint256" },
        { name: "isActive", type: "bool", internalType: "bool" },
        { name: "startTime", type: "uint256", internalType: "uint256" },
        { name: "endTime", type: "uint256", internalType: "uint256" },
        { name: "totalVotes", type: "uint256", internalType: "uint256" },
      ],
      stateMutability: "view",
    },
  ] as const,
}
