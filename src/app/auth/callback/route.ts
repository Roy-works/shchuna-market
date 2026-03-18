import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('neighborhood_id')
          .eq('id', user.id)
          .single()

        const redirectTo = !profile?.neighborhood_id ? '/onboarding' : '/feed'
        return NextResponse.redirect(new URL(redirectTo, origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', origin))
}
