import { randomUUID } from 'node:crypto'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'
import { generateGeminiText } from '~/server/utils/gemini'

type QuestionMode = 'mcq' | 'short-answer'

interface GenerateQuestionsBody {
  docId?: string
  sectionTitle?: string
  context?: string
  count?: number
  mode?: QuestionMode
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<GenerateQuestionsBody>(event)

  if (config.geminiDisabled) {
    return {
      success: false,
      docId: body?.docId || null,
      created: 0,
      message: 'Gemini is currently disabled.',
    }
  }

  let userId: string | null = null
  try {
    const user = await serverSupabaseUser(event)
    userId = user?.id ?? null
  } catch {
    userId = null
  }

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

  const supabase = createServiceClient()
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, user_id, course, title')
    .eq('id', body.docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found.' })
  }
  if (userId && doc.user_id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this document.',
    })
  }

  const mode: QuestionMode = body.mode === 'short-answer' ? 'short-answer' : 'mcq'
  const count = clamp(typeof body.count === 'number' ? body.count : 5, 1, 10)

  try {
    const geminiResponse = (await generateGeminiText({
      systemInstruction:
        'You are an exam generator for Joseph Ayo Babalola University nursing students. Return ONLY strict JSON that matches the required shape.',
      userParts: [
        `Source context:\n\n${context}`,
        `Generate ${count} ${mode === 'mcq' ? 'multiple-choice' : 'short-answer'} questions using only this context.`,
        'Format: {"questions":[{"question":"...", "options":["A","B","C","D"], "answer":0, "explanation":"..."}]} and omit any markdown or commentary.',
      ],
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 1024,
    })) as Record<string, any>

    const questions = normalizeGeminiQuestions(geminiResponse, mode, count)
    if (!questions.length) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Gemini returned no usable questions.',
      })
    }

    const sectionTitle =
      body.sectionTitle?.trim() || doc.title || doc.course || 'Generated Section'

    const rows = questions.map((question) => ({
      id: randomUUID(),
      doc_id: body.docId,
      section_topic: sectionTitle,
      stem: question.stem,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation,
    }))

    const { error: insertError } = await supabase.from('questions').insert(rows)
    if (insertError) {
      console.error('Failed to insert generated questions', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Could not store generated questions.',
      })
    }

    return {
      success: true,
      docId: body.docId,
      created: rows.length,
    }
  } catch (err: any) {
    if (err?.statusCode) {
      throw err
    }
    console.error('Question batch generation failed', err)
    throw createError({
      statusCode: 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Failed to generate section questions.',
    })
  }
})

function normalizeGeminiQuestions(
  payload: any,
  mode: QuestionMode,
  limit: number,
) {
  const rawQuestions = Array.isArray(payload?.questions)
    ? payload.questions
    : Array.isArray(payload)
      ? payload
      : []

  const normalized: Array<{
    stem: string
    options: string[]
    correct: number
    explanation: string | null
  }> = []

  for (const raw of rawQuestions) {
    const stemCandidate =
      typeof raw?.stem === 'string'
        ? raw.stem
        : typeof raw?.question === 'string'
          ? raw.question
          : typeof raw?.prompt === 'string'
            ? raw.prompt
            : ''

    const stem = stemCandidate.trim()
    if (!stem) continue

    const explanation =
      typeof raw?.explanation === 'string' && raw.explanation.trim().length
        ? raw.explanation.trim()
        : null

    const options =
      mode === 'mcq'
        ? sanitizeOptions(Array.isArray(raw?.options) ? raw.options : raw?.choices || [])
        : []

    if (mode === 'mcq' && options.length < 2) {
      continue
    }

    const answerValue =
      raw?.answer ?? raw?.correct ?? raw?.correctIndex ?? raw?.answerIndex

    let correct = -1
    if (mode === 'mcq') {
      if (typeof answerValue === 'number') {
        correct = clamp(answerValue, 0, options.length - 1)
      } else if (typeof answerValue === 'string') {
        const idx = options.findIndex(
          (option) => option.toLowerCase() === answerValue.trim().toLowerCase(),
        )
        correct = idx >= 0 ? idx : 0
      } else {
        correct = 0
      }
    }

    normalized.push({
      stem,
      options,
      correct,
      explanation,
    })

    if (normalized.length >= limit) {
      break
    }
  }

  return normalized
}

function sanitizeOptions(values: unknown[]) {
  return values
    .map((value) =>
      typeof value === 'string'
        ? value.trim()
        : typeof value === 'number'
          ? String(value)
          : '',
    )
    .filter((value) => value.length > 0)
    .slice(0, 5)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
