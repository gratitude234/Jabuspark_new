// server/utils/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let serviceClient: SupabaseClient | null = null

export function createServiceClient() {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const serviceKey = config.supabaseServiceKey

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing Supabase service credentials. Check NUXT_SUPABASE_URL and NUXT_SUPABASE_SERVICE_KEY in your env.',
    )
  }

  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        // Let Supabase reuse the platform fetch (works on Vercel)
        fetch: (input, init) => fetch(input as any, init as any),
      },
    })
  }

  return serviceClient
}
