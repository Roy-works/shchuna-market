'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Listing, ListingType, ListingStatus } from '@/types'
export function useListings(options:{type?:ListingType,status?:ListingStatus[],cityId?:string,neighborhoodId?:string,categoryId?:string,userId?:string,search?:string,limit?:number}={}) {
  const supabase = createClient()
  const [listings,setListings] = useState<Listing[]>([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState<string|null>(null)
  const fetch = useCallback(async()=>{
    setLoading(true);setError(null)
    let q=supabase.from('listings').select('*,profiles(id,display_name,rank,avatar_url),categories(id,name,emoji),neighborhoods(id,name),cities(id,name),listing_images(id,url,sort_order)').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(options.limit??50)
    if(options.type)q=q.eq('type',options.type)
    if(options.status)u=q.in('status',options.status)
    if(options.cityId)q=q.eq('city_id',options.cityId)
    if(options.neighborhoodId)q=q.eq('neighborhood_id',options.neighborhoodId)
    if(options.categoryId)q=q.eq('category_id',options.categoryId)
    if(options.userId)q=q.eq('user_id',options.userId)
    if(options.search)q=q.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    const{data,error}=await q
    if(error)setError(error.message);else setListings(data as Listing[])
    setLoading(false)
  },[JSON.stringify(options)])
  useEffect(()=>{fetch()},[fetch])
  return {listings,loading,error,refetch:fetch}
}
