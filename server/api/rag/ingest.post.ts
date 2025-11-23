// server/api/rag/ingest.post.ts
import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { extractPdfPages } from '~/server/utils/pdf'
import { embedTexts } from '~/server/utils/embeddings'
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

  // Auth is *optional* here – we just use it to enforce ownership if present.
  let userId: string | null = null
  try {
    const user = await serverSupabaseUser(event)
    userId = user?.id ?? null
  } catch {
    userId = null
  }

  const supabase = createServiceClient()

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, user_id, storage_path')
    .eq('id', body.docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }
  if (userId && doc.user_id !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Not your doc' })
  }

  const storagePath = doc.storage_path || body.storagePath
  const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : ''

  if (!storagePath && !sourceUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing storage path for document',
    })
  }

  const now = new Date().toISOString()
  await supabase
    .from('documents')
    .update({ status: 'processing', error_message: null, updated_at: now })
    .eq('id', body.docId)

  try {
    // ---- Load the PDF into memory ----
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
    } else if (storagePath) {
      const { data, error } = await supabase.storage.from('docs').download(storagePath)
      if (error || !data) {
        throw createError({
          statusCode: 400,
          statusMessage: error?.message || 'Download from storage failed',
        })
      }
      buffer = Buffer.from(await data.arrayBuffer())
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'No document source provided.',
      })
    }

    // ---- Extract pages and chunk them ----
    const pages = await extractPdfPages(buffer)
    const chunks = chunkPages(pages)

    // Clear any previous chunks
    await supabase.from('doc_chunks').delete().eq('doc_id', body.docId)

    const rows: Array<{
      doc_id: string
      page: number
      content: string
      embedding: number[]
    }> = []

    if (chunks.length) {
      const embeddings = await embedTexts(chunks.map((chunk) => chunk.content))
      const fallbackLength = embeddings[0]?.length || 16

      chunks.forEach((chunk, index) => {
        const vector = embeddings[index]
        rows.push({
          doc_id: body.docId,
          page: chunk.page,
          content: chunk.content,
          embedding:
            Array.isArray(vector) && vector.length
              ? vector
              : new Array(fallbackLength).fill(0),
        })
      })

      // batch insert chunks
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

    // NOTE: we *do not* auto-generate MCQs here anymore. Admin will handle that.
    return {
      success: true,
      docId: body.docId,
      pageCount: pages.length,
      chunkCount: rows.length,
    }
  } catch (err: any) {
    // Try to mark the document as failed, but still rethrow
    try {
      await supabase
        .from('documents')
        .update({
          status: 'failed',
          error_message:
            (err?.statusMessage || err?.message || 'Ingest failed').slice(0, 280),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.docId)
    } catch {
      // ignore
    }

    if (err?.statusCode) {
      throw err
    }

    console.error('Unexpected ingest error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
    })
  }
})
