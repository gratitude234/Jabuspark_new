// server/api/drill.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { DrillQuestion } from '~/types/models'

type Difficulty = 'easy' | 'mixed' | 'hard'

interface DrillRequestBody {
  docIds?: string[]
  count?: number
  difficulty?: Difficulty
}

interface QuestionRow {
  id: string
  stem: string
  options: string[] | null
  correct: number
  explanation: string | null
  doc_id: string | null
  section_topic: string | null
  section_id: string | null
  citations: any | null
  difficulty: string | null
  topic_tags: string[] | null
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const body = (await readBody<DrillRequestBody>(event).catch(() => ({}))) || {}
  const docIds = Array.isArray(body.docIds) ? body.docIds.filter(Boolean) : []
  const count = body.count && body.count > 0 ? Math.min(body.count, 50) : 10
  const difficulty: Difficulty = body.difficulty ?? 'mixed'

  if (!docIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No document IDs provided for drill.',
    })
  }

  // Base query: questions for these docs only
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
        section_topic,
        section_id,
        citations,
        difficulty,
        topic_tags
      `,
    )
    .in('doc_id', docIds)

  // Optional difficulty filtering
  if (difficulty === 'easy' || difficulty === 'hard') {
    query = query.eq('difficulty', difficulty)
  }
  // "mixed" → no extra filter

  const { data, error } = await query

  if (error) {
    console.error('[drill] Supabase error', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to load questions.',
    })
  }

  const rows = (data || []) as QuestionRow[]

  if (!rows.length) {
    return {
      questions: [] as DrillQuestion[],
      sessionId: null,
    }
  }

  // Shuffle in JS and take `count`
  const shuffled = [...rows].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, count)

  const questions: DrillQuestion[] = picked.map((row) => {
    // citations in your table is jsonb; make sure it's an array if present
    let citations: { docId: string; page: number; span: string }[] = []

    if (Array.isArray(row.citations)) {
      citations = row.citations.map((c: any) => ({
        docId: c.docId ?? row.doc_id ?? '',
        page: Number(c.page ?? 0),
        span: String(c.span ?? ''),
      }))
    }

    return {
      id: row.id,
      stem: row.stem,
      options: row.options ?? [],
      correct: row.correct,
      explanation: row.explanation,
      docId: row.doc_id ?? undefined,
      topic: row.section_topic ?? undefined,
      sectionId: row.section_id ?? undefined,
      answerExplanation: row.explanation,
      citations,
    }
  })

  // We’re not creating drill_sessions yet; frontend treats null sessionId as "no logging"
  return {
    questions,
    sessionId: null,
  }
})
