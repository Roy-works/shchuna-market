'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, PlusCircle, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href:  string
  label: string
  Icon:  React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { href: '/feed',          label: 'ראשי',     Icon: Home          },
  { href: '/messages',      label: 'הודעות',   Icon: MessageCircle },
  { href: '/listing/create', label: 'פרסם',    Icon: PlusCircle    },
  { href: '/notifications', label: 'התראות',   Icon: Bell          },
  { href: '/profile',       label: 'פרופיל',   Icon: User          },
]

interface Props {
  unreadMessages?:      number
  unreadNotifications?: number
}

export default function BottomNav({ unreadMessages = 0, unreadNotifications = 0 }: Props) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 right-0 left-0 max-w-md mx-auto bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const badge =
            href === '/messages'      ? unreadMessages      :
            href === '/notifications' ? unreadNotifications : 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 py-2 relative',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                                   rounded-full min-w-[16px] h-4 flex items-center justify-center
                                   px-0.5 font-bold text-[10px]">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {href === '/listing/create' && (
                <span className="absolute inset-0 -top-4">
                  <span className="sr-only">פרסם מודעה</span>
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
