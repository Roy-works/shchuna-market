import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ××£ ×¨××©× - ××¤× × ××¤×× ×× ×××××¨, ×××¨×ª ××× ××¡×
export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ××××§ ×× ××©××× ××× ×××¨××× ×
  const { data: profile } = await supabase
    .from('profiles')
    .select('neighborhood_id')
    .eq('id', user.id)
    .single()

  if (!profile?.neighborhood_id) {
    redirect('/onboarding')
  }

  redirect('/feed')
}
