// server/api/rag/ingest.post.ts

import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'

interface IngestBody {
  docId?: string
}

/**
 * Minimal ingest:
 * - checks the document exists and (optionally) belongs to the current user
 * - marks it as `ready`
 * - DOES NOT do embeddings or auto question generation
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<IngestBody>(event)

  if (!body?.docId || typeof body.docId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'docId required' })
  }

  // Try to get the user, but allow ingest to run even if there is no session
  const user = await serverSupabaseUser(event).catch(() => null)

  const supabase = createServiceClient()

  // Make sure the document exists (and belongs to this user if we have one)
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', body.docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }
  if (user && doc.user_id && doc.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Not your document' })
  }

  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('documents')
    .update({
      status: 'ready',
      error_message: null,
      updated_at: now,
      // we’re not doing any PDF parsing / embeddings now
      pages_count: null,
      chunks_count: null,
    })
    .eq('id', body.docId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return {
    success: true,
    docId: body.docId,
  }
})
