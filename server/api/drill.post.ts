// server/api/drill.post.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

type Difficulty = 'easy' | 'mixed' | 'hard'

interface DrillBody {
  docIds?: string[]
  count?: number
  difficulty?: Difficulty
}

export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const body = await readBody<DrillBody>(event)

  const docIds = (body.docIds || []).filter(Boolean)
  if (!docIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'docIds is required',
    })
  }

  const requestedCount = body.count ?? 10
  const count = Math.max(1, Math.min(requestedCount, 50))
  const difficulty: Difficulty = body.difficulty ?? 'mixed'

  // ----- load questions from public.questions -----
  let query = client
    .from('questions')
    .select(
      'id, stem, options, correct, explanation, doc_id, section_id, difficulty',
    )
    .in('doc_id', docIds)

  // "mixed" = no filter. "easy"/"hard" = filter.
  if (difficulty === 'easy' || difficulty === 'hard') {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

  if (error) {
    console.error('[drill] Supabase error loading questions', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  if (!data || data.length === 0) {
    // No questions yet – front-end will show the “No questions available…” toast
    return {
      sessionId: null,
      questions: [] as any[],
    }
  }

  // Shuffle and take up to `count`
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  // Map DB rows to DrillQuestion shape expected by frontend
  const questions = selected.map((q) => ({
    id: q.id,
    stem: q.stem,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    docId: q.doc_id,
    topic: null,
    sectionId: q.section_id ?? null,
    citations: [] as any[],
  }))

  // Create a drill_session row (non-critical: failure is logged but doesn’t break drill)
  const sessionId = crypto.randomUUID()
  const metadata = {
    docIds,
    count: questions.length,
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
    console.warn('[drill] failed to create drill_session', sessionError)
    // Still return questions; we just lose analytics for this run.
  }

  return {
    sessionId,
    questions,
  }
})
