import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('course_enrolments')
    .select('id, level, course_id, courses(id, code, title, level, faculty, department)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return (data || []).map((row) => ({
    id: row.id,
    level: row.level,
    course: row.courses,
    courseId: row.course_id,
  }))
})
