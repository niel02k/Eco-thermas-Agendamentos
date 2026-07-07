import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com privilégios de service_role.
 * NUNCA expor no client — usar apenas em Server Actions e Route Handlers.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Configurações do Supabase Admin não encontradas no .env')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
