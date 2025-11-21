import { createError } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { generateGeminiText } from '~/server/utils/gemini'
import { requireDocumentAccess } from '~/server/utils/documents'

interface StemRequestBody {
  docId?: string
  context?: string
  count?: number
}

export async function generateQuestionStems(
  event: H3Event,
  payload: { docId: string; context: string; count?: number },
) {
  const config = useRuntimeConfig()
  if (config.geminiDisabled) {
    return [] as string[]
  }

  let userId: string | null = null
  try {
    const user = await serverSupabaseUser(event)
    userId = user?.id ?? null
  } catch {
    userId = null
  }

  await requireDocumentAccess({ docId: payload.docId, userId })

  const count = clamp(typeof payload.count === 'number' ? payload.count : 3, 1, 10)

  const response = (await generateGeminiText({
    systemInstruction: `You are a strict JSON generator that only returns question stems.`.trim(),
    userParts: [
      `Use ONLY the provided CONTEXT to create concise question stems for Nigerian nursing students.`,
      `CONTEXT:\n${payload.context}`,
      `Return ${count} stems as JSON with a questions array of plain strings. No options or answers.`,
    ],
    responseMimeType: 'application/json',
    temperature: 0.2,
    maxOutputTokens: 512,
  })) as Record<string, any>

  const stemsSource = Array.isArray(response?.questions)
    ? response.questions
    : Array.isArray(response)
      ? response
      : []

  const stems: string[] = []
  for (const stem of stemsSource) {
    const value = typeof stem === 'string' ? stem : typeof stem?.stem === 'string' ? stem.stem : ''
    const normalized = value.trim()
    if (normalized.length) {
      stems.push(normalized)
    }
    if (stems.length >= count) break
  }

  return stems
}

export default defineEventHandler(async (event) => {
  const body = await readBody<StemRequestBody>(event)

  if (!body?.docId || typeof body.docId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'docId is required.' })
  }

  const context = typeof body.context === 'string' ? body.context.trim() : ''
  if (!context) {
    throw createError({
      statusCode: 400,
      statusMessage: 'context is required and must be non-empty.',
    })
  }

  const stems = await generateQuestionStems(event, {
    docId: body.docId,
    context,
    count: body.count,
  })

  return { stems }
})

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
