// server/api/rag/ingest.post.ts

import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { extractPdfPages } from '~/server/utils/pdf'
import { chunkPages } from '~/server/utils/retrieval'
import { createServiceClient } from '~/server/utils/supabase'

interface IngestBody {
  docId: string
  storagePath?: string
  sourceUrl?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<IngestBody>(event)

  if (!body?.docId || typeof body.docId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'docId required' })
  }

  // We *try* to read the user, but allow ingest to continue in "service mode"
  // if the cookie is missing. If there *is* a user, we still enforce ownership.
  const user = await serverSupabaseUser(event).catch(() => null)

  const supabase = createServiceClient()

  // Fetch document metadata (owner + storage path)
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, user_id, storage_path, course')
    .eq('id', body.docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  if (user && doc.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Not your document' })
  }

  const storagePath = (body.storagePath || doc.storage_path || '').trim()
  const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : ''

  if (!storagePath && !sourceUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing storage path or sourceUrl for document',
    })
  }

  const now = new Date().toISOString()

  // Mark as processing
  await supabase
    .from('documents')
    .update({ status: 'processing', error_message: null, updated_at: now })
    .eq('id', body.docId)

  try {
    // --- 1. Load PDF bytes (from Supabase storage or external URL) ---
    let buffer: Buffer

    if (sourceUrl) {
      const response = await fetch(sourceUrl)
      if (!response.ok) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Failed to download document from sourceUrl.',
        })
      }
      buffer = Buffer.from(await response.arrayBuffer())
    } else {
      const { data, error } = await supabase.storage.from('docs').download(storagePath)
      if (error || !data) {
        throw createError({
          statusCode: 400,
          statusMessage: error?.message || 'Download failed',
        })
      }
      buffer = Buffer.from(await data.arrayBuffer())
    }

    // --- 2. Extract pages + chunk text (for Ask later, if you re-enable embeddings) ---
    const pages = await extractPdfPages(buffer)
    const chunks = chunkPages(pages)

    // Clear any previous chunks for this doc
    await supabase.from('doc_chunks').delete().eq('doc_id', body.docId)

    // NOTE: we are *not* calling Gemini or any embedding API here.
    // We only store plain text chunks; embedding column will stay NULL.
    const rows: Array<{
      doc_id: string
      page: number
      content: string
    }> = []

    for (const chunk of chunks) {
      const text = (chunk.content || '').trim()
      if (!text) continue

      rows.push({
        doc_id: body.docId,
        page: chunk.page,
        content: text,
      })
    }

    // Batch insert chunks
    if (rows.length) {
      const INSERT_BATCH = 200
      for (let i = 0; i < rows.length; i += INSERT_BATCH) {
        const batch = rows.slice(i, i + INSERT_BATCH)
        const { error: insertError } = await supabase.from('doc_chunks').insert(batch)
        if (insertError) {
          throw createError({
            statusCode: 500,
            statusMessage: insertError.message,
          })
        }
      }
    }

    // --- 3. Mark document as ready (even though embeddings are skipped) ---
    await supabase
      .from('documents')
      .update({
        status: 'ready',
        pages_count: pages.length,
        chunks_count: rows.length,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.docId)

    return {
      success: true,
      docId: body.docId,
      pageCount: pages.length,
      chunkCount: rows.length,
      embeddedWith: 'disabled', // just a hint for debugging
    }
  } catch (err: any) {
    // If anything fails, mark document as failed
    await supabase
      .from('documents')
      .update({
        status: 'failed',
        error_message:
          (err?.statusMessage || err?.message || 'Ingest failed').slice(0, 280),
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.docId)

    throw err
  }
})
