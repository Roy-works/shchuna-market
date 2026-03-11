import ListingCard from './ListingCard'
import type { Listing } from '@/types'

interface Props {
  listings:  Listing[]
  loading?:  boolean
  emptyText?: string
}

export default function ListingGrid({ listings, loading, emptyText = 'אין מודעות להצגה' }: Props) {
  if (loading) return <div className="grid grid-cols-2 gap-3 p-4">{Array.from({length:6}).map((_,i)=><div key={i} className="card"><div className="skeleton h-32"/></div>))}</div>
  if (listings.length === 0) return <div className="text-center py-16 text-gray-500">{emptyText}</div>
  return <div className="grid grid-cols-2 gap-3 p-4">{listings.map(l => <ListingCard key={l.id} listing={l} />)}</div>
}
