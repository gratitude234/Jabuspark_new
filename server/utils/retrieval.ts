export interface PageChunk {
  page: number
  content: string
  embedding?: number[]
  doc_id?: string
}

export function chunkPages(pages: { page: number; content: string }[], chunkSize = 900) {
  const chunks: PageChunk[] = []
  pages.forEach((page) => {
    const text = page.content.replace(/\s+/g, ' ').trim()
    if (!text) return
    for (let i = 0; i < text.length; i += chunkSize) {
      const slice = text.slice(i, i + chunkSize)
      chunks.push({ page: page.page, content: slice })
    }
  })
  return chunks
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

export function composeAnswer(question: string, matches: { content: string; score: number; page: number; doc_id: string; doc_title?: string }[]) {
  if (!matches.length) {
    return {
      answer: 'Need more sources. Upload the relevant PDF first.',
      citations: [],
      confidence: 0,
    }
  }
  const top = matches.slice(0, 3)
  const sentences = top.map((chunk) => summarizeChunk(chunk.content))
  const answer = sentences.join(' ').slice(0, 400)
  const citations = top.map((chunk) => ({
    docId: chunk.doc_id,
    docTitle: chunk.doc_title || 'Doc',
    page: chunk.page,
    span: chunk.content.slice(0, 160),
  }))
  const mean = matches.reduce((sum, item) => sum + item.score, 0) / matches.length
  const confidence = Math.max(0, Math.min(0.99, (mean + 1) / 2))
  return { answer, citations, confidence }
}

function summarizeChunk(text: string) {
  const trimmed = text.trim()
  if (trimmed.length <= 150) return trimmed
  return trimmed.slice(0, 150) + '...'
}

