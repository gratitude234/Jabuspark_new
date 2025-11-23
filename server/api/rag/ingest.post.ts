// server/api/rag/ingest.post.ts
import { createError } from 'h3'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { extractPdfPages } from '~/server/utils/pdf'
import { embedTexts } from '~/server/utils/embeddings'
import { chunkPages } from '~/server/utils/retrieval'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{
    docId: string
    storagePath?: string
    sourceUrl?: string
  }>(event)

  if (!body?.docId) {
    throw createError({ statusCode: 400, statusMessage: 'docId required' })
  }

  // Try to read the auth cookie, but allow service-mode ingest even if the cookie is missing
  // (e.g. when the client request loses the session on Vercel). We still validate ownership
  // if a user is present.
  const user = await serverSupabaseUser(event).catch(() => null)

  // ✅ use Nuxt’s built-in server client instead of custom createServiceClient()
  const supabase = await serverSupabaseClient(event)

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('user_id, storage_path, course')
    .eq('id', body.docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }
  if (user && doc.user_id !== user.id) {
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

    // Optional: auto question seeding – you can leave this as-is
    const shouldAutoSeed =
      !config.geminiDisabled && (config as any).geminiAutoSeedQuestions === 'true'

    if (shouldAutoSeed) {
      await seedQuestionsForDocument({
        docId: body.docId,
        courseName: doc.course,
        chunks,
      })
    } else {
      console.info('Skipping auto question seeding (manual mode)')
    }

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

// --- helpers stay the same as before ---

async function seedQuestionsForDocument(params: {
  docId: string
  courseName?: string | null
  chunks: Array<{ page: number; content: string }>
}) {
  const { docId, courseName, chunks } = params
  if (!Array.isArray(chunks) || !chunks.length) return

  const sectionTexts = buildSectionTexts(chunks)
  if (!sectionTexts.length) return

  for (let index = 0; index < sectionTexts.length; index += 1) {
    const sectionText = sectionTexts[index]
    const text = sectionText.trim()
    if (!text) continue
    const sectionTitle =
      (courseName ? `${courseName} ` : '') + `Section ${index + 1}`

    try {
      await callQuestionGenWithRetry({
        docId,
        context: text,
        sectionTitle,
        count: 5,
        mode: 'mcq',
      })
    } catch (err) {
      console.error('Failed to generate questions for section', docId, err)
    }
  }

  console.log(`Seeded ${sectionTexts.length} question batches for`, docId)
}

async function callQuestionGenWithRetry(body: {
  docId: string
  context: string
  sectionTitle?: string
  count?: number
  mode?: 'mcq' | 'short-answer'
}) {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await $fetch('/api/questions/generate', {
        method: 'POST',
        body,
      })
      return
    } catch (err: any) {
      const status = err?.statusCode || err?.response?.status
      const msg =
        err?.statusMessage ||
        err?.data?.error?.message ||
        err?.message ||
        ''

      const is503 =
        status === 503 ||
        /model is overloaded/i.test(msg) ||
        /UNAVAILABLE/i.test(msg)

      if (!is503 || attempt === maxAttempts) {
        throw err
      }

      const delayMs = attempt * 2000
      console.warn(
        `Gemini 503 on attempt ${attempt} for doc ${body.docId}, retrying in ${delayMs}ms...`,
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

function buildSectionTexts(chunks: Array<{ page: number; content: string }>) {
  const MAX_SECTIONS = 3
  const MAX_CHARS_PER_SECTION = 3000
  const MAX_CHUNKS_PER_SECTION = 2

  const sorted = chunks.slice().sort((a, b) => a.page - b.page)

  const sectionTexts: string[] = []
  let current: string[] = []
  let currentLen = 0

  for (const chunk of sorted) {
    if (sectionTexts.length >= MAX_SECTIONS) break

    const text = (chunk.content || '').trim()
    if (!text) continue

    const exceedsCharLimit = currentLen + text.length > MAX_CHARS_PER_SECTION
    const exceedsChunkLimit = current.length >= MAX_CHUNKS_PER_SECTION

    if (current.length > 0 && (exceedsCharLimit || exceedsChunkLimit)) {
      sectionTexts.push(current.join('\n\n'))
      if (sectionTexts.length >= MAX_SECTIONS) break
      current = []
      currentLen = 0
    }

    current.push(text)
    currentLen += text.length
  }

  if (current.length && sectionTexts.length < MAX_SECTIONS) {
    sectionTexts.push(current.join('\n\n'))
  }

  return sectionTexts.slice(0, MAX_SECTIONS)
}
