import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { cn, formatPrice, timeAgo, typeColor, statusColor, truncate } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'
import type { Listing } from '@/types'

interface Props {
  listing: Listing
  className?: string
}

export default function ListingCard({ listing, className }: Props) {
  const firstImage = listing.listing_images?.[0]?.url
  const isFree     = listing.type === 'giveaway' || !listing.price

  return (
    <Link
      href={`/listing/${listing.id}`}
      className={cn(
        'card block overflow-hidden active:scale-[0.98] transition-transform fade-in',
        listing.status === 'reserved' && 'opacity-80',
        className
      )}
    >
      {/* תמונה */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 50vw, 224px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {listing.categories?.emoji ?? '📦'}
          </div>
        )}

        {/* Badge סטטוס */}
        {listing.status !== 'available' && (
          <div className={cn(
            'absolute top-2 right-2 badge text-xs',
            statusColor(listing.status)
          )}>
            {STATUS_LABELS[listing.status]}
          </div>
        )}

        {/* Badge סוג */}
        <div className={cn(
          'absolute bottom-2 right-2 badge',
          typeColor(listing.type)
        )}>
          {listing.type === 'giveaway' && '🎁 חינם'}
          {listing.type === 'sale'     && '🏷️ למכירה'}
          {listing.type === 'wanted'   && '🔍 מחפש/ת'}
        </div>
      </div>

      {/* תוכן */}
      <div className="p-3">
        {/* כותרת */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {truncate(listing.title, 40)}
        </h3>

        {/* מחיר */}
        {listing.type === 'sale' && (
          <p className="text-base font-bold text-primary-700 mb-1">
            {formatPrice(listing.price)}
          </p>
        )}

        {/* מיקום וזמן */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
          {listing.neighborhoods?.name && (
            <span className="flex items-center gap-0.5">
              <MapPin size={11} />
              {listing.neighborhoods.name}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Clock size={11} />
            {timeAgo(listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}
