// server/api/leaderboard.get.ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (_event) => {
  // Simple stub for now – no leaderboard data yet.
  // This keeps the frontend happy (it expects an array).
  return []
})
