import { createError } from 'h3'

const STUB_VECTOR_SIZE = 768
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
  const rawModel =
    (config.geminiModelEmbedding as string | undefined) || 'text-embedding-004'

  // Normalise to resource name: models/xxx
  const model = rawModel.startsWith('models/')
    ? rawModel
    : `models/${rawModel}`

  const shouldUseStub =
    provider !== 'gemini' || config.geminiDisabled || !apiKey || !model

  if (shouldUseStub) {
    // deterministic fake vectors for local / offline work
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
  model: string,       // already normalised to "models/xxx"
  apiKey: string,
) {
  // Correct endpoint according to Gemini docs:
  // POST https://generativelanguage.googleapis.com/v1beta/{model=models/*}:batchEmbedContents
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents`

  const body = {
    // Each request repeats the same model name
    requests: texts.map((text) => ({
      model,
      content: {
        parts: [{ text: text?.length ? text : ' ' }],
      },
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
    // fall back to stub vectors if the network call dies
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
    if (Array.isArray(vector) && vector.length) {
      return vector
    }
    // if Gemini doesn’t return a vector for some item, use stub with correct dim
    return buildStubVector(text)
  })
}

function buildStubVector(text: string) {
  const normalized = typeof text === 'string' ? text : ''
  const vector: number[] = []
  let seed = 0

  for (let i = 0; i < normalized.length; i += 1) {
    seed = (seed * 31 + normalized.charCodeAt(i)) >>> 0
  }

  for (let i = 0; i < STUB_VECTOR_SIZE; i += 1) {
    seed = (1103515245 * seed + 12345) >>> 0
    vector.push((seed % 1000) / 1000)
  }

  return vector
}
