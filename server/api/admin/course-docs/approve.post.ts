import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'
import { requireTutorOrAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const body = await readBody<{ id?: string }>(event)
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'Document id required.' })
  }

  const supabase = createServiceClient()
  await requireTutorOrAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('documents')
    .update({ approval_status: 'approved' })
    .eq('id', body.id)
    .eq('visibility', 'course')
    .select('id')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found.' })
  }

  return { success: true }
})
