// Generates section-level topic metadata and question batches via Gemini so ingestion can store reusable drills.
import { createError } from 'h3'
import { generateGeminiText, stripCodeFences } from '~/server/utils/gemini'

export interface GeneratedSectionPayload {
  topicTitle: string
  topicSlug: string
  topicSummary: string
  questions: Array<{
    type: 'mcq' | 'short_answer'
    stem: string
    options: string[]
    correctIndex: number
    correctText?: string
    explanation?: string
  }>
}

export async function generateSectionQuestionsFromText(params: {
  text: string
  courseName?: string
  maxQuestions?: number
}): Promise<GeneratedSectionPayload> {
  const { text, courseName, maxQuestions } = params
  const trimmedText = typeof text === 'string' ? text.trim() : ''
  if (!trimmedText) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source text is required to generate questions.',
    })
  }

  const limit = clamp(maxQuestions ?? 10, 1, 20)
  const systemInstruction =
    'You are an exam setter for Nigerian university nursing students (200 level). You write clear, accurate questions based ONLY on the source text provided.'

  const prompt = buildPrompt(trimmedText, limit, courseName)

  const raw = await generateGeminiText({
    systemInstruction,
    userParts: [prompt],
    responseMimeType: 'application/json',
    maxOutputTokens: 1024,
  })

  let parsed: any
  try {
    const cleaned = stripCodeFences(raw)
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse Gemini JSON for section questions', err, raw)
    throw createError({
      statusCode: 502,
      statusMessage: 'Gemini returned malformed JSON while generating questions.',
    })
  }

  return normalizePayload(parsed, limit)
}

function buildPrompt(text: string, limit: number, courseName?: string) {
  const contextLine = courseName?.trim()
    ? `Course context: ${courseName.trim()}\n`
    : ''
  return (
    `${contextLine}From the text below, do three things:\n` +
    `\n` +
    `1. Create a short, clear TOPIC TITLE that a 200-level nursing student would immediately understand (max 10 words).\n` +
    `2. Write a 1-2 sentence SUMMARY of that topic in simple language.\n` +
    `3. Generate up to ${limit} exam-style questions (mix of MCQ and short-answer) based ONLY on the text.\n` +
    `\n` +
    `Return STRICT JSON in this exact shape:\n` +
    `\n` +
    `{\n` +
    `  "topicTitle": "string",\n` +
    `  "topicSlug": "string-with-dashes",\n` +
    `  "topicSummary": "string",\n` +
    `  "questions": [\n` +
    `    {\n` +
    `      "type": "mcq" or "short_answer",\n` +
    `      "stem": "string",\n` +
    `      "options": ["A", "B", "C", "D"],\n` +
    `      "correctIndex": 0,\n` +
    `      "correctText": "string",\n` +
    `      "explanation": "string"\n` +
    `    }\n` +
    `  ]\n` +
    `}\n` +
    `\n` +
    `Rules:\n` +
    `* For "mcq" questions, you MUST supply 3-5 options and a valid correctIndex (0-based index into options).\n` +
    `* For "short_answer" questions, set "options": [] and "correctIndex": -1 and fill "correctText" with the expected answer.\n` +
    `* All questions must be answerable using ONLY the source text.\n` +
    `* Do not include any markdown; only valid JSON.\n` +
    `\n` +
    `Source text:\n"""${text}"""`
  )
}

function normalizePayload(raw: any, limit: number): GeneratedSectionPayload {
  const fallbackTopic = 'Study Topic'
  const topicTitle =
    typeof raw?.topicTitle === 'string' && raw.topicTitle.trim().length
      ? raw.topicTitle.trim()
      : fallbackTopic
  const slugSource =
    typeof raw?.topicSlug === 'string' && raw.topicSlug.trim().length
      ? raw.topicSlug
      : topicTitle

  const topicSummary =
    typeof raw?.topicSummary === 'string' ? raw.topicSummary.trim() : ''

  const questionsArray = Array.isArray(raw?.questions) ? raw.questions : []
  const normalizedQuestions = questionsArray
    .map((question, index) => normalizeQuestion(question, index))
    .filter(Boolean)
    .slice(0, limit) as GeneratedSectionPayload['questions']

  return {
    topicTitle,
    topicSlug: slugifyTopic(slugSource),
    topicSummary,
    questions: normalizedQuestions,
  }
}

function normalizeQuestion(
  value: any,
  index: number,
): GeneratedSectionPayload['questions'][number] | null {
  const stem =
    typeof value?.stem === 'string'
      ? value.stem.trim()
      : typeof value?.question === 'string'
        ? value.question.trim()
        : ''
  if (!stem) return null

  const type: 'mcq' | 'short_answer' =
    value?.type === 'short_answer' ? 'short_answer' : 'mcq'
  const rawOptions = Array.isArray(value?.options)
    ? value?.options
    : Array.isArray(value?.choices)
      ? value.choices
      : []
  const options = type === 'mcq' ? sanitizeOptions(rawOptions) : []

  if (type === 'mcq' && options.length < 3) {
    return null
  }

  let correctIndex = -1
  if (type === 'mcq') {
    const candidate =
      typeof value?.correctIndex === 'number'
        ? value.correctIndex
        : typeof value?.correct === 'number'
          ? value.correct
          : typeof value?.answer === 'number'
            ? value.answer
            : 0
    correctIndex = clamp(candidate, 0, options.length - 1)
  }

  const correctTextRaw =
    typeof value?.correctText === 'string'
      ? value.correctText
      : typeof value?.answerText === 'string'
        ? value.answerText
        : typeof value?.answer === 'string'
          ? value.answer
          : ''
  const normalizedCorrectText = correctTextRaw.trim()

  if (type === 'short_answer' && !normalizedCorrectText) {
    return null
  }

  const explanation =
    typeof value?.explanation === 'string' && value.explanation.trim().length
      ? value.explanation.trim()
      : undefined

  return {
    type,
    stem,
    options,
    correctIndex: type === 'mcq' ? correctIndex : -1,
    correctText:
      type === 'short_answer'
        ? normalizedCorrectText
        : normalizedCorrectText || undefined,
    explanation,
  }
}

function sanitizeOptions(options: any[]): string[] {
  const normalized = options
    .map((option) =>
      typeof option === 'string'
        ? option.trim()
        : typeof option === 'number'
          ? option.toString()
          : '',
    )
    .filter((option) => option.length > 0)
    .slice(0, 5)
  return normalized
}

function slugifyTopic(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'topic'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
