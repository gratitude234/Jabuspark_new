import { serverSupabaseUser } from '#supabase/server'
import { extractPdfPages } from '~/server/utils/pdf'
import { embedTexts } from '~/server/utils/embeddings'
import { chunkPages } from '~/server/utils/retrieval'
import { createServiceClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ docId: string; storagePath?: string }>(event)
  if (!body?.docId) {
    throw createError({ statusCode: 400, statusMessage: 'docId required' })
  }

  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  }

  const supabase = createServiceClient()
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('user_id, storage_path, course')
    .eq('id', body.docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc || doc.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Not your doc' })
  }

  const storagePath = doc.storage_path || body.storagePath
  if (!storagePath) {
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
    const { data, error } = await supabase.storage.from('docs').download(storagePath)
    if (error || !data) {
      throw createError({
        statusCode: 400,
        statusMessage: error?.message || 'Download failed',
      })
    }

    const buffer = Buffer.from(await data.arrayBuffer())
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
      const fallbackLength = embeddings[0]?.length || 768

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

    const responsePayload = { chunks: rows.length, pageCount: pages.length }

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

    // Auto-generate drill questions for a few sections of this document.
    // This calls /api/questions/generate which:
    //  - uses Gemini to name a topic + build MCQs/short-answers,
    //  - saves them into public.questions bound to this doc_id.
    // If generation fails (including Gemini 503 "model overloaded"
    // or MAX_TOKENS issues), we log and continue; ingest still succeeds.
    if (!config.geminiDisabled) {
      await seedQuestionsForDocument({
        docId: body.docId,
        courseName: doc.course,
        chunks,
      })
    }

    return responsePayload
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

async function seedQuestionsForDocument(params: {
  docId: string
  courseName?: string | null
  chunks: Array<{ page: number; content: string }>
}) {
  const { docId, courseName, chunks } = params
  if (!Array.isArray(chunks) || !chunks.length) return

  const sectionTexts = buildSectionTexts(chunks)
  if (!sectionTexts.length) return

  for (const sectionText of sectionTexts) {
    const text = sectionText.trim()
    if (!text) continue

    try {
      await callQuestionGenWithRetry({
        docId,
        text,
        courseName: courseName || undefined,
        maxQuestions: 5, // smaller batch to avoid MAX_TOKENS
      })
    } catch (err) {
      // At this point we've already retried; log and move on.
      console.error('Failed to generate questions for section', docId, err)
    }
  }

  console.log(`Seeded ${sectionTexts.length} question batches for`, docId)
}

/**
 * Call /api/questions/generate with simple retry/backoff
 * to handle transient Gemini 503 "model overloaded" errors.
 */
async function callQuestionGenWithRetry(body: {
  docId: string
  text: string
  courseName?: string
  maxQuestions?: number
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
      // Try to detect transient 503 / overloaded errors
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
        // Not a transient error, or we've exhausted retries
        throw err
      }

      const delayMs = attempt * 2000 // 2s, then 4s, then 6s
      console.warn(
        `Gemini 503 on attempt ${attempt} for doc ${body.docId}, retrying in ${delayMs}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

function buildSectionTexts(chunks: Array<{ page: number; content: string }>) {
  const MAX_SECTIONS = 3
  const MAX_CHARS_PER_SECTION = 3000  // was 5000
  const MAX_CHUNKS_PER_SECTION = 2    // was 3

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
