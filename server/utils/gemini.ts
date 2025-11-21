import { createError } from 'h3'

interface GeminiOptions {
  systemInstruction?: string
  userParts: string[]
  temperature?: number
  maxOutputTokens?: number
  responseMimeType?: string // e.g. 'application/json' for structured output
}

export async function generateGeminiText({
  systemInstruction,
  userParts,
  temperature = 0.2,
  maxOutputTokens = 1024,
  responseMimeType,
}: GeminiOptions) {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey as string | undefined
  const rawModel =
    (config.geminiModelText as string | undefined) || 'gemini-2.5-flash'

  // Normalise to full resource name "models/xxx"
  const model = rawModel.startsWith('models/')
    ? rawModel
    : `models/${rawModel}`

  if (config.geminiDisabled) {
    // Friendly offline message for when Gemini is intentionally disabled
    return 'Gemini is currently disabled. Please try again later.'
  }

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API key missing',
    })
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`

  const contents = [
    {
      role: 'user',
      parts: (userParts || []).map((text) => ({ text })),
    },
  ]

  const body: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  }

  if (responseMimeType) {
    body.generationConfig.responseMimeType = responseMimeType
  }

  if (systemInstruction) {
    body.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }],
    }
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('Gemini text request failed (network)', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini request failed (network error)',
    })
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini text HTTP error', response.status, errorText)
    throw createError({
      statusCode: 500,
      statusMessage: `Gemini request failed (${response.status})`,
    })
  }

  let payload: any
  try {
    payload = await response.json()
  } catch (err) {
    console.error('Gemini text JSON parse failed (outer payload)', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini response was invalid JSON.',
    })
  }

  const candidate = payload?.candidates?.[0]

  // If there is no candidate at all, **soft-fail** for JSON mode, hard-fail for text mode
  if (!candidate) {
    console.error(
      'Gemini returned no candidates',
      JSON.stringify(payload?.promptFeedback || payload, null, 2),
    )

    if (responseMimeType === 'application/json') {
      // For structured JSON callers (like questions) just give empty result
      return { questions: [] }
    }

    const blockReason =
      payload?.promptFeedback?.blockReason ||
      payload?.promptFeedback?.safetyRatings?.[0]?.category ||
      'unknown'
    throw createError({
      statusCode: 502,
      statusMessage: `Gemini returned no content (block reason: ${blockReason})`,
    })
  }

  const parts = candidate?.content?.parts || []

  // ─────────────────────────────
  // JSON MODE (question generator etc.)
  // ─────────────────────────────
  if (responseMimeType === 'application/json') {
    let combined = parts
      .map((p: any) => p.text || '')
      .join('')
      .trim()

    if (!combined) {
      // Soft fail: treat as "no questions", don't crash
      console.warn('Gemini JSON empty response for structured call')
      return { questions: [] }
    }

    // 0) Try to keep only the JSON object if there is extra noise
    const firstBrace = combined.indexOf('{')
    const lastBrace = combined.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      combined = combined.slice(firstBrace, lastBrace + 1)
    }

    // 1) strip ```json ... ``` fences if present
    combined = combined.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

    // 2) remove trailing commas before ] or }
    combined = combined.replace(/,\s*(\]|\})/g, '$1')

    try {
      return JSON.parse(combined)
    } catch (err) {
      // At this point Gemini gave us broken JSON. Log it but don't crash the app.
      console.error('Gemini JSON content parse failed', combined, err)
      // Soft-fail: return an object the caller can treat as "no questions".
      return { questions: [] }
    }
  }

  // ─────────────────────────────
  // TEXT MODE (Ask chat etc.)
  // ─────────────────────────────
  const fullText = parts
    .map((p: any) => p.text || '')
    .join('')
    .trim()

  if (!fullText) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini returned empty response',
    })
  }

  return fullText
}
