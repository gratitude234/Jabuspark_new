// server/utils/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * If you have generated Database types from Supabase, you can import them and
 * replace `any` here:
 *
 *   import type { Database } from '~/types/database'
 *   type ServiceClient = SupabaseClient<Database>
 *
 * For now we keep it generic so it compiles either way.
 */
type ServiceClient = SupabaseClient<any>

let cachedServiceClient: ServiceClient | null = null

export function createServiceClient(): ServiceClient {
  if (cachedServiceClient) return cachedServiceClient

  const config = useRuntimeConfig()

  // Prefer Nuxt runtime config (what you already set in nuxt.config.ts)
  const supabaseUrl =
    (config.public as any)?.supabaseUrl ||
    process.env.NUXT_SUPABASE_URL ||
    process.env.SUPABASE_URL

  const serviceKey =
    (config as any).supabaseServiceKey ||
    process.env.NUXT_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Supabase service client misconfigured – check supabase URL and service key in runtimeConfig / env vars.',
    )
  }

  cachedServiceClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      // We’re on the server, no need to persist sessions
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedServiceClient
}
