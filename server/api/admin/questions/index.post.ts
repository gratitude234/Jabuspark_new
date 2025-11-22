import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/admin'

interface CreateQuestionBody {
  documentId?: string
  stem?: string
  options?: string[]
  correctIndex?: number
  explanation?: string | null
  difficulty?: string | null
  pageHint?: number | null
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const body = await readBody<CreateQuestionBody>(event)
  const { documentId, stem, options, correctIndex, explanation, difficulty, pageHint } = body || {}

  if (!documentId || typeof documentId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'documentId is required.' })
  }

  const cleanStem = typeof stem === 'string' ? stem.trim() : ''
  if (!cleanStem) {
    throw createError({ statusCode: 400, statusMessage: 'Question stem is required.' })
  }

  const optionList = Array.isArray(options)
    ? options
        .map((opt) => (typeof opt === 'string' ? opt.trim() : ''))
        .filter((opt) => opt.length > 0)
    : []
  if (!optionList.length) {
    throw createError({ statusCode: 400, statusMessage: 'Provide at least one answer option.' })
  }

  const index = typeof correctIndex === 'number' ? correctIndex : 0
  if (index < 0 || index >= optionList.length) {
    throw createError({ statusCode: 400, statusMessage: 'correctIndex is out of bounds.' })
  }

  const normalizedDifficulty =
    typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty)
      ? difficulty
      : null

  const page = typeof pageHint === 'number' && Number.isInteger(pageHint) ? pageHint : null

  const supabase = serverSupabaseClient(event)
  await requireAdminRole(supabase, user.id)

  const { data, error } = await supabase
    .from('questions')
    .insert({
      document_id: documentId,
      stem: cleanStem,
      options: optionList,
      correct_index: index,
      explanation: typeof explanation === 'string' && explanation.trim() ? explanation.trim() : null,
      difficulty: normalizedDifficulty,
      page_hint: page,
      created_by: user.id,
    })
    .select('*')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
