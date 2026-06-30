import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes auth tokens from the Next.js cookie store.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll is called from Server Components where cookies cannot be
            // mutated. The middleware keeps the session fresh, so this is safe
            // to ignore here.
          }
        },
      },
    },
  )
}

/**
 * Returns the JWT claims for the currently authenticated user without making
 * a network request. Use this instead of getSession() for server-side auth
 * checks in Server Components and Route Handlers.
 *
 * Returns null claims when no session exists.
 */
export async function getClaims() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null
  return data.claims
}
