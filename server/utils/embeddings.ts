// server/utils/embeddings.ts
import { createError } from 'h3'

/**
 * Your pgvector column is vector(768), so ALL embeddings (real or stub)
 * must be length 768.
 */
const EMBEDDING_DIM = 768
const MAX_BATCH = 32

export async function embedText(text: string) {
  const vectors = await embedTexts([text])
  return vectors[0] || buildStubVector(text)
}

export async function embedTexts(texts: string[]) {
  if (!Array.isArray(texts) || !texts.length) {
    return []
  }

  const config = useRuntimeConfig()

  const provider =
    ((config.public as any)?.embeddingProvider as string | undefined) || 'gemini'
  const apiKey = config.geminiApiKey as string | undefined

  // In nuxt.config.ts we default this to 'models/text-embedding-004'
  const rawModel =
    (config.geminiModelEmbedding as string | undefined) || 'models/text-embedding-004'

  const model = rawModel.startsWith('models/')
    ? rawModel
    : `models/${rawModel}`

  const shouldUseStub =
    provider !== 'gemini' || config.geminiDisabled || !apiKey || !model

  // If we’re not able / allowed to call Gemini, use deterministic stub vectors
  if (shouldUseStub) {
    return texts.map((text) => buildStubVector(text))
  }

  const vectors: number[][] = []

  for (let i = 0; i < texts.length; i += MAX_BATCH) {
    const slice = texts.slice(i, i + MAX_BATCH)
    const batchVectors = await requestEmbeddingBatch(slice, model, apiKey)
    vectors.push(...batchVectors)
  }

  return vectors
}

async function requestEmbeddingBatch(
  texts: string[],
  model: string,
  apiKey: string,
) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents`

  const body = {
    requests: texts.map((text) => ({
      model,
      content: {
        parts: [{ text: text?.length ? text : ' ' }],
      },
      // Optional: you *can* force dim 768 explicitly if you want:
      // taskType: 'RETRIEVAL_DOCUMENT',
      // outputDimensionality: EMBEDDING_DIM,
    })),
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('Gemini embedding request failed (network)', err)
    // fall back to stub vectors
    return texts.map((text) => buildStubVector(text))
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini embedding HTTP error', response.status, errorText)
    throw createError({
      statusCode: 500,
      statusMessage: `Gemini embedding request failed (${response.status})`,
    })
  }

  let payload: any
  try {
    payload = await response.json()
  } catch (err) {
    console.error('Gemini embedding JSON parse failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini embedding response was invalid JSON.',
    })
  }

  const embeddings = Array.isArray(payload?.embeddings) ? payload.embeddings : []

  return texts.map((text, index) => {
    const vector = embeddings[index]?.values
    if (Array.isArray(vector) && vector.length === EMBEDDING_DIM) {
      // Happy path: Gemini returned 768-dim
      return vector
    }
    // Fallback: if Gemini gives something unexpected, build a stub with 768 dims
    return buildStubVector(text)
  })
}

/**
 * Deterministic stub vector with the same dimension as your pgvector column.
 */
function buildStubVector(text: string) {
  const normalized = typeof text === 'string' ? text : ''
  const vector: number[] = []
  let seed = 0

  for (let i = 0; i < normalized.length; i += 1) {
    seed = (seed * 31 + normalized.charCodeAt(i)) >>> 0
  }

  for (let i = 0; i < EMBEDDING_DIM; i += 1) {
    seed = (1103515245 * seed + 12345) >>> 0
    vector.push((seed % 1000) / 1000)
  }

  return vector
}
