// server/utils/embeddings.ts
//
// Stub embeddings: we do NOT call any external AI service.
// This keeps /api/rag/ingest from ever failing because of Gemini / API keys.

const STUB_VECTOR_SIZE = 128 // or 768 if you prefer

export async function embedText(text: string) {
  const vectors = await embedTexts([text])
  return vectors[0] || buildStubVector(text)
}

export async function embedTexts(texts: string[]) {
  if (!Array.isArray(texts) || !texts.length) {
    return []
  }

  // Just return deterministic pseudo-random vectors for each text.
  return texts.map((text) => buildStubVector(text))
}

function buildStubVector(text: string) {
  const normalized = typeof text === 'string' ? text : ''
  const vector: number[] = []
  let seed = 0

  // simple hash from the text so it’s deterministic
  for (let i = 0; i < normalized.length; i += 1) {
    seed = (seed * 31 + normalized.charCodeAt(i)) >>> 0
  }

  for (let i = 0; i < STUB_VECTOR_SIZE; i += 1) {
    seed = (1103515245 * seed + 12345) >>> 0
    vector.push((seed % 1000) / 1000)
  }

  return vector
}
