import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const id = event.context.params?.id
  if (!id || typeof id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'id param is required.' })
  }

  const supabase = serverSupabaseClient(event)
  await requireAdminRole(supabase, user.id)

  // Find which document this question belongs to
  const { data: question, error: fetchError } = await supabase
    .from('questions')
    .select('document_id')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    throw createError({ statusCode: 500, statusMessage: fetchError.message })
  }
  if (!question) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found.' })
  }

  const docId = question.document_id as string | null

  const { error: deleteError } = await supabase.from('questions').delete().eq('id', id)
  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message })
  }

  if (docId) {
    await updateDocumentQuestionMeta(supabase, docId)
  }

  return { success: true }
})

async function updateDocumentQuestionMeta(supabase: any, documentId: string) {
  try {
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId)

    if (error) {
      console.warn('Failed to recalc question_count for document', documentId, error)
      return
    }

    const total = count ?? 0
    const status = total > 0 ? 'has_questions' : 'none'

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        question_status: status,
        question_count: total,
      })
      .eq('id', documentId)

    if (updateError) {
      console.warn('Failed to update document question meta', documentId, updateError)
    }
  } catch (err) {
    console.warn('Unexpected error updating document question meta', documentId, err)
  }
}
