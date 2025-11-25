// file: server/api/admin/library.get.ts
import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  }

  // Ensure the caller is an admin
  await requireAdminRole(supabase, user.id)

  // 🚨 No query filters here – always return all docs
  const { data, error } = await supabase
    .from('documents')
    .select(
      `
      id,
      title,
      visibility,
      approval_status,
      question_status,
      question_count,
      course_code,
      created_at,
      size_bytes,
      uploader:profiles!documents_user_id_fkey(full_name,email),
      course:courses!documents_course_id_fkey(code)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Normalize shape for the frontend
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
