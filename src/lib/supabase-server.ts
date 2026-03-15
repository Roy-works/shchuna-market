import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

// Server-side Supabase client (for Server Components & Route Handlers)
export function createServerSupabaseClient() {
    const cookieStore = cookies()
    return createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
              cookies: {
                        getAll() {
                                    return cookieStore.getAll()
                        },
        setAll(cookiesToSet: CookieToSet[]) {
                                    try {
                                                  cookiesToSet.forEach(({ name, value, options }) =>
                                                                  cookieStore.set(name, value, options)
                                                                                   )
                                    } catch {
                                                  // Called from a Server Component - safe to ignore
                                    }
                        },
              },
      }
        )
}
