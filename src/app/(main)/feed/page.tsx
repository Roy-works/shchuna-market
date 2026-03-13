'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters, { FiltersState } from '@/components/listings/ListingFilters'
import { cn } from '@/lib/utils'
import { TABS } from '@/types'
import type { Listing, ListingType } from '@/types'

export default function FeedPage() {
  const supabase = createClient()

  const [activeTab,    setActiveTab]    = useState<ListingType>('giveaway')
  const [listings,     setListings]     = useState<Listing[]>([])
  const [loading,      setLoading]      = useState(true)
  const [cityName,     setCityName]     = useState('×× ×××¨×¥')
  const [showCityPick, setShowCityPick] = useState(false)
  const [filters, setFilters] = useState<FiltersState>({
    search:     '',
    categoryId: '',
    cityId:     '',
    freeOnly:   false,
  })

  // ××¢× ×××§×× ××¨××¨×ª ×××× ×©× ×××©×ª××©
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('city_id, cities(name)')
        .eq('id', user.id)
        .single()
      if (profile?.city_id) {
        setFilters(f => ({ ...f, cityId: profile.city_id! }))
        // @ts-ignore
        setCityName(profile.cities?.name ?? '×× ×××¨×¥')
      }
    })
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles(id, display_name, rank, avatar_url),
        categories(id, name, emoji),
        neighborhoods(id, name),
        cities(id, name),
        listing_images(id, url, sort_order)
      `)
      .eq('type', activeTab)
      .in('status', ['available', 'reserved'])
      .gt('expires_at', new Date().toISOString())
      .order('status', { ascending: true })   // available ×¨××©××
      .order('created_at', { ascending: false })
      .limit(50)

    if (filters.cityId)      query = query.eq('city_id', filters.cityId)
    if (filters.categoryId)  query = query.eq('category_id', filters.categoryId)
    if (filters.freeOnly)    query = query.is('price', null)
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data } = await query
    setListings((data as Listing[]) ?? [])
    setLoading(false)
  }, [activeTab, filters])

  useEffect(() => { fetchListings() }, [fetchListings])

  const emptyMessages: Record<ListingType, string> = {
    giveaway: '××× ×××¦×¨×× ××× × ××©××× × ××¨××¢. ××× ××¨××©×× ××¤×¨×¡×!',
    sale:     '××× ×××¦×¨×× ×××××¨× ××©××× × ××¨××¢.',
    wanted:   '××× ××§×©××ª "×××¤×©/×ª" ××¨××¢.',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30">
        {/* ×××× + ×××§×× */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">ðï¸</span>
            <span className="font-bold text-gray-900 text-base">×©××× × ××¨×§×</span>
          </div>
          <button
            onClick={() => setShowCityPick(!showCityPick)}
            className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50
                       border border-gray-200 rounded-full px-3 py-1.5"
          >
            <MapPin size={13} className="text-primary-500" />
            {cityName}
            <ChevronDown size={13} />
          </button>
        </div>

        {/* 3 ××××× */}
        <div className="flex border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ListingType)}
              className={cn(
                'flex-1 py-3 text-sm font-semibold flex flex-col items-center gap-0.5 transition-colors',
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500'
              )}
            >
              <span className="text-lg">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ×¤××××¨×× */}
        <ListingFilters
          filters={filters}
          onChange={setFilters}
          showFreeFilter={activeTab === 'sale'}
        />
      </div>

      {/* ×¨×©×××ª ××××¢××ª */}
      <ListingGrid
        listings={listings}
        loading={loading}
        emptyText={emptyMessages[activeTab]}
      />

      <div className="bottom-nav-spacer" />
    </div>
  )
}
