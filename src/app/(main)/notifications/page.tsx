'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, MessageCircle, Package, Star, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/navigation/TopBar'
import { cn, timeAgo } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

const NOTIF_ICON: Record<NotificationType, React.ReactNode> = {
  new_message:           <MessageCircle size={18} className="text-blue-500" />,
  listing_status_changed: <Package size={18} className="text-orange-500" />,
  listing_available_again: <RefreshCw size={18} className="text-green-500" />,
  new_matching_listing:  <Star size={18} className="text-yellow-500" />,
  reserved_followup:     <Bell size={18} className="text-purple-500" />,
  listing_expiring:      <Bell size={18} className="text-red-500" />,
}

export default function NotificationsPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      setNotifications((data as Notification[]) ?? [])
      setLoading(false)
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    }
    init()
  }, [])

  const handleClick = (notif: Notification) => {
    if (notif.conversation_id) router.push(`/messages/${notif.conversation_id}`)
    else if (notif.listing_id) router.push(`/listing/${notif.listing_id}`)
  }

  if (loading) return <div className="min-h-screen"><TopBar title="התראות" /></div>

  return (
    <div className="min-h-screen bg-white">
      <TopBar title="התראות" />
      <div className="pt-14">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-5xl mb-3">🔔�</div>
            <p className="text-gray-500 text-sm">אין עדיין התראות</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notif => (
              <button key={notif.id} onClick={() => handleClick(notif)} className={cn('w-full flex items-start gap-3 px-4 py-3.5 text-right', !notif.is_read && 'bg-blue-50')}>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{NOTIFICON[notif.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm text-gray-900', !notif.is_read && 'font-semibold')}>{notif.title}</p>
                  {notif.body && <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="bottom-nav-spacer" />
    </div>
  )
}
