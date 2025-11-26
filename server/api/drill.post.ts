// server/api/drill.post.ts
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const body = await readBody<{
    docIds?: string[]
    count?: number
    difficulty?: 'easy' | 'mixed' | 'hard'
  }>(event)

  const docIds = (body.docIds || []).filter(Boolean)
  if (!docIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'docIds is required',
    })
  }

  const requestedCount = body.count ?? 10
  const count = Math.max(1, Math.min(requestedCount, 50))
  const difficulty = body.difficulty ?? 'mixed'

  // --- build base query on *public.questions* ---
  let query = client
    .from('questions')
    .select(
      'id, stem, options, correct, explanation, doc_id, section_id, difficulty',
    )
    .in('doc_id', docIds)

  // difficulty filter:
  // - "mixed": no filter (use anything available)
  // - "easy" / "hard": filter to that difficulty
  if (difficulty === 'easy' || difficulty === 'hard') {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

  if (error) {
    console.error('[drill] error loading questions', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  if (!data || data.length === 0) {
    // front-end will show “No questions available yet…”
    return {
      sessionId: null,
      questions: [] as any[],
    }
  }

  // shuffle and take up to `count`
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  // map DB rows to front-end DrillQuestion shape
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

  // create a drill_session (non-critical; failures are logged only)
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
    // still return questions – we don’t block the drill
  }

  return {
    sessionId,
    questions,
  }
})
