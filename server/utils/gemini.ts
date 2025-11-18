import { createError } from 'h3'

interface GeminiOptions {
  systemInstruction?: string
  userParts: string[]
  temperature?: number
  responseMimeType?: string
  maxOutputTokens?: number
}

export async function generateGeminiText({
  systemInstruction,
  userParts,
  temperature = 0.2,
  responseMimeType,
  maxOutputTokens,
}: GeminiOptions) {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey as string | undefined
  // default to Gemini 2.5 flash if nothing is set in runtimeConfig
  const configuredModel =
    (config.geminiTextModel as string | undefined) || 'models/gemini-2.5-flash'
  // API expects model names without the leading "models/" when you build the path yourself
  const model = configuredModel.replace(/^models\//, '')

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API key missing',
    })
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const parts = (userParts || []).map((text) => ({ text }))

  // Build generation config using camelCase keys expected by the v1beta API
  const generationConfig: Record<string, any> = {}
  if (typeof temperature === 'number') {
    generationConfig.temperature = temperature
  }
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType
  }
  if (typeof maxOutputTokens === 'number') {
    generationConfig.maxOutputTokens = maxOutputTokens
  }

  // Build payload with correct field names for Gemini REST API
  const payload: Record<string, any> = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
  }

  if (systemInstruction) {
    payload.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }],
    }
  }

  if (Object.keys(generationConfig).length) {
    payload.generationConfig = generationConfig
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  // Read raw text once so we can both log and parse it
  const raw = await response.text()
  let data: any = raw

  try {
    data = JSON.parse(raw)
  } catch {
    // leave data as raw string if it isn't JSON
  }

  if (!response.ok) {
    console.error('GEMINI HTTP ERROR:', response.status, data)
    throw createError({
      statusCode: response.status,
      statusMessage: `Gemini generate failed: ${raw}`,
    })
  }

  const text = extractGeminiText(data)

  if (!text) {
    console.error('GEMINI EMPTY / NO USABLE TEXT. FULL PAYLOAD:', data)
    throw createError({
      statusCode: 502,
      statusMessage: 'Gemini response was empty.',
    })
  }

  return text
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
