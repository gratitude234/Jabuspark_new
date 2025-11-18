// Server route that batches question generation for a single document section and persists AI-authored drills.
import { randomUUID } from 'node:crypto'
import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'
import { generateSectionQuestionsFromText } from '~/server/utils/sectionQuestions'

interface GenerateQuestionsBody {
  docId?: string
  text?: string
  courseName?: string
  maxQuestions?: number
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<GenerateQuestionsBody>(event)

  if (config.geminiDisabled) {
    return {
      topicTitle: null,
      topicSummary: null,
      questionsInserted: 0,
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
  if (!body.text || typeof body.text !== 'string' || !body.text.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Section text is required.' })
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
    throw createError({ statusCode: 403, statusMessage: 'You do not have access to this document.' })
  }

  try {
    const payload = await generateSectionQuestionsFromText({
      text: body.text,
      courseName: body.courseName || doc.course || doc.title || undefined,
      maxQuestions: body.maxQuestions,
    })

    const questionRows = payload.questions.map((question) => ({
      id: randomUUID(),
      doc_id: body.docId,
      section_topic: payload.topicTitle,
      stem: question.stem,
      options: question.options,
      correct: question.correctIndex,
      explanation: question.explanation || null,
    }))

    if (questionRows.length) {
      const { error: insertError } = await supabase.from('questions').insert(questionRows)
      if (insertError) {
        console.error('Failed to insert generated questions', insertError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Could not store generated questions.',
        })
      }
    }

    return {
      topicTitle: payload.topicTitle,
      topicSummary: payload.topicSummary,
      questionsInserted: questionRows.length,
    }
  } catch (err: any) {
    if (err?.statusCode) {
      throw err
    }
    console.error('Question batch generation failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.statusMessage || err?.message || 'Failed to generate section questions.',
    })
  }
})
