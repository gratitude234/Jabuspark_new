import { createError } from 'h3'

const GEMINI_DISABLED_MESSAGE = 'Gemini is currently disabled. Please try again later.'

export interface GeminiOptions {
  systemInstruction?: string
  userParts: string[]
  temperature?: number
  maxOutputTokens?: number
  responseMimeType?: string
}

export async function generateGeminiText(options: GeminiOptions) {
  const { systemInstruction, userParts, temperature, maxOutputTokens, responseMimeType } =
    options
  const config = useRuntimeConfig()

  if (config.geminiDisabled) {
    return GEMINI_DISABLED_MESSAGE
  }

  const apiKey = config.geminiApiKey as string | undefined
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API key missing',
    })
  }

  const model =
    (config.geminiModelText as string | undefined) || 'models/gemini-2.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const payload: Record<string, any> = {
    contents: [
      {
        role: 'user',
        parts: buildTextParts(userParts),
      },
    ],
  }

  if (systemInstruction?.trim()) {
    payload.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction.trim() }],
    }
  }

  const generationConfig: Record<string, any> = {}
  generationConfig.temperature =
    typeof temperature === 'number' ? temperature : 0.2
  generationConfig.maxOutputTokens =
    typeof maxOutputTokens === 'number' ? maxOutputTokens : 1024
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType
  }
  payload.generationConfig = generationConfig

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini request failed', response.status, errorText)
    throw createError({
      statusCode: 500,
      statusMessage: `Gemini request failed (${response.status})`,
    })
  }

  let data: any
  try {
    data = await response.json()
  } catch (err) {
    console.error('Failed to parse Gemini response JSON', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini returned invalid JSON.',
    })
  }

  const textPayload = extractGeminiText(data)
  if (!textPayload) {
    console.error('Gemini returned empty payload', data)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini returned empty response.',
    })
  }

  if (responseMimeType === 'application/json') {
    try {
      return JSON.parse(textPayload)
    } catch (err) {
      console.error('Gemini JSON parse failed', err, textPayload)
      throw createError({
        statusCode: 500,
        statusMessage: 'Gemini returned malformed JSON.',
      })
    }
  }

  return textPayload
}

export function extractGeminiText(payload: any) {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  const segments: string[] = []
  for (const part of parts) {
    if (typeof part?.text === 'string') {
      segments.push(part.text)
      continue
    }
    if (part?.functionCall?.args) {
      try {
        segments.push(JSON.stringify(part.functionCall.args))
        continue
      } catch {
        // ignore serialization failure and keep trying other formats
      }
    }
    if (part?.inlineData?.data) {
      try {
        const decoded = Buffer.from(part.inlineData.data, 'base64').toString('utf8')
        segments.push(decoded)
        continue
      } catch {
        // ignore decode failure
      }
    }
    if (part?.mimeType === 'application/json' && part?.data) {
      try {
        segments.push(Buffer.from(part.data, 'base64').toString('utf8'))
        continue
      } catch {
        // ignore decode failure
      }
    }
    if (part && typeof part === 'object') {
      try {
        segments.push(JSON.stringify(part))
      } catch {
        // ignore
      }
    }
  }
  return segments.join('\n').trim()
}

export function stripCodeFences(text: string) {
  if (!text) return ''
  return text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()
}

function buildTextParts(parts: string[]) {
  const safeParts = Array.isArray(parts) && parts.length ? parts : ['']
  return safeParts.map((part) => ({
    text: typeof part === 'string' && part.length ? part : ' ',
  }))
}
