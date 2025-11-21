import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const body = await readBody<{ courseId?: string }>(event)
  const courseId = typeof body?.courseId === 'string' ? body.courseId.trim() : ''
  if (!courseId) {
    throw createError({ statusCode: 400, statusMessage: 'courseId required' })
  }

  const supabase = createServiceClient()

  const { data: existing, error: existingError } = await supabase
    .from('course_enrolments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existingError) {
    throw createError({ statusCode: 500, statusMessage: existingError.message })
  }

  if (existing) {
    return { id: existing.id }
  }

  const { data, error } = await supabase
    .from('course_enrolments')
    .insert({ course_id: courseId, user_id: user.id })
    .select('id')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { id: data?.id }
})
