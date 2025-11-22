import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const documentId = getQuery(event).documentId
  if (!documentId || typeof documentId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'documentId is required.' })
  }

  const supabase = serverSupabaseClient(event)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
})
