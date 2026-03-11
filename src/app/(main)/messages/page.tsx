'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/navigation/TopBar'
import { cn, timeAgo, truncate } from '@/lib/utils'
import type { Conversation } from '@/types'

export default function MessagesPage() {
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [userId,        setUserId]        = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await fetchConversations(user.id)
    }
    init()
  }, [])

  const fetchConversations = async (uid: string) => {
    const { data } = await supabase.from('conversations').select(`*, listings(id, title, type), profile_a:profiles!conversations_participant_a_fkey(id, display_name, avatar_url), profile_b:profiles!conversations_participant_b_fkey(id, display_name, avatar_url)`).or(`participant_a.eq.${uid},participant_b.eq.${uid}`).order('last_message_at', { ascending: false, nullsFirst: false })
    setConversations((data as Conversation[]) ?? [])
    setLoading(false)
  }

  const getOtherProfile = (conv: Conversation) => {
    if (!userId) return null
    return userId === conv.participant_a ? conv.profile_b : conv.profile_a
  }
  const getUnreadCount = (conv: Conversation) => {
    if (!userId) return 0
    return userId === conv.participant_a ? conv.unread_a : conv.unread_b
  }

  if (loading) return <div className="min-h-screen"><TopBar title="הודעות" /></div>

  return (
    <div className="min-h-screen bg-white">
      <TopBar title="הודעות" />
      <div className="pt-14">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">אין עדיין הודעות</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map(conv => {
              const other = getOtherProfile(conv)
              const unread = getUnreadCount(conv)
              return (
                <Link key={conv.id} href={`/messages/${conv.id}`} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      <span className="font-bold text-primary-700 text-lg">{other?.display_name?.charAt(0) ?? '?'}</span>
                    </div>
                    {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{other?.display_name}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.last_message_preview ?? 'שיחה'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <div className="bottom-nav-spacer" />
    </div>
  )
}
