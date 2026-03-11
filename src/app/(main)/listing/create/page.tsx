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
  const [categories,  setCategories]  = useState<Category[]>([])
  const [cities,      setCities]      = useState<City[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => { if (data) setCategories(data) })
    supabase.from('cities').select('*').order('name').then(({ data }) => { if (data) setCities(data) })
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('city_id, neighborhood_id').eq('id', user.id).single()
      if (p?.city_id) setCityId(p.city_id)
      if (p?.neighborhood_id) setNeighId(p.neighborhood_id)
    })
  }, [])

  useEffect(() => {
    if (!cityId) return
    supabase.from('neighborhoods').select('*').eq('city_id', cityId).order('name').then(({ data }) => { if (data) setNeighborhoods(data) })
  }, [cityId])

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - images.length
    const toAdd = files.slice(0, remaining)
    setImages(prev => [...prev, ...toAdd])
    toAdd.forEach(file => { setPreviews(prev => [...prev, URL.createObjectURL(file)]) })
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('נא להכניס כותרת'); return }
    if (type === 'sale' && !price) { setError('נא להכניך מחיר'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: listing, error: listingErr } = await supabase.from('listings').insert({
      user_id: user.id, type, title: title.trim(),
      description: description.trim() || null,
      price: type === 'sale' ? parseFloat(price) : null,
      category_id: categoryId || null, city_id: cityId || null, neighborhood_id: neighId || null,
    }).select().single()
    if (listingErr || !listing) { setError('שגיאה ביצירת. נסה שוב.'); setLoading(false); return }
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const path = `${listing.id}/${i}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('listings').upload(path, file, { cacheControl: '3600', upsert: false })
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(path)
        await supabase.from('listing_images').insert({ listing_id: listing.id, url: publicUrl, sort_order: i })
      }
    }
    router.push(`/listing/${listing.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="פרסח המוד" showBack />
      <form onSubmit={handleSubmit} className="pt-14 pb-24 px-4 space-y-4">
        <div className="card p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">סץ המוד</p>
          <div className="grid grid-cols-3 gap-2">
            {TABS.map(tab => (
              <button key={tab.key} type="button" onClick={() => setType(tab.key as ListingType)}
                className={`py-2.5 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 border-2 ${type === tab.key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500'}`}>
                <span className="text-xl">{tab.emoji }</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
        {type !== 'wanted' && (
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">תמ מונונ</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {previews.map((src, i) => (
                <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} className="w-pfull h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 left-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={12} /></button>
                </div>
              ))}
              {previews.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-1">
                  <Camera size={20} /><span className="text-xs">הו�</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImagePick} className="hidden" />
          </div>
        )}
        <div className="card p-4 space-y-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ותרת *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="תאזר את הפריט בקצרה" className="input-field" maxLength={100} required />
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="שרלוונ ידנית..." className="input-field resize-none" rows={3} maxLength={1000} />
          {type === 'sale' && (
            <><label className="block text-sm font-semibold text-gray-700 mb-1.5">וחיר (₪) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className="input-field" min={1} required /></>
          )}
        </div>
        <div className="card p-4 space-y-3">
          <select value={cityId} onChange={e => { setCityId(e.target.value); setNeighId('') }} className="input-field">
            <option value="">עיר</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {cityId && <select value={neighId} onChange={e => setNeighId(e.target.value)} className="input-field">
            <option value="">המים</option>
            {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'מפרסם...' : 'פרסח Xהמוד'}
        </button>
      </form>
    </div>
  )
}
