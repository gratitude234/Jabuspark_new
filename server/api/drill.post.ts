// server/api/drill.post.ts
import { readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  // Body from frontend:
  // { docIds: string[], count: number, difficulty: 'easy' | 'mixed' | 'hard' }
  const body = await readBody<{
    docIds?: string[]
    count?: number
    difficulty?: 'easy' | 'mixed' | 'hard'
  }>(event)

  const docIds = Array.isArray(body.docIds)
    ? body.docIds.filter(Boolean)
    : []

  const count = Number(body.count) || 10
  const difficulty = body.difficulty || 'mixed'

  if (!docIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No docs selected for drill',
    })
  }

  // --- Fetch questions from public.questions -----------------------------
  // Important: we use the real column names here: doc_id, difficulty, drill_id.
  let query = client
    .from('questions')
    .select(
      'id, stem, options, correct, explanation, citations, doc_id, section_topic, section_id, difficulty',
    )
    .in('doc_id', docIds)
    .is('drill_id', null) // only questions not tied to a past drill

  // For "mixed" we DON'T filter difficulty – we pull from all difficulties.
  if (difficulty !== 'mixed') {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query.limit(count)

  if (error) {
    console.error('[drill] questions query error', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load questions',
    })
  }

  const rows = data || []

  // If there are literally no rows, just return empty; frontend already shows the banner.
  if (!rows.length) {
    return {
      sessionId: null,
      questions: [],
    }
  }

  // --- Shuffle & trim to requested count ---------------------------------
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
  }

  const selected = rows.slice(0, Math.min(count, rows.length))

  // --- Create drill session ----------------------------------------------
  let sessionId: string | null = null

  try {
    sessionId = crypto.randomUUID()
  } catch {
    // Node < 19 fallback if needed
    sessionId = `${user.id}-${Date.now()}`
  }

  try {
    const { error: sessionError } = await client.from('drill_sessions').insert({
      id: sessionId,
      user_id: user.id,
      metadata: {
        docIds,
        count,
        difficulty,
      },
      score: null,
      accuracy: null,
    })

    if (sessionError) {
      console.warn('[drill] failed to create drill_session', sessionError)
      sessionId = null // don’t break the drill; just skip session logging
    }
  } catch (e) {
    console.warn('[drill] unexpected error creating drill_session', e)
    sessionId = null
  }

  // --- Shape questions for frontend --------------------------------------
  const questions = selected.map((row: any) => ({
    id: row.id,
    stem: row.stem,
    options: row.options || [],
    correct: row.correct,
    explanation: row.explanation,
    docId: row.doc_id,
    topic: row.section_topic ?? null,
    sectionId: row.section_id ?? null,
    answerExplanation: row.explanation,
    citations: Array.isArray(row.citations) ? row.citations : [],
  }))

  return {
    sessionId,
    questions,
  }
})
