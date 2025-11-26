// server/api/drill.post.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase'

type Difficulty = 'easy' | 'mixed' | 'hard'

interface DrillBody {
  docIds?: string[]
  count?: number
  difficulty?: Difficulty
}

export default defineEventHandler(async (event) => {
  // 1) Read & validate body -----------------------------------------------
  const body = (await readBody<DrillBody>(event)) || {}

  const docIds = Array.isArray(body.docIds) ? body.docIds.filter(Boolean) : []
  const count =
    typeof body.count === 'number'
      ? Math.min(Math.max(body.count, 1), 50)
      : 10
  const difficulty: Difficulty = body.difficulty || 'mixed'

  if (!docIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No docs selected for drill.',
    })
  }

  // 2) Supabase client + user (uses your existing Nuxt Supabase config) ----
  const client = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not signed in',
    })
  }

  // 3) Build query for questions, filtered by doc_id -----------------------
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
      difficulty,
      topic_tags
    `
    )
    .in('doc_id', docIds)
    .order('created_at', { ascending: false })

  // Only filter by difficulty if not "mixed"
  if (difficulty && difficulty !== 'mixed') {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query.limit(count)

  if (error) {
    console.error('[api/drill] questions query error', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  // 4) Map rows to the shape the frontend expects --------------------------
  const questions =
    (data || []).map((q) => ({
      id: q.id,
      stem: q.stem,
      options: q.options || [],
      correct: q.correct ?? 0,
      explanation: q.explanation || '',
      docId: q.doc_id,
      difficulty: (q.difficulty as Difficulty) || 'mixed',
      topicTags: q.topic_tags || [],
    })) ?? []

  // 5) For now we can skip logging drill_sessions, just return questions ----
  return {
    sessionId: null,
    questions,
  }
})
