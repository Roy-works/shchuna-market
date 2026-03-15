'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // onAuthStateChange fires automatically when supabase processes
    // the #access_token hash fragment from the magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('neighborhood_id')
            .eq('id', session.user.id)
            .single()

          router.replace(!profile?.neighborhood_id ? '/onboarding' : '/feed')
        }
      }
    )

    // Also handle case where session already exists (e.g. page reload)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('neighborhood_id')
          .eq('id', session.user.id)
          .single()

        router.replace(!profile?.neighborhood_id ? '/onboarding' : '/feed')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🏘️</div>
        <p className="text-gray-600 text-lg">מאמת כניסה...</p>
        <div className="mt-4 flex gap-1 justify-center">
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
        </div>
      </div>
    </div>
  )
}
