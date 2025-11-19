// Drill sessions now read from pre-generated question pools so students get consistent questions per document batch.
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
    .in('doc_id', verifiedDocIds)

  if (questionsError) {
    throw createError({ statusCode: 500, statusMessage: questionsError.message })
  }
  if (!rows?.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No pre-generated questions found for these docs yet.',
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
    difficulty,
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

  const rawOptions = Array.isArray(row.options) ? row.options : []
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
    typeof row.correct === 'number'
      ? row.correct
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
      typeof row.doc_id === 'string' && row.doc_id.length ? row.doc_id : null,
    topic:
      typeof row.section_topic === 'string' && row.section_topic.length
        ? row.section_topic
        : null,
    sectionId:
      typeof row.section_id === 'string' && row.section_id.length
        ? row.section_id
        : null,
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
  params: { userId: string; docIds: string[]; questionCount: number; difficulty: 'easy' | 'mixed' | 'hard' },
) {
  try {
    const basePayload: Record<string, any> = {
      user_id: params.userId,
      doc_ids: params.docIds,
      question_count: params.questionCount,
    }
    if (params.difficulty && params.difficulty !== 'mixed') {
      basePayload.difficulty = params.difficulty
    }

    const { data, error } = await supabase.from('drills').insert(basePayload).select('id').maybeSingle()
    if (!error) {
      return data?.id ?? null
    }
    if (error.code === '42703' && 'difficulty' in basePayload) {
      delete basePayload.difficulty
      const retry = await supabase.from('drills').insert(basePayload).select('id').maybeSingle()
      if (!retry.error) {
        return retry.data?.id ?? null
      }
      if (retry.error?.code === '42P01') {
        console.warn('drills table missing; skipping drill session logging.')
        return null
      }
      if (retry.error) {
        console.error('Failed to log drill session after retry', retry.error)
        return null
      }
    }
    if (error.code === '42P01') {
      console.warn('drills table missing; skipping drill session logging.')
      return null
    }
    console.error('Failed to log drill session', error)
    return null
  } catch (err) {
    console.error('Unexpected drill session logging failure', err)
    return null
  }
}

function normalizeDifficulty(value?: string | null): 'easy' | 'mixed' | 'hard' {
  const normalized = typeof value === 'string' ? value.toLowerCase().trim() : ''
  if (normalized === 'easy' || normalized === 'hard') return normalized
  return 'mixed'
}
