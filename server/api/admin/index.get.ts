// server/api/admin/library/index.get.ts
import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const supabase = serverSupabaseClient(event)
  await requireAdminRole(supabase, user.id)

  // Optional filters from query string:
  // /api/admin/library?scope=personal
  // /api/admin/library?scope=course
  // /api/admin/library?status=ready
  const query = getQuery(event) as {
    scope?: 'all' | 'personal' | 'course'
    status?: string
  }

  const scope = query.scope || 'all'

  let request = supabase
    .from('documents')
    .select(
      `
      id,
      title,
      user_id,
      course_id,
      course_code,
      visibility,
      approval_status,
      is_public,
      status,
      pages_count,
      chunks_count,
      created_at,
      updated_at
    `,
    )
    .order('created_at', { ascending: false })

  if (scope === 'personal') {
    request = request.eq('visibility', 'personal')
  } else if (scope === 'course') {
    request = request.eq('visibility', 'course')
  }

  if (query.status) {
    request = request.eq('status', query.status)
  }

  const { data, error } = await request

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    documents: data ?? [],
  }
})
