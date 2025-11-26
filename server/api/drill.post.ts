// server/api/drill.post.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface DrillBody {
  docIds?: string[]
  count?: number
  difficulty?: 'easy' | 'mixed' | 'hard'
}

interface RawQuestionRow {
  id: string
  stem: string
  options: string[]
  correct: number
  explanation: string | null
  doc_id: string | null
  difficulty: string | null
  topic_tags?: string[] | null
}

// Simple array shuffle
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const body = (await readBody<DrillBody>(event)) || {}
  const docIds = body.docIds ?? []
  const count = body.count ?? 10
  const difficulty = body.difficulty ?? 'mixed' // kept for metadata only

  if (!Array.isArray(docIds) || docIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one docId is required',
    })
  }

  if (count < 1 || count > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Count must be between 1 and 50',
    })
  }

  // 🔎 Get ALL questions for these docs (NO difficulty filter for now)
  const { data, error } = await client
    .from('questions')
    .select('id, stem, options, correct, explanation, doc_id, difficulty, topic_tags')
    .in('doc_id', docIds)

  if (error) {
    console.error('[api/drill] questions query error', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load questions',
    })
  }

  const rows = (data || []) as RawQuestionRow[]

  if (!rows.length) {
    // Frontend will show the "No questions available yet..." toast
    return {
      sessionId: null,
      questions: [],
    }
  }

  // 🎲 Shuffle & clip to requested count
  const selected = shuffle(rows).slice(0, count)

  const questions = selected.map((q) => ({
    id: q.id,
    stem: q.stem,
    options: q.options || [],
    correct: q.correct,
    explanation: q.explanation,
    docId: q.doc_id,
    topic: (q.topic_tags && q.topic_tags[0]) || null,
    sectionId: null,
    answerExplanation: q.explanation,
    citations: [], // you can wire this up later if you want
  }))

  // Create a drill session (for leaderboard / history)
  const sessionId = crypto.randomUUID()
  const metadata = {
    docIds,
    count,
    difficulty,
  }

  const { error: sessionError } = await client.from('drill_sessions').insert({
    id: sessionId,
    user_id: user.id,
    metadata,
    score: null,
    accuracy: null,
  })

  if (sessionError) {
    console.error('[api/drill] failed to insert drill_session', sessionError)
    // non-fatal – user can still drill
  }

  return {
    sessionId,
    questions,
  }
})
