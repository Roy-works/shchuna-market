'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

// hook ××§×××ª ××¡×¤×¨ ×××× ×©× ××××¢××ª ×©×× × ×§×¨××
export function useUnreadCount() {
  const supabase = createClient()
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: convs } = await supabase
        .from('conversations')
        .select('unread_a, unread_b, participant_a, participant_b')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)

      const total = (convs ?? []).reduce((sum: number, c: { participant_a: string; participant_b: string; unread_a: number; unread_b: number }) => {
        return sum + (user.id === c.participant_a ? c.unread_a : c.unread_b)
      }, 0)

      setCount(total)
    }

    fetch()

    // ×××× ××©×× ×××× ×-realtime
    const channel = supabase
      .channel('unread-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetch)
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])

  return count
}
