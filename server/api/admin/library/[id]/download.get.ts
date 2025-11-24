// server/api/admin/library/[id]/download.get.ts
import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const supabase = serverSupabaseClient(event)
  await requireAdminRole(supabase, user.id)

  const id = event.context.params?.id
  if (!id || typeof id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'id param is required.' })
  }

  // 1) get storage_path
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc?.storage_path) {
    throw createError({ statusCode: 404, statusMessage: 'Document file not found.' })
  }

  // 2) get a signed URL so admin can download
  const { data: signed, error: signedError } = await supabase.storage
    .from('docs')
    .createSignedUrl(doc.storage_path, 60 * 10) // 10 min

  if (signedError || !signed?.signedUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: signedError?.message || 'Failed to create signed URL.',
    })
  }

  return { url: signed.signedUrl }
})
