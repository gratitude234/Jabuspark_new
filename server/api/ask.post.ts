import { randomUUID } from 'node:crypto'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { embedText } from '~/server/utils/embeddings'
import { composeAnswer, cosineSimilarity } from '~/server/utils/retrieval'
import { generateGeminiText } from '~/server/utils/gemini'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ question: string; docIds?: string[]; mode?: 'ask' }>(event)
  const question = body?.question?.trim()
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: 'Question required' })
  }
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Auth required' })
  }

  if (config.geminiDisabled) {
    return {
      sessionId: null,
      answer:
        'Ask mode is temporarily offline while we upgrade the AI. You can still read your PDFs and run drills with any saved questions.',
      confidence: 0,
      citations: [],
    }
  }

  let docsQuery = supabase.from('documents').select('id, title').eq('user_id', user.id).eq('status', 'ready')
  if (body.docIds?.length) {
    docsQuery = docsQuery.in('id', body.docIds)
  }
  const { data: docs, error: docsError } = await docsQuery
  if (docsError) throw createError({ statusCode: 500, statusMessage: docsError.message })
  if (!docs?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Select at least one ready document.' })
  }
  const allowedDocIds = docs.map((doc) => doc.id)
  const docTitleMap = Object.fromEntries(docs.map((doc) => [doc.id, doc.title]))

  const queryEmbedding = await embedText(question)
  const { data: chunks, error } = await supabase
    .from('doc_chunks')
    .select('doc_id, page, content, embedding')
    .in('doc_id', allowedDocIds)
    .limit(400)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const scored = (chunks || [])
    .map((chunk: any) => {
      const embedding = normalizeEmbedding(chunk.embedding)
      if (!embedding) return null
      return {
        ...chunk,
        embedding,
        score: cosineSimilarity(queryEmbedding, embedding),
      }
    })
    .filter((chunk): chunk is NonNullable<typeof chunk> => Boolean(chunk))
  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 12)
  if (!top.length) {
    throw createError({ statusCode: 400, statusMessage: 'No indexed pages found. Re-run ingest first.' })
  }
  const context = buildContext(top, docTitleMap)

  let answerText = ''
  let usedFallback = false
  try {
    const response = await generateGeminiText({
      systemInstruction:
        'You are the JabuSpark Ask Tutor for JABU nursing students. Answer only with the provided context excerpts, cite page numbers when possible, and clearly state when the answer cannot be found in the excerpts.',
      userParts: [
        `Context:\n\n${context}`,
        `Question:\n\n${question}`,
      ],
      temperature: 0.2,
      maxOutputTokens: 800,
    })
    answerText = typeof response === 'string' ? response : JSON.stringify(response)
  } catch (err) {
    console.error('Gemini answer generation failed', err)
    usedFallback = true
    const fallback = composeAnswer(question, top.map((chunk) => ({ ...chunk, doc_title: docTitleMap[chunk.doc_id] })))
    answerText = fallback.answer
  }

  const citations = top.slice(0, 6).map((chunk) => ({
    docId: chunk.doc_id,
    page: chunk.page,
    text: chunk.content.slice(0, 280),
    score: chunk.score,
    docTitle: docTitleMap[chunk.doc_id],
  }))
  const confidence = computeConfidence(top)

  const sessionId = randomUUID()
  const { error: sessionError } = await supabase.from('sessions').upsert({
    id: sessionId,
    user_id: user.id,
    mode: 'ask',
    doc_id: allowedDocIds.length === 1 ? allowedDocIds[0] : null,
    metadata: {
      question,
      docIds: allowedDocIds,
      citations: citations.map(({ docId, page, text, score }) => ({ docId, page, text, score })),
      usedFallback,
    },
  })
  if (sessionError) {
    console.error('Failed to persist ask session', sessionError.message)
  }

  if (top.length) {
    await supabase.from('matches').insert(
      top.slice(0, 8).map((chunk) => ({
        ask_id: sessionId,
        doc_id: chunk.doc_id,
        page: chunk.page,
        score: chunk.score,
        span: chunk.content.slice(0, 200),
      }))
    )
  }

  return {
    sessionId,
    answer: answerText,
    confidence,
    chunkCount: top.length,
    usedDocIds: allowedDocIds,
    citations: citations.map((citation) => ({
      docId: citation.docId,
      page: citation.page,
      text: citation.text,
      score: citation.score,
      docTitle: citation.docTitle,
    })),
  }
})

function buildContext(
  chunks: Array<{ doc_id: string; page: number; content: string } & { score: number }>,
  docTitleMap: Record<string, string>
) {
  return chunks
    .map((chunk, index) => {
      const snippet = chunk.content.replace(/\s+/g, ' ').trim().slice(0, 1200)
      const title = docTitleMap[chunk.doc_id] || chunk.doc_id
      return `Source ${index + 1} - ${title} (Page ${chunk.page}):\n${snippet}`
    })
    .join('\n\n')
}

function computeConfidence(chunks: Array<{ score: number }>) {
  if (!chunks.length) return 0
  const avg = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length
  return Math.max(0, Math.min(1, (avg + 1) / 2))
}

function normalizeEmbedding(raw: any): number[] | null {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.embedding)) return raw.embedding
    if (Array.isArray(raw.value)) return raw.value
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.embedding)) return parsed.embedding
        if (Array.isArray(parsed.value)) return parsed.value
      }
    } catch {
      // no-op, fall through to null
    }
  }
  return null
}


