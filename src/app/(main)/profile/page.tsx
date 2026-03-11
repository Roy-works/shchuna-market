'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, Package, Gift, CheckCircle, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/navigation/TopBar'
import ListingCard from '@/components/listings/ListingCard'
import { cn, RANK_MAP } from '@/lib/utils'
import type { Profile, Listing } from '@/types'

export default function ProfilePage() {
  const supabase = createClient()
  const router   = useRouter()

  const [profile,    setProfile]    = useState<Profile | null>(null)
  const [listings,   setListings]   = useState<Listing[]>([])
  const [activeTab,  setActiveTab]  = useState<'active' | 'completed'>('active')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prof }, { data: listingsData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*, neighborhoods(name), cities(name)')
          .eq('id', user.id)
          .single(),
        supabase
          .from('listings')
          .select('*, categories(id, name, emoji), neighborhoods(id, name), listing_images(id, url, sort_order)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setProfile(prof as Profile)
      setListings((listingsData as Listing[]) ?? [])
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeListing    = listings.filter(l => l.status !== 'completed' && l.status !== 'expired')
  const completedListings = listings.filter(l => l.status === 'completed')

  const rank = RANK_MAP[profile?.rank ?? 'new_neighbor']

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="פרופיל שלי" />
        <div className="pt-14 p-4 space-y-4">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-16 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title="פרופיל שלי"
        rightAction={
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 font-medium">
            <LogOut size={16} />
            יציאה
          </button>
        }
      />

      <div className="pt-14">
        {/* כרטיס פרופיל */}
        <div className="bg-white px-4 py-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700 flex-shrink-0">
            {profile.display_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{profile.display_name}</h2>
            <p className={cn('text-sm font-medium', rank.color)}>
              {rank.emoji} {rank.label}
            </p>
            {(profile.neighborhoods || profile.cities) && (
              <p className="text-xs text-gray-400 mt-0.5">
                Pin {profile.neighborhoods?.name ?? ''}{profile.cities?.name ? `, ${profile.cities.name}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* סטטיס פרופיל */}
        <div className="grid grid-cols-3 gap-0 bg-white mt-0.5">
          {[
            { icon: <Package size={18} />, value: profile.total_listings, label: 'מודעות' },
            { icon: <Gift    size={18} />, value: profile.total_giveaways, label: 'מתנות' },
            { icon: <CheckCircle size={18} />, value: profile.total_completed, label: 'הושלמו' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="flex flex-col items-center py-4 border-r border-gray-100 last:border-0">
              <div className="text-primary-500 mb-1">{icon}</div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* טאביםה: */}
        <div className="bg-white mt-2">
          <div className="flex border-b border-gray-100">
            {([
              { key: 'active',    label: `פעילות (${activeListing.length})` },
              { key: 'completed', label: `הותלממו (${completedListings.length})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-3 text-sm font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-400'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 p-4">
            {(activeTab === 'active' ? activeListing : completedListings).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {(activeTab === 'active' ? activeListing : completedListings).length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              {activeTab === 'active' ? 'אין ממודעות פעילות' : 'אין ממודעות שמושלמו' }
            </div>
          )}
        </div>
      </div>

      <div className="bottom-nav-spacer" />
    </div>
  )
}
