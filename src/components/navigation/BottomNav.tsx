'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, PlusCircle, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
const NAV_ITEMS = [
  { href: '/feed',          label: 'אראשי',    Icon: Home },
  { href: '/messages',      label: 'הודעות',   Icon: MessageCircle },
  { href: '/listing/create', label: 'פרסם',     Icon: PlusCircle },
  { href: '/notifications', label: 'התראות',   Icon: Bell },
  { href: '/profile',       label: 'פרופיל',   Icon: User },
]
export default function BottomNav({unreadMessages=0,unreadNotifications=0}:{unreadMessages?:number,unreadNotifications?:number}){
  const pathname = usePathname()
  return (<nav className="fixed bottom-0 right-0 left-0 max-w-md mx-auto bg-white border-t safe-bottom z-50"><div className="flex items-center justify-around h-16">{NAV_ITEMS.map(({href,label,Icon})=>{const isActive=pathname===href||pathname.startsWith(href+'/');return(<Link href={href} key={href} className={cn('flex flex-col items-center gap-0.5 flex-1 py-2',isActive?'text-primary-600':'text-gray-400')}><Icon size={22}/><span className="text-[10px]">{label}</span></Link>)}}</div></nav>)
}