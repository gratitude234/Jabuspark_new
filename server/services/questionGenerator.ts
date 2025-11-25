import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { createServiceClient } from '~/server/utils/supabase'

interface QuestionPayload {
  stem: string
  options: string[]
  correct_index: number
  explanation?: string
  difficulty?: string
  topic_tags?: string[]
}

const AI_ENDPOINT = 'https://example-ai-service.com/generate-questions'

export async function generateQuestionsForDocument(docId: string) {
  const supabase = createServiceClient()

  const { data: document, error: docError } = await supabase
    .from('documents')
    .select(
      'id, user_id, title, storage_path, course_code, level, question_status, question_count, approval_status',
    )
    .eq('id', docId)
    .maybeSingle()

  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message })
  }
  if (!document) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('docs')
    .download(document.storage_path)

  if (downloadError || !fileData) {
    throw createError({
      statusCode: 500,
      statusMessage: downloadError?.message || 'Unable to download PDF from storage.',
    })
  }

  const arrayBuffer = await fileData.arrayBuffer()
  const pdfBase64 = Buffer.from(arrayBuffer).toString('base64')

  const response = await $fetch<{ questions: QuestionPayload[] }>(AI_ENDPOINT, {
    method: 'POST',
    body: {
      pdf_base64: pdfBase64,
      metadata: {
        doc_id: document.id,
        title: document.title,
        course_code: document.course_code,
        level: document.level,
      },
    },
  })

  const questions = response.questions || []
  if (!questions.length) {
    return { document, insertedCount: 0 }
  }

  const rows = questions.map((q) => ({
    id: randomUUID(),
    doc_id: document.id,
    stem: q.stem,
    options: q.options,
    correct: q.correct_index,
    explanation: q.explanation || null,
    difficulty: q.difficulty || null,
    topic_tags: q.topic_tags || [],
  }))

  const { error: insertError } = await supabase.from('questions').insert(rows)
  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  const newCount = (document.question_count || 0) + rows.length
  const updates = { question_status: 'has_questions', question_count: newCount }
  const { error: updateError } = await supabase.from('documents').update(updates).eq('id', document.id)
  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return { document: { ...document, ...updates }, insertedCount: rows.length }
}
