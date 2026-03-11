'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { City, Neighborhood } from '@/types'

type Step = 'name' | 'location' | 'done'

export default function OnboardingPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step,           setStep]           = useState<Step>('name')
  const [displayName,    setDisplayName]    = useState('')
  const [cities,         setCities]         = useState<City[]>([])
  const [neighborhoods,  setNeighborhoods]  = useState<Neighborhood[]>([])
  const [selectedCity,   setSelectedCity]   = useState('')
  const [selectedNeigh,  setSelectedNeigh]  = useState('')
  const [customNeigh,    setCustomNeigh]    = useState('')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  useEffect(() => {
    // טען ערים
    supabase.from('cities').select('*').order('name').then(({ data }) => {
      if (data) setCities(data)
    })
  }, [])

  useEffect(() => {
    if (!selectedCity) return
    supabase
      .from('neighborhoods')
      .select('*')
      .eq('city_id', selectedCity)
      .order('name')
      .then(({ data }) => {
        if (data) setNeighborhoods(data)
        setSelectedNeigh('')
      })
  }, [selectedCity])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (displayName.trim().length < 2) {
      setError('שם חייב להכיל לפחות 2 תווים')
      return
    }
    setError('')
    setStep('location')
  }

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let neighborhoodId = selectedNeigh || null
    let cityId         = selectedCity  || null

    // שכונה מותאמת אישית
    if (customNeigh.trim() && selectedCity) {
      const { data: newNeigh } = await supabase
        .from('neighborhoods')
        .insert({ city_id: selectedCity, name: customNeigh.trim() })
        .select()
        .single()
      if (newNeigh) neighborhoodId = newNeigh.id
    }

    const { error } = await supabase.from('profiles').upsert({
      id:              user.id,
      display_name:    displayName.trim(),
      phone:           user.phone ?? null,
      neighborhood_id: neighborhoodId,
      city_id:         cityId,
      updated_at:      new Date().toISOString(),
    })

    if (error) {
      setError('שגיאה בשמירת פרטים. נסה שוב.')
      setLoading(false)
      return
    }

    setStep('done')
    setTimeout(() => router.push('/feed'), 1500)
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ברוך הבא לשכונה!</h2>
        <p className="text-gray-500">מעביר אותך לאפליקציה...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 bg-gradient-to-b from-primary-50 to-white">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {(['name', 'location'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step === s || (step === 'location' && i === 0)
                ? 'bg-primary-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 'name' && (
        <form onSubmit={handleNameSubmit} className="flex flex-col gap-6">
          <div>
            <div className="text-4xl mb-3">👋</div>
            <h1 className="text-2xl font-bold text-gray-900">נתחיל ממך</h1>
            <p className="text-gray-500 mt-1 text-sm">איך לקרוא ל נאליח בשכונה?</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שם תצוגה</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="למשל: רחל כהן"
              className="input-field"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary mt-auto">המשך</button>
        </form>
      )}

      {step === 'location' && (
        <form onSubmit={handleLocationSubmit} className="flex flex-col gap-6">
          <div>
            <div className="text-4xl mb-3">📍</div>
            <h1 className="text-2xl font-bold text-gray-900">איפה אתה גר/ה?</h1>
            <p className="text-gray-500 mt-1 text-sm">זה יעזור לך לראות מודעות קרובות</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">עיר</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="input-field"
              >
                <option value="">בחר עיר</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedCity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שכונה</label>
                <select
                  value={selectedNeigh}
                  onChange={e => setSelectedNeigh(e.target.value)}
                  className="input-field"
                >
                  <option value="">בחר שכונה</option>
                  {neighborhoods.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                  <option value="__custom__">אחר (הוסף ידנית)</option>
                </select>
              </div>
            )}

            {selectedNeigh === '__custom__' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שם שכונה</label>
                <input
                  type="text"
                  value={customNeigh}
                  onChange={e => setCustomNeigh(e.target.value)}
                  placeholder="הכנס שם שכונה"
                  className="input-field"
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-z mt-auto">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || (!selectedCity)}
            >
              {loading ? 'שומר...' : 'כניסה לאפליקציה'}
            </button>
            <button
              type="button"
              onClick={() => handleLocationSubmit({ preventDefault: () => {} } as React.FormEvent)}
              className="w-full text-sm text-gray-400 text-center"
            >
              דלג (ניתן לשנות אחר כך)
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
