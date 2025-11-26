// server/api/drill.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

type Difficulty = 'easy' | 'mixed' | 'hard'

interface DrillBody {
  docIds?: string[]
  count?: number
  difficulty?: Difficulty
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const body = (await readBody(event)) as DrillBody

  // --- Basic input sanity checks ---
  const docIds = Array.isArray(body.docIds)
    ? body.docIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
    : []

  if (!docIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No document IDs provided for drill.',
    })
  }

  const count =
    typeof body.count === 'number' && body.count > 0
      ? Math.min(body.count, 50)
      : 10

  const difficulty: Difficulty =
    body.difficulty === 'easy' || body.difficulty === 'hard'
      ? body.difficulty
      : 'mixed'

  // --- Fetch questions for those docs ---
  let query = client
    .from('questions')
    .select(
      `
      id,
      stem,
      options,
      correct,
      explanation,
      doc_id,
      difficulty,
      topic_tags,
      citations
    `,
    )
    .in('doc_id', docIds)

  // Only filter by difficulty if not "mixed"
  if (difficulty !== 'mixed') {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

  if (error) {
    console.error('[drill] Supabase error', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions',
      data: error,
    })
  }

  const questions = data ?? []

  // If nothing came back, just return empty (frontend already shows the red toast)
  if (!questions.length) {
    return {
      sessionId: null,
      questions: [],
    }
  }

  // --- Shuffle and cap to requested count ---
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const limited = shuffled.slice(0, count)

  // For now we skip creating a drill_session row
  // (sessionId=null is fine, the frontend only needs questions to run a drill)
  return {
    sessionId: null,
    questions: limited,
  }
})
