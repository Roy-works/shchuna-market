import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ListingStatus, ListingType, UserRank } from '@/types'

// מיזוג class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// פורמט מחיר בשקלים
export function formatPrice(price: number | null): string {
  if (price === null || price === 0) return 'חינם'
  return `₪${price.toLocaleString('he-IL')}`
}

// זמן יחסי בעברית
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60)           return 'עכשיו'
  if (diff < 3600)         return `לפני ${Math.floor(diff / 60)} דקות`
  if (diff < 86400)        return `לפני ${Math.floor(diff / 3600)} שעות`
  if (diff < 604800)       return `לפני ${Math.floor(diff / 86400)} ימים`
  return date.toLocaleDateString('he-IL')
}

// צבע סטטוס מודעה
export function statusColor(status: ListingStatus): string {
  const map: Record<ListingStatus, string> = {
    available: 'bg-green-100 text-green-800',
    reserved:  'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-600',
    expired:   'bg-red-100 text-red-700',
  }
  return map[status]
}

// צבע סוג מודעה
export function typeColor(type: ListingType): string {
  const map: Record<ListingType, string> = {
    giveaway: 'bg-emerald-100 text-emerald-700',
    sale:     'bg-blue-100 text-blue-700',
    wanted:   'bg-amber-100 text-amber-700',
  }
  return map[type]
}

// תווית סוג מודעה
export function typeLabel(type: ListingType): string {
  const map: Record<ListingType, string> = {
    giveaway: 'חינם 🎁',
    sale:     'למכירה 🏷️',
    wanted:   'מחפש/ת 🔍',
  }
  return map[type]
}

// בדיקה אם מודעה שמורה יותר מ-3 ימים
export function isReservedTooLong(reservedAt: string | null): boolean {
  if (!reservedAt) return false
  const diff = Date.now() - new Date(reservedAt).getTime()
  return diff > 3 * 24 * 60 * 60 * 1000
}

// קיצור טקסט
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

// בניית URL תמונה מ-Supabase Storage
export function storageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${path}`
}

// דרגת משתמש בעברית
export const RANK_MAP: Record<UserRank, { label: string; emoji: string; color: string }> = {
  new_neighbor:    { label: 'שכן/ה חדש/ה',      emoji: '🌱', color: 'text-gray-500'   },
  active_neighbor: { label: 'שכן/ה פעיל/ה',     emoji: '⭐', color: 'text-blue-600'  },
  contributor:     { label: 'תורם/ת לקהילה',    emoji: '🌟', color: 'text-purple-600' },
  hero:            { label: 'גיבור/ת השכונה',   emoji: '🏆', color: 'text-amber-600'  },
}
