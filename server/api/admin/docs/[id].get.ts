import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Document id required' })
  }

  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('documents')
    .select(
      `id, user_id, title, storage_path, visibility, approval_status, question_status, question_count, course_code, created_at, size_bytes, level, faculty, department, course_id,
       uploader:profiles!documents_user_id_fkey(full_name,email),
       course:courses!documents_course_id_fkey(id,code,title,level,department,faculty)`
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    storage_path: data.storage_path,
    visibility: data.visibility,
    approval_status: data.approval_status,
    question_status: data.question_status,
    question_count: data.question_count ?? 0,
    course_code: data.course_code || data.course?.code || null,
    created_at: data.created_at,
    size_bytes: data.size_bytes,
    level: data.level || data.course?.level || null,
    faculty: data.faculty || data.course?.faculty || null,
    department: data.department || data.course?.department || null,
    course_id: data.course_id || data.course?.id || null,
    uploader_name: data.uploader?.full_name || null,
    uploader_email: data.uploader?.email || null,
  }
})
