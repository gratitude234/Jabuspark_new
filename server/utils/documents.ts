import { createError } from 'h3'
import { createServiceClient } from '~/server/utils/supabase'

export async function requireDocumentAccess({
  docId,
  userId,
  fields = 'id, user_id, title, course, course_code, level, faculty, department, is_public, status',
  supabase = createServiceClient(),
}: {
  docId: string
  userId: string | null
  fields?: string
  supabase?: ReturnType<typeof createServiceClient>
}) {
  const { data: doc, error } = await supabase
    .from('documents')
    .select(fields)
    .eq('id', docId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found.' })
  }
  if (userId && doc.user_id && doc.user_id !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'You do not have access to this document.' })
  }

  return { doc, supabase }
}
