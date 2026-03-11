'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { MessageCircle, MapPin, Heart, Share2, MoreVertical, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/navigation/TopBar'
import { cn, formatPrice, timeAgo, statusColor, typeColor, RANK_MAP } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'
import type { Listing } from '@/types'

export default function ListingDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const supabase  = createClient()

  const [listing,    setListing]    = useState<Listing | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  const [isOwner,    setIsOwner]    = useState(false)
  const [userId,     setUserId]     = useState<string | null>(null)
  const [msgLoading, setMsgLoading] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    const [{ data: listing }, { data: { user } }] = await Promise.all([
      supabase
        .from('listings')
        .select(`
          *,
          profiles(id, display_name, rank, avatar_url, phone, whatsapp_phone),
          categories(id, name, emoji),
          neighborhoods(id, name),
          cities(id, name),
          listing_images(id, url, sort_order)
        `)
        .eq('id', id)
        .single(),
      supabase.auth.getUser(),
    ])

    if (listing) {
      if (listing.listing_images) {
        listing.listing_images.sort((a: {sort_order: number}, b:{sort_order: number}) => a.sort_order - b.sort_order)
      }
      setListing(listing as Listing)
      setIsOwner(user?.id === listing.user_id)
      setUserId(user?.id ?? null)
      supabase.from('listings').update({ views_count: (listing.views_count ?? 0) + 1 }).eq('id', id)
    }
    setLoading(false)
  }

  const handleContact = async () => {
    if (!listing || !userId) { router.push('/login'); return }
    setMsgLoading(true)
    const { data: convId, error } = await supabase.rpc('get_or_create_conversation', {
      p_listing_id: listing.id,
      p_other_user_id: listing.user_id,
    })
    if (!error && convId) { router.push(`/messages/${convId}`) }
    setMsgLoading(false)
  }

  const handleStatusChange = async (newStatus: 'available' | 'reserved' | 'completed') => {
    if (!listing) return
    await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    setListing(prev => prev ? { ...prev, status: newStatus } : prev)
  }

  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: listing.vitle, url: window.location.href }) }
    else { navigator.clipboard.writeText(window.location.href) }
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <TopBar showBack />
      <div className="pt-14 space-y-4 p-4">
        <div className="skeleton aspect-video rounded-2xl" />
        <div className="skeleton h-6 w-3/4" />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <TopBar showBack />
      <p className="text-gray-500">המוד אנמצאה</p>
    </div>
  )

  const images = listing.listing_images ?? []
  const rank = RANK_MAP[listing.profiles?.rank ?? 'new_neighbor']

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar showBack rightAction={<button onClick={handleShare} className="p-2"><Share2 size={20} /></button>} />

      {images.length > 0 ? (
        <div className="relative pt-14">
          <div className="aspect-[4/3] bg-gray-100 relative">
            <Image src={images[currentImg].url} alt={listing.title} fill className="object-cover" priority />
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-white">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} className={cn('flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2', i === currentImg ? 'border-primary-500' : 'border-transparent')}>
                <img src={img.url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-14 aspect-[4/3] bg-gray-100 flex items-center justify-center">
          <span className="text-6xl">{listing.categories?.emoji ?? '📦'}</span>
        </div>
      )}

      <div className="bg-white p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('badge', typeColor(listing.type))}>
            {listing.type === 'giveaway' && '🏁 חינם'}
            {listing.type === 'sale' && '🏷️ למכירה'}
            {listing.type === 'wanted' && '🔍 מחפש/ע'}
          </span>
          {listing.categories && <span className="badge bg-gray-100 text-gray-600">{listing.categories.emoji } {listing.categories.name}</span>}
        </div>

        <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
        {listing.type === 'sale' && listing.price && <p className="text-2xl font-bold text-primary-700 mt-1">{formatPrice(listing.price)}</p>}
        {listing.description && <p className="text-gray-700 text-sm leading-relaxed">{listing.description}</p>}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {(listing.neighborhoods?.name || listing.cities?.name) && <span className="flex items-center gap-1"><MapPin size={14} />{listing.neighborhoods?.name}{listing.cities?.name && `, ${listing.cities.name}`}</span>}
          <span>{timeAgo(listing.created_at)}</span>
        </div>
      </div>

      <div className="bg-white mt-2 p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {listing.profiles?.avatar_url ? <img src={listing.profiles.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xl">{listing.profiles?.display_name?.charAt(0) ?? '?'}</span>}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{listing.profiles?.display_name}</p>
          <p className={cn('text-xs font-medium', rank.color)}>{rank.emoji } {rank.label}</p>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 max-w-md mx-auto bg-white border-t p-4">
        {isOwner ? (
          <div className="grid grid-cols-3 gap-2">
            {{(['available', 'reserved', 'completed'] as const).map(s => (
              <button key={s} onClick={() => handleStatusChange(s)} className={cn('py-2.5 rounded-xl text-xs font-semibold border-2', listing.status === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50 text-gray-500')}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={handleContact} disabled={msgLoading || listing.status === 'completed'} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              {msgLoading ? 'פו귗 שיחה...' : 'שלח הודעה'}
            </button>
          </div>
        )}
      </div>
      <div className="h-24" />
    </div>
  )
}
