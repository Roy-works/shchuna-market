'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/navigation/TopBar'
import { cn } from '@/lib/utils'
import { TABS } from '@/types'
import type { ListingType, Category, City, Neighborhood } from '@/types'

const MAX_IMAGES = 5

export default function CreateListingPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const fileRef      = useRef<HTMLInputElement>(null)

  const defaultType = (searchParams.get('type') as ListingType) ?? 'giveaway'

  // --- state ---
  const [type,        setType]        = useState<ListingType>(defaultType)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [price,       setPrice]       = useState('')
  const [categoryId,  setCategoryId]  = useState('')
  const [cityId,      setCityId]      = useState('')
  const [neighId,     setNeighId]     = useState('')
  const [images,      setImages]      = useState<File[]>([])
  const [previews,    setPreviews]    = useState<string[]>([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const [categories,    setCategories]    = useState<Category[]>([])
  const [cities,        setCities]        = useState<City[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => { if (data) setCategories(data) })
    supabase.from('cities').select('*').order('name').then(({ data }) => { if (data) setCities(data) })

    // ××¢× ×××§×× ××¨××¨×ª ×××× ×××¤×¨××¤××
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: p } = await supabase
        .from('profiles')
        .select('city_id, neighborhood_id')
        .eq('id', user.id)
        .single()
      if (p?.city_id)      setCityId(p.city_id)
      if (p?.neighborhood_id) setNeighId(p.neighborhood_id)
    })
  }, [])

  useEffect(() => {
    if (!cityId) return
    supabase.from('neighborhoods').select('*').eq('city_id', cityId).order('name').then(({ data }) => {
      if (data) setNeighborhoods(data)
    })
  }, [cityId])

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - images.length
    const toAdd = files.slice(0, remaining)

    setImages(prev => [...prev, ...toAdd])
    toAdd.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviews(prev => [...prev, url])
    })
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('× × ×××× ××¡ ×××ª×¨×ª'); return }
    if (type === 'sale' && !price) { setError('× × ×××× ××¡ ××××¨'); return }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // ×¦××¨ ××××¢×
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .insert({
        user_id:         user.id,
        type,
        title:           title.trim(),
        description:     description.trim() || null,
        price:           type === 'sale' ? parseFloat(price) : null,
        category_id:     categoryId || null,
        city_id:         cityId     || null,
        neighborhood_id: neighId    || null,
      })
      .select()
      .single()

    if (listingErr || !listing) {
      setError('×©×××× ×××¦××¨×ª ×××××¢×. × ×¡× ×©××.')
      setLoading(false)
      return
    }

    // ××¢×× ×ª××× ××ª
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext  = file.name.split('.').pop()
      const path = `${listing.id}/${i}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('listings')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(path)
        await supabase.from('listing_images').insert({
          listing_id: listing.id,
          url:        publicUrl,
          sort_order: i,
        })
      }
    }

    router.push(`/listing/${listing.id}`)
  }

  const typeConfig: Record<ListingType, { color: string; label: string }> = {
    giveaway: { color: 'bg-emerald-500', label: '×××¦×¨ ××× ×' },
    sale:     { color: 'bg-blue-500',    label: '×××¦×¨ ×××××¨×' },
    wanted:   { color: 'bg-amber-500',   label: '×××¤×©/×ª ×××¦×¨' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="×¤×¨×¡× ××××¢×" showBack />

      <form onSubmit={handleSubmit} className="pt-14 pb-24 px-4 space-y-4">

        {/* ××××¨×ª ×¡×× */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">×¡×× ××××¢×</p>
          <div className="grid grid-cols-3 gap-2">
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setType(tab.key as ListingType)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 border-2 transition-all',
                  type === tab.key
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-500'
                )}
              >
                <span className="text-xl">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ×ª××× ××ª (×× ×-wanted) */}
        {type !== 'wanted' && (
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ×ª××× ××ª <span className="text-gray-400 font-normal">({previews.length}/{MAX_IMAGES})</span>
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previews.map((src, i) => (
                <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 left-0.5 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300
                             flex flex-col items-center justify-center text-gray-400 gap-1"
                >
                  <Camera size={20} />
                  <span className="text-xs">×××¡×£</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagePick}
              className="hidden"
            />
          </div>
        )}

        {/* ×¤×¨×× ××××¢× */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">×××ª×¨×ª *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="×ª××¨ ××ª ××¤×¨×× ××§×¦×¨×"
              className="input-field"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">×ª××××¨</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="×¤×¨× ××¦×, ××××, ×× ×× ×× ×©×¨×××× ××..."
              className="input-field resize-none"
              rows={3}
              maxLength={1000}
            />
          </div>

          {type === 'sale' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">××××¨ (âª) *</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                className="input-field"
                min={1}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">×§××××¨××</label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="input-field appearance-none pr-10"
              >
                <option value="">×××¨ ×§××××¨××</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ×××§×× */}
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">×××§××</p>
          <div className="relative">
            <select
              value={cityId}
              onChange={e => { setCityId(e.target.value); setNeighId('') }}
              className="input-field appearance-none"
            >
              <option value="">×××¨ ×¢××¨</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {cityId && (
            <div className="relative">
              <select
                value={neighId}
                onChange={e => setNeighId(e.target.value)}
                className="input-field appearance-none"
              >
                <option value="">×××¨ ×©××× ×</option>
                {neighborhoods.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className={cn('btn-primary', typeConfig[type].color, 'text-white')}
          disabled={loading}
        >
          {loading ? '××¤×¨×¡×...' : `×¤×¨×¡× ${typeConfig[type].label}`}
        </button>
      </form>
    </div>
  )
}
