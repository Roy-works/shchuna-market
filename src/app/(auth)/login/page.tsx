'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'email' | 'otp'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step,    setStep]    = useState<Step>('email')
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setError('שגיאה בשליחת קוד. בדוק את כתובת האימייל ונסה שוב.')
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError('קוד שגוי. נסה שוב.')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('neighborhood_id')
        .eq('id', data.user.id)
        .single()

      if (!profile?.neighborhood_id) {
        router.push('/onboarding')
      } else {
        router.push('/feed')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-primary-50 to-white">
      {/* לוגו */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">🏘️</div>
        <h1 className="text-3xl font-bold text-gray-900">שכונה מרקט</h1>
        <p className="text-gray-500 mt-2 text-sm">שוק שכונתי קהילתי</p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">כניסה / הרשמה</h2>
              <p className="text-sm text-gray-500">הכנס כתובת אימייל</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                כתובת אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
                dir="ltr"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'שולח קוד...' : 'שלח קוד אימות'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              נשלח קוד חד-פעמי לכתובת האימייל שלך
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">הכנס קוד אימות</h2>
              <p className="text-sm text-gray-500">
                שלחנו קוד ל-{email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                קוד אימות (6 ספרות)
              </label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="input-field text-center text-2xl tracking-widest"
                maxLength={6}
                inputMode="numeric"
                required
                dir="ltr"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'מאמת...' : 'אמת קוד'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              className="w-full text-sm text-gray-500 text-center py-1"
            >
              שנה כתובת אימייל
            </button>
          </form>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center px-4">
        בכניסה לאפליקציה אתה מסכים לתנאי השימוש ומדיניות הפרטיות
      </p>
    </div>
  )
}
