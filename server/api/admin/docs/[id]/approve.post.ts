import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Document id required' })

  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  await requireAdminRole(supabase, user.id)

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, user_id, title, approval_status, question_status')
    .eq('id', id)
    .maybeSingle()
  if (docError) throw createError({ statusCode: 500, statusMessage: docError.message })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Document not found' })

  const updates: Record<string, any> = { approval_status: 'approved' }
  if (doc.question_status === 'none') {
    updates.question_status = 'pending_admin'
  }

  const { error: updateError } = await supabase.from('documents').update(updates).eq('id', id)
  if (updateError) throw createError({ statusCode: 500, statusMessage: updateError.message })

  await supabase.from('admin_action_logs').insert({
    actor_id: user.id,
    target_user_id: doc.user_id,
    action: 'approve_document',
    meta: { doc_id: doc.id, title: doc.title, previous_approval_status: doc.approval_status },
  })

  return { status: 'ok' }
})
