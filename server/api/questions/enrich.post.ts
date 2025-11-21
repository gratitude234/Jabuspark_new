import { createError } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { generateGeminiText } from '~/server/utils/gemini'
import { requireDocumentAccess } from '~/server/utils/documents'

interface EnrichRequestBody {
  docId?: string
  stem?: string
  context?: string
}

export async function enrichQuestionStem(
  event: H3Event,
  payload: { docId: string; stem: string; context: string },
) {
  const config = useRuntimeConfig()
  if (config.geminiDisabled) {
    return null
  }

  let userId: string | null = null
  try {
    const user = await serverSupabaseUser(event)
    userId = user?.id ?? null
  } catch {
    userId = null
  }

  await requireDocumentAccess({ docId: payload.docId, userId })

  const response = (await generateGeminiText({
    systemInstruction: `You only return JSON with options, answer index, and explanation.`.trim(),
    userParts: [
      `Use ONLY the provided CONTEXT to propose plausible options for the stem.`,
      `CONTEXT:\n${payload.context}`,
      `STEM:\n${payload.stem}`,
      `Return JSON exactly as { "options": ["..."], "answer": 0, "explanation": "..." }`,
    ],
    responseMimeType: 'application/json',
    temperature: 0.2,
    maxOutputTokens: 512,
  })) as Record<string, any>

  const normalized = normalizeEnrichResponse(response)
  if (!normalized) return null

  return normalized
}

export default defineEventHandler(async (event) => {
  const body = await readBody<EnrichRequestBody>(event)

  if (!body?.docId || typeof body.docId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'docId is required.' })
  }

  const stem = typeof body.stem === 'string' ? body.stem.trim() : ''
  if (!stem) {
    throw createError({ statusCode: 400, statusMessage: 'stem is required.' })
  }

  const context = typeof body.context === 'string' ? body.context.trim() : ''
  if (!context) {
    throw createError({ statusCode: 400, statusMessage: 'context is required.' })
  }

  const enriched = await enrichQuestionStem(event, {
    docId: body.docId,
    stem,
    context,
  })

  if (!enriched) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to enrich question stem.' })
  }

  return enriched
})

function normalizeEnrichResponse(payload: any) {
  const rawOptions = Array.isArray(payload?.options) ? payload.options : []
  const options = rawOptions
    .map((option) =>
      typeof option === 'string'
        ? option.trim()
        : option != null
          ? String(option)
          : '',
    )
    .filter((option) => option.length > 0)
    .slice(0, 5)

  if (options.length < 2) return null

  const answerValue = payload?.answer
  const correct = typeof answerValue === 'number' ? clamp(answerValue, 0, options.length - 1) : 0

  const explanation =
    typeof payload?.explanation === 'string' && payload.explanation.trim().length
      ? payload.explanation.trim()
      : null

  return { options, correct, explanation }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
