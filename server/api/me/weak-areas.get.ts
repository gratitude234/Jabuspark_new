import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'

interface WeakArea {
  courseId: string | null
  courseCode: string | null
  courseTitle: string | null
  topic: string
  attempts: number
  correct: number
  accuracy: number
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const supabase = createServiceClient()

  const { data: sessions, error: sessionsError } = await supabase
    .from('drill_sessions')
    .select('id, doc_id')
    .eq('user_id', user.id)

  if (sessionsError) {
    throw createError({ statusCode: 500, statusMessage: sessionsError.message })
  }

  const sessionIds = (sessions || []).map((s) => s.id)
  if (!sessionIds.length) return []

  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('session_id, question_id, is_correct')
    .in('session_id', sessionIds)

  if (attemptsError) {
    throw createError({ statusCode: 500, statusMessage: attemptsError.message })
  }

  const questionIds = Array.from(new Set((attempts || []).map((a) => a.question_id)))
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, doc_id, section_topic, topic_tags')
    .in('id', questionIds)

  if (questionsError) {
    throw createError({ statusCode: 500, statusMessage: questionsError.message })
  }

  const docIds = Array.from(new Set((questions || []).map((q) => q.doc_id)))
  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('id, course, course_code, title, course_id')
    .in('id', docIds)

  if (docsError) {
    throw createError({ statusCode: 500, statusMessage: docsError.message })
  }

  const courseIds = Array.from(
    new Set((documents || []).map((doc) => doc.course_id).filter(Boolean) as string[]),
  )
  const { data: courses } = await supabase
    .from('courses')
    .select('id, code, title')
    .in('id', courseIds)

  const courseMap = new Map<string, { code: string | null; title: string | null }>()
  ;(courses || []).forEach((c) => {
    courseMap.set(c.id, { code: c.code, title: c.title })
  })

  const questionMap = new Map<string, any>()
  ;(questions || []).forEach((q) => questionMap.set(q.id, q))

  const docMap = new Map<string, any>()
  ;(documents || []).forEach((doc) => docMap.set(doc.id, doc))

  const buckets = new Map<string, WeakArea>()

  for (const attempt of attempts || []) {
    const question = questionMap.get(attempt.question_id)
    if (!question) continue
    const doc = docMap.get(question.doc_id)
    const courseId = doc?.course_id ?? null
    const courseCode = courseId ? courseMap.get(courseId)?.code ?? null : doc?.course_code ?? doc?.course ?? null
    const courseTitle = courseId ? courseMap.get(courseId)?.title ?? null : doc?.title ?? null
    const topic = Array.isArray(question.topic_tags) && question.topic_tags.length
      ? String(question.topic_tags[0])
      : question.section_topic || 'General'

    const key = `${courseId || 'none'}::${topic}`
    if (!buckets.has(key)) {
      buckets.set(key, {
        courseId,
        courseCode: courseCode || null,
        courseTitle: courseTitle || null,
        topic,
        attempts: 0,
        correct: 0,
        accuracy: 0,
      })
    }
    const bucket = buckets.get(key)!
    bucket.attempts += 1
    if (attempt.is_correct) bucket.correct += 1
  }

  const results = Array.from(buckets.values())
    .filter((b) => b.attempts >= 5)
    .map((b) => ({
      ...b,
      accuracy: b.attempts ? Math.round((b.correct / b.attempts) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)

  return results.slice(0, 5)
})
