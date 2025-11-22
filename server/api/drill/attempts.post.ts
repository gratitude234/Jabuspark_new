import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'

interface AttemptPayload {
  questionId?: string
  choiceIndex?: number
}

interface AttemptsBody {
  sessionId?: string
  attempts?: AttemptPayload[]
  completed?: boolean
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const body = await readBody<AttemptsBody>(event)
  if (!body?.sessionId || typeof body.sessionId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'sessionId is required.' })
  }

  const attempts = Array.isArray(body.attempts) ? body.attempts : []
  if (!attempts.length) {
    throw createError({ statusCode: 400, statusMessage: 'attempts array is required.' })
  }

  const supabase = createServiceClient()

  const { data: session, error: sessionError } = await supabase
    .from('drill_sessions')
    .select('id, user_id')
    .eq('id', body.sessionId)
    .maybeSingle()

  if (sessionError) {
    throw createError({ statusCode: 500, statusMessage: sessionError.message })
  }
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Drill session not found.' })
  }
  if (session.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'You do not own this session.' })
  }

  const normalizedAttempts = attempts
    .map((attempt) => ({
      questionId: typeof attempt?.questionId === 'string' ? attempt.questionId : '',
      choiceIndex:
        typeof attempt?.choiceIndex === 'number'
          ? attempt.choiceIndex
          : attempt && typeof (attempt as any).chosen_index === 'number'
            ? (attempt as any).chosen_index
            : -1,
    }))
    .filter((attempt) => attempt.questionId && attempt.choiceIndex >= 0)

  if (!normalizedAttempts.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid attempts found.' })
  }

  const questionIds = Array.from(new Set(normalizedAttempts.map((item) => item.questionId)))

  const { data: questionRows, error: questionError } = await supabase
    .from('questions')
    .select('id, correct_index')
    .in('id', questionIds)

  if (questionError) {
    throw createError({ statusCode: 500, statusMessage: questionError.message })
  }

  const correctMap = new Map<string, number>()
  questionRows?.forEach((row) => {
    if (row?.id)
      correctMap.set(row.id, typeof row.correct_index === 'number' ? row.correct_index : 0)
  })

  const inserts = normalizedAttempts.map((attempt) => ({
    session_id: body.sessionId,
    question_id: attempt.questionId,
    chosen_index: attempt.choiceIndex,
    is_correct: attempt.choiceIndex === correctMap.get(attempt.questionId),
  }))

  const { error: insertError } = await supabase.from('question_attempts').insert(inserts)
  if (insertError) {
    if (insertError.code === '42P01') {
      console.warn('question_attempts table missing; skipping logging attempts.')
      return { logged: 0 }
    }
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  const { data: allAttempts, error: fetchAttemptsError } = await supabase
    .from('question_attempts')
    .select('is_correct')
    .eq('session_id', body.sessionId)

  if (fetchAttemptsError) {
    throw createError({ statusCode: 500, statusMessage: fetchAttemptsError.message })
  }

  const totalQuestions = allAttempts?.length || inserts.length
  const correctAnswers = (allAttempts || inserts).filter((row) => row.is_correct).length

  const updatePayload: Record<string, any> = {
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
  }
  if (body.completed) {
    updatePayload.completed_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('drill_sessions')
    .update(updatePayload)
    .eq('id', body.sessionId)

  if (updateError && updateError.code !== '42P01') {
    console.error('Failed to update drill session stats', updateError)
  }

  return {
    logged: inserts.length,
    totalQuestions,
    correctAnswers,
  }
})
