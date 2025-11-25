import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  }
  await requireAdminRole(supabase, user.id)

  let builder = supabase
    .from('documents')
    .select(
      `id, title, visibility, approval_status, question_status, question_count, course_code, created_at, size_bytes,
       uploader:profiles!documents_user_id_fkey(full_name,email),
       course:courses!documents_course_id_fkey(code)`
    )
    .order('created_at', { ascending: false })

  if (query.approval_status && typeof query.approval_status === 'string') {
    builder = builder.eq('approval_status', query.approval_status)
  }
  if (query.question_status && typeof query.question_status === 'string') {
    builder = builder.eq('question_status', query.question_status)
  }
  if (query.visibility && typeof query.visibility === 'string') {
    builder = builder.eq('visibility', query.visibility)
  }
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const term = `%${query.search.trim()}%`
    builder = builder.or(
      `title.ilike.${term},course_code.ilike.${term},uploader.email.ilike.${term},uploader.full_name.ilike.${term}`,
    )
  }

  const { data, error } = await builder
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return (data || []).map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    visibility: doc.visibility,
    approval_status: doc.approval_status,
    question_status: doc.question_status,
    question_count: doc.question_count ?? 0,
    course_code: doc.course_code || doc.course?.code || null,
    created_at: doc.created_at,
    size_bytes: doc.size_bytes,
    uploader_name: doc.uploader?.full_name || null,
    uploader_email: doc.uploader?.email || null,
  }))
})
