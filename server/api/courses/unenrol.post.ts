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

  const { error } = await supabase
    .from('course_enrolments')
    .delete()
    .eq('user_id', user.id)
    .eq('course_id', courseId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
