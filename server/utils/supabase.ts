import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Supabase service credentials',
    })
  }
  return createClient(config.public.supabaseUrl, config.supabaseServiceKey)
}
