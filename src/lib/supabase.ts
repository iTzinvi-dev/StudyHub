import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Missing config is a deployment mistake, not a runtime surprise — surface it
 * plainly instead of throwing a cryptic error deep inside a query.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const configError =
  "Supabase isn’t configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild."

let client: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error(configError)
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}
