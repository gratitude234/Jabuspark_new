import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Document id required' })

  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Auth required' })

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('id, user_id, visibility, course_id, approval_status, question_status')
    .eq('id', id)
    .maybeSingle()

  if (docError) throw createError({ statusCode: 500, statusMessage: docError.message })
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Document not found' })

  if (doc.visibility === 'personal' && doc.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  if (doc.visibility === 'course') {
    if (doc.approval_status !== 'approved') {
      throw createError({ statusCode: 403, statusMessage: 'Document not approved' })
    }
    if (!doc.course_id) {
      throw createError({ statusCode: 400, statusMessage: 'Course not linked' })
    }
    const { data: enrolment, error: enrolError } = await supabase
      .from('course_enrolments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', doc.course_id)
      .maybeSingle()
    if (enrolError) throw createError({ statusCode: 500, statusMessage: enrolError.message })
    if (!enrolment) {
      throw createError({ statusCode: 403, statusMessage: 'Not enrolled for this course' })
    }
  }

  if (doc.question_status !== 'has_questions') {
    throw createError({ statusCode: 400, statusMessage: 'Questions not available' })
  }

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, stem, options, correct, explanation, difficulty, topic_tags, created_at')
    .eq('doc_id', id)
    .order('created_at', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return questions || []
})
