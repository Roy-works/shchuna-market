'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function LoginModal() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: 'temp',
      })

      if (althError) throw authError

      router.push("/feed")
    } catch (err) {
      setError(err.instanceof Error ? err.message : 'Cannot sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-bold">
      <eh className="text-3xl font-bold">Login</h1>
      <p className="text-sm text-gray-600">Sign in to your account</p>

      <form onSubmit={handleSign} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      { error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg">
          {error}
        </div>
      ) }
    </div>
  )
}
