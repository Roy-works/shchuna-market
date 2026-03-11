'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title?:        string
  showBack?:     boolean
  rightAction?:  React.ReactNode
  className?:    string
  transparent?:  boolean
}

export default function TopBar({ title, showBack = false, rightAction, className, transparent }: Props) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 max-w-md mx-auto z-40 h-14 flex items-center px-4',
        transparent ? 'bg-transparent' : 'bg-white border-b border-gray-100',
        className
      )}
    >
      {/* כפתור חזרה */}
      {showBack && (
        <button
          onClick={() => router.back()}
          className="ml-3 p-1.5 -mr-1 text-gray-600 active:scale-90 transition-transform"
          aria-label="חזרה"
        >
          <ArrowRight size={22} />
        </button>
      )}

      {/* כותרת */}
      {title && (
        <h1 className="text-base font-bold text-gray-900 flex-1 text-center ml-4">
          {title}
        </h1>
      )}

      {/* פעולה מימין */}
      <div className={cn('flex items-center', !showBack && 'mr-auto')}>
        {rightAction}
      </div>
    </header>
  )
}
