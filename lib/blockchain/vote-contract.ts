export const FILMLYTIC_VOTES_ABI = [
  {
    type: "function",
    name: "recordVote",
    inputs: [
      { name: "sessionId", type: "uint256" },
      { name: "voterSerial", type: "string" },
      { name: "filmId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getSessionVotes",
    inputs: [{ name: "sessionId", type: "uint256" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "voterSerialNumber", type: "string" },
          { name: "filmId", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "voterAddress", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const

export const FILMLYTIC_VOTES_ADDRESS = process.env.NEXT_PUBLIC_FILMLYTIC_VOTES_ADDRESS || ""
