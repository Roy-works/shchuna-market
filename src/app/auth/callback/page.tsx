'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function handleCallback() {
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('exchangeCodeForSession error:', error.message)
          router.replace('/login')
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('neighborhood_id')
          .eq('id', session.user.id)
          .single()
        router.replace(!profile?.neighborhood_id ? '/onboarding' : '/feed')
        return
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            const { data: profile } = await supabase
              .from('profiles')
              .select('neighborhood_id')
              .eq('id', session.user.id)
              .single()
            router.replace(!profile?.neighborhood_id ? '/onboarding' : '/feed')
          }
        }
      )

      setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/login')
      }, 8000)
    }

    handleCallback()
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
