import { createError } from 'h3'

const DEFAULT_VECTOR_SIZE = 768
const MAX_BATCH = 32

export async function embedText(text: string) {
  const vectors = await embedTexts([text])
  return vectors[0] || new Array(DEFAULT_VECTOR_SIZE).fill(0)
}

export async function embedTexts(texts: string[]) {
  const config = useRuntimeConfig()
  if (!texts.length) return []
  if (config.geminiDisabled) {
    return texts.map((text) => stubVector(text))
  }

  const apiKey = config.geminiApiKey as string | undefined
  const model =
    (config.geminiEmbeddingModel as string | undefined) || 'models/text-embedding-004'

  // read provider from public runtimeConfig
  const provider =
    ((config.public as any)?.embeddingProvider as string | undefined) || 'gemini'

  // If provider is not gemini or we’re missing config, just use stub vectors
  if (provider !== 'gemini' || !apiKey || !model) {
    return texts.map((text) => stubVector(text))
  }

  const vectors: number[][] = []
  for (let i = 0; i < texts.length; i += MAX_BATCH) {
    const slice = texts.slice(i, i + MAX_BATCH)
    const batchVectors = await requestEmbeddings(slice, model, apiKey)
    vectors.push(...batchVectors)
  }
  return vectors
}

async function requestEmbeddings(texts: string[], model: string, apiKey: string) {
  const body = {
    requests: texts.map((text) => ({
      model,
      content: {
        role: 'user',
        parts: [{ text: text || ' ' }],
      },
    })),
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/${model}:batchEmbedContents?key=${apiKey}`

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err: any) {
    // This is the "TypeError: fetch failed" case (DNS, network, etc.)
    console.error('Gemini fetch failed (network-level error):', err)
    // Don’t kill ingest – fall back to stub embeddings
    return texts.map((text) => stubVector(text))
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini HTTP error:', response.status, errorText)

    throw createError({
      statusCode: response.status,
      statusMessage: `Gemini embedding failed: ${errorText}`,
    })
  }

  const payload = await response.json()
  const embeddings = Array.isArray(payload?.embeddings) ? payload.embeddings : []

  return texts.map((text, index) => {
    const vector = embeddings[index]?.values
    if (Array.isArray(vector) && vector.length) {
      return vector
    }
    return stubVector(text)
  })
}

function stubVector(text: string) {
  const vector: number[] = []
  let seed = 0
  const normalized = text || ''
  for (let i = 0; i < normalized.length; i += 1) {
    seed = (seed + normalized.charCodeAt(i)) % 2147483647
  }
  for (let i = 0; i < DEFAULT_VECTOR_SIZE; i += 1) {
    seed = (seed * 16807) % 2147483647
    vector.push((seed % 2000) / 2000)
  }
  return vector
}
