// server/api/drill.post.ts
import { serverSupabaseServiceRole } from '#supabase/server'

type Difficulty = 'easy' | 'mixed' | 'hard'

interface DrillRequestBody {
  docIds: string[]
  count: number
  difficulty?: Difficulty
}

export default defineEventHandler(async (event) => {
  const body = await readBody<DrillRequestBody>(event)

  const rawDocIds = Array.isArray(body.docIds) ? body.docIds : []
  const docIds = rawDocIds
    .filter((id) => typeof id === 'string')
    .map((id) => id.trim())
    .filter(Boolean)

  const count = Number(body.count) || 10
  const difficulty: Difficulty = (body.difficulty as Difficulty) || 'mixed'

  console.log('[api/drill] incoming body', body)
  console.log('[api/drill] docIds', docIds, 'count', count, 'difficulty', difficulty)

  if (!docIds.length) {
    console.log('[api/drill] no docIds provided – returning empty')
    return { sessionId: null, questions: [] }
  }

  const client = await serverSupabaseServiceRole(event)

  // ---------------------
  // 1) MAIN QUERY
  // ---------------------
  let query = client
    .from('questions')
    .select(
      `
      id,
      stem,
      options,
      correct,
      explanation,
      citations,
      doc_id,
      section_topic,
      section_id,
      difficulty
    `,
    )
    .in('doc_id', docIds)
    .is('drill_id', null)

  // For mixed we *don’t* filter by difficulty
  if (difficulty === 'easy' || difficulty === 'hard') {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

  console.log('[api/drill] main query result', {
    error,
    rowCount: data?.length ?? 0,
  })

  if (error) {
    console.error('[api/drill] error loading questions', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load questions',
    })
  }

  let rows = data || []

  // ---------------------
  // 2) FALLBACK QUERY
  // ---------------------
  if (!rows.length) {
    console.warn(
      '[api/drill] main query returned 0 rows. Running fallback query without filters (except doc_id)…',
    )

    const { data: fallbackData, error: fallbackError } = await client
      .from('questions')
      .select(
        `
        id,
        stem,
        options,
        correct,
        explanation,
        citations,
        doc_id,
        section_topic,
        section_id,
        difficulty
      `,
      )
      .in('doc_id', docIds)

    console.log('[api/drill] fallback result', {
      error: fallbackError,
      rowCount: fallbackData?.length ?? 0,
    })

    if (!fallbackError && fallbackData && fallbackData.length) {
      rows = fallbackData
    }
  }

  // Still nothing? tell the frontend there really are no questions.
  if (!rows.length) {
    console.log(
      '[api/drill] no questions found even after fallback. Returning empty.',
    )
    return { sessionId: null, questions: [] }
  }

  // ---------------------
  // 3) RANDOMISE + LIMIT
  // ---------------------
  const shuffled = [...rows].sort(() => Math.random() - 0.5)
  const limited = shuffled.slice(0, count)

  const questions = limited.map((q) => ({
    id: q.id,
    stem: q.stem,
    options: q.options || [],
    correct: q.correct,
    explanation: q.explanation,
    docId: q.doc_id,
    topic: q.section_topic,
    sectionId: q.section_id,
    answerExplanation: q.explanation,
    citations: Array.isArray(q.citations) ? q.citations : [],
  }))

  console.log('[api/drill] returning', {
    questionCount: questions.length,
  })

  // We’re not logging sessions yet, so leave sessionId null
  return {
    sessionId: null,
    questions,
  }
})
