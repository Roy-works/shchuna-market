import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { cn, formatPrice, timeAgo, typeColor, statusColor } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'
import type { Listing } from '@/types'
export default function ListingCard({listing,className}:{[isting:Listing,className?:string}) {
  const firstImage = listing.listing_images?.[0] ?.url
  return (<Link href={`/listing/${listing.id}`} className={cn('card block overflow-hidden fade-in',className)}>
    <div className="relative aspect-[4/3] bg-gray-100">
      {firstImage?(<Image src={firstImage} alt={listing.title} fill className="object-cover" sizes="50vw"/>):(<div className="w-full h-full flex items-center justify-center text-4xl">{listing.categories?.emoji??'📦'}</div>)}
      <div className={cn('absolute bottom-2 right-2 badge',typeColor(listing.type))}>
        {listing.type==='giveaway'&&'🌁חינם'}{listing.type==='sale'&&'🏷לא'}{listing.type==='wanted'&&'🔍מחפש'}
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-sm mb-1">{listing.title.substring(0,40)}</h3>
      {listing.type==='sale'&&<p className="font-bold text-primary-700">{formatPrice(listing.price)}</p>}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
        {listing.neighborhoods?.name&&<span className="flex items-center gap-0.5"><MapPin size={11}/>{listing.neighborhoods.name}</span>}
        <span className="flex items-center gap-0.5"><Clock size={11}/>{timeAgo(listing.created_at)}</span>
      </div>
    </div>
  </Link>)
}
