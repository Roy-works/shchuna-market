'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'email' | 'sent'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step,    setStep]    = useState<Step>('email')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('שגיאה בשליחת הקישור. בדוק את כתובת האימייל ונסה שוב.')
    } else {
      setStep('sent')
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
          <form onSubmit={handleSendLink} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">כניסה / הרשמה</h2>
              <p className="text-sm text-gray-500">הכנס כתובת אימייל לקבלת קישור כניסה</p>
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
              {loading ? 'שולח...' : 'שלח קישור כניסה'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              נשלח קישור כניסה חד-פעמי לאימייל שלך
            </p>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="text-5xl">📧</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">בדוק את האימייל שלך</h2>
              <p className="text-sm text-gray-500">
                שלחנו קישור כניסה ל-<span className="font-medium text-gray-700" dir="ltr">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                לחץ על הקישור במייל כדי להיכנס לאפליקציה
              </p>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 text-sm text-primary-700">
              💡 לא קיבלת? בדוק ב-Spam או לחץ לשלוח שוב
            </div>

            <button
              type="button"
              onClick={() => { setStep('email'); setError('') }}
              className="w-full text-sm text-gray-500 text-center py-1"
            >
              שנה כתובת אימייל
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center px-4">
        בכניסה לאפליקציה אתה מסכים לתנאי השימוש ומדיניות הפרטיות
      </p>
    </div>
  )
}
