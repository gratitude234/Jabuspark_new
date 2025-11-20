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
  const parts = candidate?.content?.parts || []

  // If caller asked for JSON, return parsed JSON object
  if (responseMimeType === 'application/json') {
    let combined = parts
      .map((p: any) => p.text || '')
      .join('')
      .trim()

    if (!combined) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Gemini returned empty JSON response',
      })
    }

    // 1) strip ```json ... ``` fences if present
    combined = combined.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

    // 2) remove trailing commas before ] or }
    combined = combined.replace(/,\s*(\]|\})/g, '$1')

    try {
      return JSON.parse(combined)
    } catch (err) {
      console.error('Gemini JSON content parse failed', combined, err)
      throw createError({
        statusCode: 500,
        statusMessage: 'Gemini returned invalid JSON content.',
      })
    }
  }

  // Default: return plain text
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
