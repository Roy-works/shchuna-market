'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step,    setStep]    = useState<Step>('phone')
  const [phone,   setPhone]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // פורמט מספר טלפון ישראלי
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return '+972' + digits.slice(1)
    if (digits.startsWith('972')) return '+' + digits
    return '+972' + digits
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formatted = formatPhone(phone)
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })

    if (error) {
      setError('שגיאה בשליחת קוד. בדוק את מספר הטלפון ונסה שוב.')
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formatted = formatPhone(phone)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type:  'sms',
    })

    if (error) {
      setError('קוד שגוי. נסה שוב.')
      setLoading(false)
      return
    }

    if (data.user) {
      // בדוק אם יש פרופיל
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

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">כניסה / הרשמה</h2>
              <p className="text-sm text-gray-500">הכנס מספר טלפון ישראלי</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                מספר טלפון
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  🇮🇱 +972
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="050-000-0000"
                  className="input-field pr-20"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'שולח קוד...' : 'שלח קוד אימות'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              נשלח SMS עם קוד חד-פעמי למספרך
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">הכנס קוד אימות</h2>
              <p className="text-sm text-gray-500">
                שלחנו SMS ל-{phone}
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
              onClick={() => { setStep('phone'); setOtp(''); setError('') }}
              className="w-full text-sm text-gray-500 text-center py-1"
            >
              שנה מספר טלפון
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
