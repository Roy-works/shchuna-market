'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
export function useUnreadCount() {
  const supabase = createClient()
  const [count, setCount] = useState(0)
  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: convs } = await supabase.from('conversations').select('unread_a,unread_b,participant_a,participant_b').or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
      setCount((convs??[]).reduce((s:number,c:any)=>s+(user.id===c.participant_a?c.unread_a:c.unread_b),0))
    }
    fetch()
    const ch = supabase.channel('unread').on('postgres_changes',{event:'*',schema:'public',`able:'conversations'},fetch).subscribe()
    return ()=>{ch.unsubscribe()}
  },[])
  return count
}
