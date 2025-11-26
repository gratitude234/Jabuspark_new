// server/api/leaderboard.get.ts

import { createError } from 'h3'
import { createServiceClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = createServiceClient()
  const query = getQuery(event)

  const courseId =
    typeof query.courseId === 'string' && query.courseId.trim().length
      ? query.courseId.trim()
      : null

  // Only look at the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  let docIds: string[] | null = null

  // If a courseId is provided, find all docs for that course
  if (courseId) {
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('id')
      .eq('course_id', courseId)

    if (docsError) {
      throw createError({
        statusCode: 500,
        statusMessage: docsError.message,
      })
    }

    docIds = (docs || []).map((d) => d.id as string)
    if (!docIds.length) {
      // No docs for this course → empty leaderboard
      return []
    }
  }

  // Pull recent drill sessions
  let sessionsQuery = supabase
    .from('drill_sessions')
    .select('user_id, total_questions, correct_answers, doc_id, started_at')
    .gte('started_at', sevenDaysAgo)
    .not('user_id', 'is', null)

  if (docIds) {
    sessionsQuery = sessionsQuery.in('doc_id', docIds)
  }

  const { data: sessions, error: sessionsError } = await sessionsQuery

  if (sessionsError) {
    throw createError({
      statusCode: 500,
      statusMessage: sessionsError.message,
    })
  }

  if (!sessions?.length) {
    return []
  }

  // Aggregate per user in memory
  const statsMap = new Map<
    string,
    { total: number; correct: number }
  >()

  for (const row of sessions) {
    const userId = row.user_id as string | null
    if (!userId) continue

    const total = typeof row.total_questions === 'number' ? row.total_questions : 0
    const correct =
      typeof row.correct_answers === 'number' ? row.correct_answers : 0

    if (!statsMap.has(userId)) {
      statsMap.set(userId, { total: 0, correct: 0 })
    }

    const stats = statsMap.get(userId)!
    stats.total += total
    stats.correct += correct
  }

  if (!statsMap.size) {
    return []
  }

  // Fetch profile names for these users
  const userIds = Array.from(statsMap.keys())

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  if (profilesError) {
    throw createError({
      statusCode: 500,
      statusMessage: profilesError.message,
    })
  }

  const nameMap = new Map<string, string | null>()
  for (const profile of profiles || []) {
    if (!profile?.id) continue
    nameMap.set(profile.id as string, profile.full_name || null)
  }

  // Build leaderboard array
  const entries = userIds.map((userId) => {
    const stats = statsMap.get(userId)!
    const accuracy =
      stats.total > 0
        ? Math.round((stats.correct / stats.total) * 100)
        : 0

    return {
      userId,
      name: nameMap.get(userId) ?? null,
      total: stats.total,
      correct: stats.correct,
      accuracy,
    }
  })

  // Sort: best accuracy first, then more questions
  entries.sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy
    return b.total - a.total
  })

  // Limit to top 20 for now
  return entries.slice(0, 20)
})
