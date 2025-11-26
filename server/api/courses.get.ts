// server/api/courses.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)

  const query = getQuery(event) as {
    department?: string
    level?: string
  }

  const department = (query.department || '').trim()
  const level = (query.level || '').trim()

  if (!department || !level) {
    // Just return empty list instead of 500
    return []
  }

  const { data, error } = await client
    .from('courses')
    .select('id, code, title, department, level')
    .eq('department', department)
    .eq('level', level)
    .order('code', { ascending: true })

  if (error) {
    console.error('[courses] Supabase error', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data || []
})
