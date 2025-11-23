// server/api/rag/ingest.post.ts
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { extractPdfPages } from '~/server/utils/pdf'
import { embedTexts } from '~/server/utils/embeddings'
import { chunkPages } from '~/server/utils/retrieval'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ docId: string; storagePath?: string; sourceUrl?: string }>(event)

  if (!body?.docId) {
    throw createError({ statusCode: 400, statusMessage: 'docId required' })
  }

  // Require a logged-in user for ingest – the call comes from the logged-in client anyway.
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const supabase = serverSupabaseClient(event)

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
  if (doc.user_id !== user.id) {
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
          statusMessage: error?.message || 'Download failed',
        })
      }
      buffer = Buffer.from(await data.arrayBuffer())
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'No document source provided.',
      })
    }

    const pages = await extractPdfPages(buffer)
    const chunks = chunkPages(pages)

    // Reset previous chunks for this doc
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

    const embeddingProvider =
      ((config.public as any)?.embeddingProvider as string | undefined) || 'gemini'

    return {
      success: true,
      docId: body.docId,
      chunkCount: rows.length,
      pageCount: pages.length,
      embeddedWith: embeddingProvider,
    }
  } catch (err: any) {
    console.error('Ingest failed for doc', body.docId, err)

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
