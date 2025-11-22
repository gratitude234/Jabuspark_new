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

  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
