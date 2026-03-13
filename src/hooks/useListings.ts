'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Listing, ListingType, ListingStatus } from '@/types'

interface UseListingsOptions {
  type?:           ListingType
  status?:         ListingStatus[]
  cityId?:         string
  neighborhoodId?: string
  categoryId?:     string
  userId?:         string
  search?:         string
  limit?:          number
}

export function useListings(options: UseListingsOptions = {}) {
  const supabase = createClient()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

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
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(options.limit ?? 50)

    if (options.type)           query = query.eq('type', options.type)
    if (options.status)         query = query.in('status', options.status)
    if (options.cityId)         query = query.eq('city_id', options.cityId)
    if (options.neighborhoodId) query = query.eq('neighborhood_id', options.neighborhoodId)
    if (options.categoryId)     query = query.eq('category_id', options.categoryId)
    if (options.userId)         query = query.eq('user_id', options.userId)
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else setListings(data as Listing[])
    setLoading(false)
  }, [JSON.stringify(options)])

  useEffect(() => { fetch() }, [fetch])

  return { listings, loading, error, refetch: fetch }
}

// hook ×××××§ ×× ×××©×ª××© ×¢××§× ×××¨× ××××¢×
export function useIsFollowing(listingId: string) {
  const supabase  = createClient()
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('follow_type', 'listing')
        .eq('listing_id', listingId)
        .single()
      setFollowing(!!data)
    }
    check()
  }, [listingId])

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (following) {
      await supabase.from('follows').delete()
        .eq('user_id', user.id)
        .eq('follow_type', 'listing')
        .eq('listing_id', listingId)
    } else {
      await supabase.from('follows').insert({
        user_id:     user.id,
        follow_type: 'listing',
        listing_id:  listingId,
      })
    }
    setFollowing(f => !f)
  }

  return { following, toggle }
}
