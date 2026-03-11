import ListingCard from './ListingCard'
import type { Listing } from '@/types'

interface Props {
  listings:  Listing[]
  loading?:  boolean
  emptyText?: string
}

export default function ListingGrid({ listings, loading, emptyText = 'אין מודעות להצגה' }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[4/3]" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="text-5xl mb-3">🏡</div>
        <p className="text-gray-500 text-sm">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
