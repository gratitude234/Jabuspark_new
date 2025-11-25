import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'
import { generateQuestionsForDocument } from '~/server/services/questionGenerator'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Document id required' })

  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  await requireAdminRole(supabase, user.id)

  const { data: docOwner, error: ownerError } = await supabase
    .from('documents')
    .select('user_id, title')
    .eq('id', id)
    .maybeSingle()
  if (ownerError) throw createError({ statusCode: 500, statusMessage: ownerError.message })

  const { insertedCount, document } = await generateQuestionsForDocument(id)

  await supabase.from('admin_action_logs').insert({
    actor_id: user.id,
    target_user_id: docOwner?.user_id,
    action: 'generate_doc_questions',
    meta: { doc_id: id, title: docOwner?.title, generated_count: insertedCount },
  })

  return { status: 'ok', insertedCount, question_status: document.question_status }
})
