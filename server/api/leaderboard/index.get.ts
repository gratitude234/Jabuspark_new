import { createError } from 'h3'
import { createServiceClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const courseId = typeof query.courseId === 'string' ? query.courseId : null
  const level = typeof query.level === 'string' ? query.level : null

  const supabase = createServiceClient()

  const { data: attempts, error } = await supabase
    .from('question_attempts')
    .select('is_correct, created_at, session:drill_sessions(user_id, doc_id), questions(doc_id), id')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const sessionDocs = new Map<string, string | null>()
  const questionDocs = new Map<string, string | null>()
  ;(attempts || []).forEach((row: any) => {
    if (row.session?.id) sessionDocs.set(row.id, row.session.doc_id || null)
    if (row.questions) questionDocs.set(row.id, row.questions.doc_id || null)
  })

  const userStats = new Map<
    string,
    { total: number; correct: number; docId: string | null; courseId: string | null; level: string | null }
  >()

  const docIds = Array.from(new Set(Array.from(questionDocs.values()).filter(Boolean) as string[]))
  const { data: documents } = await supabase
    .from('documents')
    .select('id, course_id, level')
    .in('id', docIds)

  const docMap = new Map<string, any>()
  ;(documents || []).forEach((doc) => docMap.set(doc.id, doc))

  for (const row of attempts || []) {
    const userId = row.session?.user_id
    if (!userId) continue
    const docId = questionDocs.get(row.id) || sessionDocs.get(row.id) || null
    const doc = docId ? docMap.get(docId) : null

    if (courseId && doc?.course_id !== courseId) continue
    if (level && doc?.level !== level) continue

    if (!userStats.has(userId)) {
      userStats.set(userId, {
        total: 0,
        correct: 0,
        docId,
        courseId: doc?.course_id ?? null,
        level: doc?.level ?? null,
      })
    }
    const stat = userStats.get(userId)!
    stat.total += 1
    if (row.is_correct) stat.correct += 1
  }

  const profilesQuery = supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', Array.from(userStats.keys()))

  const { data: profiles } = await profilesQuery

  const profileMap = new Map<string, any>()
  ;(profiles || []).forEach((p) => profileMap.set(p.id, p))

  const { data: courseRows } = await supabase
    .from('courses')
    .select('id, code')
    .in(
      'id',
      Array.from(new Set(Array.from(userStats.values()).map((s) => s.courseId).filter(Boolean) as string[])),
    )

  const courseMap = new Map<string, string>()
  ;(courseRows || []).forEach((c) => courseMap.set(c.id, c.code))

  const leaderboard = Array.from(userStats.entries())
    .map(([userId, stat]) => ({
      userId,
      name: profileMap.get(userId)?.full_name || null,
      level: stat.level,
      courseId: stat.courseId,
      courseCode: stat.courseId ? courseMap.get(stat.courseId) || null : null,
      total: stat.total,
      correct: stat.correct,
      accuracy: stat.total ? Math.round((stat.correct / stat.total) * 100) : 0,
    }))
    .sort((a, b) => b.correct - a.correct || b.total - a.total)
    .slice(0, 20)

  return leaderboard
})
