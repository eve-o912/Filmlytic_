// Utility functions for voting system

export function generateVoterSerialNumber(index: number): string {
  return `X${String(index + 1).padStart(3, "0")}`
}

export function generateQRToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getVoteStats(votes: Array<{ film_id: number; voter_serial_number: string }>) {
  const stats: Record<number, Array<string>> = {}

  for (let i = 1; i <= 10; i++) {
    stats[i] = []
  }

  votes.forEach((vote) => {
    if (stats[vote.film_id]) {
      stats[vote.film_id].push(vote.voter_serial_number)
    }
  })

  return stats
}

export function getRankedResults(stats: Record<number, Array<string>>) {
  return Object.entries(stats)
    .map(([filmId, voters]) => ({
      filmId: Number.parseInt(filmId),
      voteCount: voters.length,
      voters,
    }))
    .sort((a, b) => b.voteCount - a.voteCount)
}
