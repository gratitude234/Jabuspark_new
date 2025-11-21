import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'
import { requireDocumentAccess } from '~/server/utils/documents'
import { generateQuestionStems } from './stems.post'
import { enrichQuestionStem } from './enrich.post'

interface GenerateQuestionsBody {
  docId?: string
  sectionTitle?: string
  context?: string
  count?: number
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

  const { doc, supabase } = await requireDocumentAccess({
    docId: body.docId,
    userId,
    supabase: createServiceClient(),
    fields: 'id, user_id, course, title, course_code',
  })

  const count = clamp(typeof body.count === 'number' ? body.count : 5, 1, 10)

  try {
    const stems = await generateQuestionStems(event, {
      docId: body.docId,
      context,
      count,
    })

    if (!stems.length) {
      return { success: true, docId: body.docId, created: 0 }
    }

    const sectionTitle =
      body.sectionTitle?.trim() ||
      doc.title ||
      doc.course ||
      (doc as any).course_code ||
      'Generated Section'

    const rows: Array<{
      id: string
      doc_id: string
      section_topic: string
      stem: string
      options: string[]
      correct: number
      explanation: string | null
      difficulty: string | null
      topic_tags: string[] | null
    }> = []

    for (const stem of stems) {
      const enriched = await enrichQuestionStem(event, {
        docId: body.docId,
        stem,
        context,
      })
      if (!enriched) continue

      rows.push({
        id: randomUUID(),
        doc_id: body.docId,
        section_topic: sectionTitle,
        stem,
        options: enriched.options,
        correct: enriched.correct,
        explanation: enriched.explanation || null,
        difficulty: 'medium',
        topic_tags: [],
      })
    }

    if (!rows.length) {
      return { success: true, docId: body.docId, created: 0 }
    }

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
      // errors from generateGeminiText come through here
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
