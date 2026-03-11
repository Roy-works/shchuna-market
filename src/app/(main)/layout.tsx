import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import BottomNav from '@/components/navigation/BottomNav'
export default async function MainLayout({children}:{{children:React.ReactNode}) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [{ count: unreadMsg }, { count: unreadNotif }] = await Promise.all([
    supabase.from('conversations').select('*',{count:'exact',head:true}).or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`).gt('unread_a',0),
    supabase.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_read',false),
  ])
  return (<><main className="pb-16">{children}</main><BottomNav unreadMessages={unreadMsg??0} unreadNotifications={unreadNotif??0}/></>)
}
