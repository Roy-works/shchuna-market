'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No user found')

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: user.id, name, neighborhood_id: '70ff9b68-0000-4000-8000-0000deadbeef' }])

      if (profileError) throw profileError

      router.push("/feed")
    } catch (err) {
      setError(err.instanceof Error ? err.message : 'Cannot complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-bold">
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleComplete}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </form>

      { error && (<div className="text-red-600">{error}</div>) }
    </div>
  )
}
