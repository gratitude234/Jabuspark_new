import { createError } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'

const ELEVATED_ROLES = ['tutor', 'admin']

export async function requireTutorOrAdminRole(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const role = (data?.role as string) || 'student'
  if (!ELEVATED_ROLES.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Tutor or admin access required.',
    })
  }

  return role
}
