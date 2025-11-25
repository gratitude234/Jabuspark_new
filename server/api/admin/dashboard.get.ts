import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  await requireAdminRole(supabase, user.id)

  const [pendingApproval, pendingQuestions, hasQuestions, recentDocs] = await Promise.all([
    supabase.from('documents').select('id', { head: true, count: 'exact' }).eq('approval_status', 'pending'),
    supabase
      .from('documents')
      .select('id', { head: true, count: 'exact' })
      .eq('question_status', 'pending_admin'),
    supabase
      .from('documents')
      .select('id', { head: true, count: 'exact' })
      .eq('question_status', 'has_questions'),
    supabase
      .from('documents')
      .select(
        `id, title, approval_status, question_status, course_code, created_at,
         uploader:profiles!documents_user_id_fkey(full_name,email)`
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (pendingApproval.error) throw createError({ statusCode: 500, statusMessage: pendingApproval.error.message })
  if (pendingQuestions.error) throw createError({ statusCode: 500, statusMessage: pendingQuestions.error.message })
  if (hasQuestions.error) throw createError({ statusCode: 500, statusMessage: hasQuestions.error.message })
  if (recentDocs.error) throw createError({ statusCode: 500, statusMessage: recentDocs.error.message })

  return {
    pendingApproval: pendingApproval.count || 0,
    pendingQuestions: pendingQuestions.count || 0,
    hasQuestions: hasQuestions.count || 0,
    recentDocs: (recentDocs.data || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      approval_status: doc.approval_status,
      question_status: doc.question_status,
      course_code: doc.course_code,
      created_at: doc.created_at,
      uploader_name: doc.uploader?.full_name || null,
      uploader_email: doc.uploader?.email || null,
    })),
  }
})
