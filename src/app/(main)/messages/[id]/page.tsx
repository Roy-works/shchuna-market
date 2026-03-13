'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn, timeAgo } from '@/lib/utils'
import type { Message, Conversation, Profile } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export default function ConversationPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const supabase  = createClient()

  const [messages,  setMessages]  = useState<Message[]>([])
  const [conv,      setConv]      = useState<Conversation | null>(null)
  const [other,     setOther]     = useState<Profile | null>(null)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const channelRef  = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // ××¢× ×©×××
      const { data: convData } = await supabase
        .from('conversations')
        .select(`
          *,
          listings(id, title, type),
          profile_a:profiles!conversations_participant_a_fkey(*),
          profile_b:profiles!conversations_participant_b_fkey(*)
        `)
        .eq('id', id)
        .single()

      if (!convData) { router.push('/messages'); return }
      setConv(convData as Conversation)
      setOther(user.id === convData.participant_a ? convData.profile_b : convData.profile_a)

      // ××¢× ××××¢××ª
      const { data: msgs } = await supabase
        .from('messages')
        .select('*, profiles(id, display_name, avatar_url)')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      setMessages((msgs as Message[]) ?? [])
      setLoading(false)

      // ×¡×× ×× ×§×¨×
      await supabase.rpc('mark_conversation_read', { p_conversation_id: id })

      // Realtime
      channelRef.current = supabase
        .channel(`conv:${id}`)
        .on('postgres_changes', {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `conversation_id=eq.${id}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
          supabase.rpc('mark_conversation_read', { p_conversation_id: id })
        })
        .subscribe()
    }

    init()
    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !userId || sending) return
    setSending(true)

    const content = text.trim()
    setText('')

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id:       userId,
      content,
    })

    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">×××¢× ×©×××...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="text-gray-600 p-1">
          <ArrowRight size={22} />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
          {other?.avatar_url ? (
            <img src={other.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-primary-700">
              {other?.display_name?.charAt(0) ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{other?.display_name}</p>
          {conv?.listings && (
            <p className="text-xs text-gray-400 truncate">ð¦ {conv.listings.title}</p>
          )}
        </div>
      </div>

      {/* ××××¢××ª */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            ××ª×× ××ª ××©×××!
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe       = msg.sender_id === userId
          const prevMsg    = messages[i - 1]
          const showTime   = !prevMsg || (
            new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000
          )

          return (
            <div key={msg.id}>
              {showTime && (
                <div className="text-center text-xs text-gray-400 my-2">
                  {timeAgo(msg.created_at)}
                </div>
              )}
              <div className={cn('flex', isMe ? 'justify-start' : 'justify-end')}>
                <div
                  className={cn(
                    'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ×©××××ª ××××¢× */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 safe-bottom flex-shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="××§×× ××××¢×..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
            text.trim() ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
          )}
        >
          <Send size={16} className="rotate-180" />
        </button>
      </form>
    </div>
  )
}
