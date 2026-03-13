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
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        listings(id, title, type),
        profile_a:profiles!conversations_participant_a_fkey(id, display_name, avatar_url),
        profile_b:profiles!conversations_participant_b_fkey(id, display_name, avatar_url)
      `)
      .or(`participant_a.eq.${uid},participant_b.eq.${uid}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title="××××¢××ª" />
        <div className="pt-14 divide-y divide-gray-100">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 p-4">
              <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar title="××××¢××ª" />

      <div className="pt-14">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-5xl mb-3">ð¬</div>
            <p className="text-gray-500 text-sm">××× ××××¢××ª ×¢××××</p>
            <p className="text-gray-400 text-xs mt-1">×¤× × ××××©×× ×¢× ××××¢× ×××ª××× ×©×××</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map(conv => {
              const other   = getOtherProfile(conv)
              const unread  = getUnreadCount(conv)
              const listing = conv.listings

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-gray-50"
                >
                  {/* ××××××¨ */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {other?.avatar_url ? (
                        <img src={other.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-primary-700 text-lg">
                          {other?.display_name?.charAt(0) ?? '?'}
                        </span>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs
                                       rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>

                  {/* ×ª××× */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={cn('text-sm font-semibold text-gray-900 truncate', unread > 0 && 'font-bold')}>
                        {other?.display_name ?? '××©×ª××©'}
                      </p>
                      {conv.last_message_at && (
                        <span className="text-xs text-gray-400 flex-shrink-0 mr-2">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    {listing && (
                      <p className="text-xs text-primary-600 mb-0.5 truncate">
                        ð¦ {listing.title}
                      </p>
                    )}
                    <p className={cn('text-xs text-gray-500 truncate', unread > 0 && 'text-gray-900 font-medium')}>
                      {conv.last_message_preview ?? '×©××× ×××©×'}
                    </p>
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
