import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import type { DrillQuestion } from '~/types/models'
import { createServiceClient } from '~/server/utils/supabase'

interface ReviewRequest {
  courseId?: string
  docId?: string
  limit?: number
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const body = await readBody<ReviewRequest>(event)
  const limit = clamp(typeof body?.limit === 'number' ? body.limit : 20, 1, 50)
  const courseId = typeof body?.courseId === 'string' ? body.courseId : null
  const docId = typeof body?.docId === 'string' ? body.docId : null

  const supabase = createServiceClient()

  // 1) All sessions for this user
  const { data: sessions, error: sessionsError } = await supabase
    .from('drill_sessions')
    .select('id, doc_id')
    .eq('user_id', user.id)

  if (sessionsError) {
    throw createError({ statusCode: 500, statusMessage: sessionsError.message })
  }

  const sessionIds = (sessions || []).map((s) => s.id)
  if (!sessionIds.length) {
    return { questions: [] }
  }

  // 2) Attempts where they got the answer wrong
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct, session_id')
    .in('session_id', sessionIds)
    .eq('is_correct', false)

  if (attemptsError) {
    throw createError({ statusCode: 500, statusMessage: attemptsError.message })
  }

  const questionIds = Array.from(
    new Set((attempts || []).map((a) => a.question_id)),
  )
  if (!questionIds.length) return { questions: [] }

  // 3) Fetch question details for those missed questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, doc_id, stem, options, correct, explanation')
    .in('id', questionIds)

  if (questionsError) {
    throw createError({ statusCode: 500, statusMessage: questionsError.message })
  }

  if (!questions?.length) {
    return { questions: [] }
  }

  // 4) Fetch doc metadata so we can filter by course + enforce access rules
  const docIds = Array.from(new Set(questions.map((q) => q.doc_id)))
  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select(
      'id, user_id, course_id, status, question_status, visibility, approval_status',
    )
    .in('id', docIds)

  if (docsError) {
    throw createError({ statusCode: 500, statusMessage: docsError.message })
  }

  const docMap = new Map<string, any>()

  // Mirror the same "ready + accessible" checks used in /api/drill
  for (const doc of documents || []) {
    if (!doc) continue

    const isReady =
      doc.status === 'ready' && (doc.question_status ?? 'none') === 'ready'

    if (!isReady) continue

    const visibility = doc.visibility ?? 'personal'
    const isOwner = doc.user_id === user.id
    const isApprovedCourse =
      visibility === 'course' &&
      (doc.approval_status ?? 'pending') === 'approved'

    if (!isOwner && !isApprovedCourse) continue

    docMap.set(doc.id, doc)
  }

  const filtered: DrillQuestion[] = []

  for (const q of questions) {
    const docMeta = docMap.get(q.doc_id)

    // Filter by course and doc if provided
    if (!docMeta) continue
    if (courseId && docMeta.course_id !== courseId) continue
    if (docId && q.doc_id !== docId) continue

    const rawOptions = Array.isArray(q.options) ? q.options : []
    const options = rawOptions
      .map((opt: any) =>
        typeof opt === 'string'
          ? opt
          : opt != null
            ? String(opt)
            : '',
      )
      .filter((opt: string) => opt.length)

    filtered.push({
      id: q.id,
      stem: (q.stem || '').trim(),
      options,
      correct: typeof q.correct === 'number' ? q.correct : 0,
      explanation: q.explanation || null,
      docId: q.doc_id,
      topic: null,
      sectionId: null,
    })
  }

  const unique = shuffle(filtered).slice(0, limit)
  if (!unique.length) {
    return { questions: [] }
  }

  // 5) Log a new review-type drill session
  const sessionId = await logReviewSession(supabase, {
    userId: user.id,
    docId: docId || unique[0].docId || null,
    questionCount: unique.length,
  })

  return {
    sessionId,
    questions: unique,
  }
})

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function shuffle<T>(values: T[]) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return values
}

async function logReviewSession(
  supabase: ReturnType<typeof createServiceClient>,
  params: { userId: string; docId: string | null; questionCount: number },
) {
  try {
    const payload = {
      id: randomUUID(),
      user_id: params.userId,
      doc_id: params.docId,
      started_at: new Date().toISOString(),
      total_questions: params.questionCount,
      correct_answers: 0,
    }

    const { data, error } = await supabase
      .from('drill_sessions')
      .insert(payload)
      .select('id')
      .maybeSingle()

    if (error) {
      console.warn('Failed to record review session', error)
      return null
    }
    return data?.id ?? payload.id
  } catch (err) {
    console.warn('Unexpected review session logging failure', err)
    return null
  }
}
