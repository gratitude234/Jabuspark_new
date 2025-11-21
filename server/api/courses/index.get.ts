import { createError } from 'h3'
import { createServiceClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = createServiceClient()
  const query = getQuery(event)

  const builder = supabase
    .from('courses')
    .select('id, code, title, level, faculty, department')
    .eq('is_active', true)

  if (query.level && typeof query.level === 'string') {
    builder.eq('level', query.level)
  }
  if (query.faculty && typeof query.faculty === 'string') {
    builder.eq('faculty', query.faculty)
  }
  if (query.department && typeof query.department === 'string') {
    builder.eq('department', query.department)
  }

  const { data, error } = await builder
    .order('code', { ascending: true })
    .order('title', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data ?? []
})
