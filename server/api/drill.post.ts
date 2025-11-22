// Drill sessions now read from pre-generated question pools so students get consistent questions per document batch.
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import type { DrillQuestion } from '~/types/models'
import { createServiceClient } from '~/server/utils/supabase'

interface DrillRequestBody {
  docIds?: string[]
  count?: number
  difficulty?: string
}

const DEFAULT_COUNT = 10
const MIN_COUNT = 1
const MAX_COUNT = 50

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const body = await readBody<DrillRequestBody>(event)
  const difficulty = normalizeDifficulty(body?.difficulty)
  const docIds = normalizeDocIds(body?.docIds)
  if (!docIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'Select at least one document.' })
  }

  const requestedCount = typeof body?.count === 'number' ? body.count : DEFAULT_COUNT
  const targetCount = clamp(requestedCount, MIN_COUNT, MAX_COUNT)

  const supabase = createServiceClient()

  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'ready')
    .in('id', docIds)

  if (docsError) {
    throw createError({ statusCode: 500, statusMessage: docsError.message })
  }
  if (!docs?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No ready documents matched your selection.',
    })
  }
  if (docs.length !== docIds.length) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Some selected documents are not accessible or ready yet.',
    })
  }

  const verifiedDocIds = docs.map((doc) => doc.id)

  const { data: rows, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .in('document_id', verifiedDocIds)

  if (questionsError) {
    throw createError({ statusCode: 500, statusMessage: questionsError.message })
  }
  if (!rows?.length) {
    throw createError({
      statusCode: 404,
      statusMessage:
        'No questions have been added yet for this document. Please try again later or choose another document.',
    })
  }

  let questionRows = rows ?? []
  if (difficulty !== 'mixed') {
    const filtered = questionRows.filter((row) => {
      const value =
        typeof row.difficulty === 'string'
          ? row.difficulty.toLowerCase()
          : ''
      return value === difficulty
    })
    if (filtered.length) {
      questionRows = filtered
    }
  }

  const shuffled = shuffle(questionRows.slice())
  const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length))

  const mapped: DrillQuestion[] = []
  for (const row of selected) {
    const question = mapRowToQuestion(row)
    if (question) {
      mapped.push(question)
    }
  }

  if (!mapped.length) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stored questions were missing required fields.',
    })
  }

  const sessionId = await logDrillSession(supabase, {
    userId: user.id,
    docIds: verifiedDocIds,
    questionCount: mapped.length,
  })

  return {
    sessionId,
    questions: mapped,
  }
})

function normalizeDocIds(docIds?: string[]) {
  if (!Array.isArray(docIds)) return []
  const unique = new Set<string>()
  for (const id of docIds) {
    if (typeof id !== 'string') continue
    const trimmed = id.trim()
    if (!trimmed) continue
    unique.add(trimmed)
  }
  return Array.from(unique)
}

function mapRowToQuestion(row: any): DrillQuestion | null {
  if (!row) return null
  const stem = typeof row.stem === 'string' ? row.stem.trim() : ''
  const id =
    typeof row.id === 'string'
      ? row.id
      : row.id != null
        ? String(row.id)
        : ''
  if (!stem || !id) return null

  const rawOptions = Array.isArray(row.options)
    ? row.options
    : Array.isArray((row.options as any)?.options)
      ? (row.options as any).options
      : []
  const options = rawOptions
    .map((option) =>
      typeof option === 'string'
        ? option
        : option != null
          ? String(option)
          : '',
    )
    .filter((option) => option.length > 0)

  const correct =
    typeof row.correct_index === 'number'
      ? row.correct_index
      : options.length
        ? 0
        : -1

  const explanation =
    typeof row.explanation === 'string' && row.explanation.length
      ? row.explanation
      : null

  return {
    id,
    stem,
    options,
    correct,
    explanation,
    docId:
      typeof row.document_id === 'string' && row.document_id.length
        ? row.document_id
        : null,
    topic: null,
    sectionId: null,
  }
}

function shuffle<T>(values: T[]) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return values
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

async function logDrillSession(
  supabase: ReturnType<typeof createServiceClient>,
  params: { userId: string; docIds: string[]; questionCount: number },
) {
  try {
    const payload = {
      id: randomUUID(),
      user_id: params.userId,
      doc_id: params.docIds[0] || null,
      started_at: new Date().toISOString(),
      total_questions: params.questionCount,
      correct_answers: 0,
    }

    const { data, error } = await supabase
      .from('drill_sessions')
      .insert(payload)
      .select('id')
      .maybeSingle()

    if (!error) {
      return data?.id ?? payload.id
    }
    if (error.code === '42P01') {
      console.warn('drill_sessions table missing; falling back to legacy drills table.')
      return await legacyLogDrillSession(supabase, params)
    }
    console.error('Failed to log drill session', error)
    return null
  } catch (err) {
    console.error('Unexpected drill session logging failure', err)
    return null
  }
}

async function legacyLogDrillSession(
  supabase: ReturnType<typeof createServiceClient>,
  params: { userId: string; docIds: string[]; questionCount: number },
) {
  const basePayload: Record<string, any> = {
    user_id: params.userId,
    doc_ids: params.docIds,
    question_count: params.questionCount,
  }

  const { data, error } = await supabase.from('drills').insert(basePayload).select('id').maybeSingle()
  if (!error) {
    return data?.id ?? null
  }
  if (error.code === '42P01') {
    console.warn('drills table missing; skipping drill session logging.')
    return null
  }
  console.error('Failed to log drill session', error)
  return null
}

function normalizeDifficulty(value?: string | null): 'easy' | 'mixed' | 'hard' {
  const normalized = typeof value === 'string' ? value.toLowerCase().trim() : ''
  if (normalized === 'easy' || normalized === 'hard') return normalized
  return 'mixed'
}
