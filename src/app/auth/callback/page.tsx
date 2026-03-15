'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const token_hash = url.searchParams.get('token_hash')
        const type = url.searchParams.get('type')

        let userId: string | null = null

        if (code) {
          // PKCE flow - most common with @supabase/ssr
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error || !data.session) {
            router.replace('/login')
            return
          }
          userId = data.session.user.id
        } else if (token_hash && type) {
          // Token hash flow
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'email' | 'recovery' | 'invite' | 'magiclink',
          })
          if (error || !data.session) {
            router.replace('/login')
            return
          }
          userId = data.session.user.id
        } else {
          // Implicit / hash flow - Supabase processes URL hash automatically
          await new Promise(r => setTimeout(r, 300))
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            router.replace('/login')
            return
          }
          userId = session.user.id
        }

        if (!userId) {
          router.replace('/login')
          return
        }

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('neighborhood_id')
          .eq('id', userId)
          .single()

        router.replace(!profile?.neighborhood_id ? '/onboarding' : '/feed')
      } catch (err) {
        console.error('Auth callback error:', err)
        router.replace('/login')
      }
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
