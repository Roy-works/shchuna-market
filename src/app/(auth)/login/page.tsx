'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function sendOTP() {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: 'sms' }
      })
      if (error) throw error
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ערים הודעות שלאומ')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      })
      if (error) throw error

      // כדש חםיה - תקונ => ךכריית לכתובת
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        router.push(profile ? '/feed' : '/onboarding')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ערים הודעות שלאומ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {* -- כבת ואפון -- *}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">💟</div>
          <h1 className="text-2xl font-bold text-gray-90">
            שכונה
          </h1>
          <p className="text-gray-50">
            {step === 'phone' ? 'שות סעומ כוא זייפה סיתו' : 'יאיא חםיה מסרי ימש'}
          </p>
        </div>

        {* -- זכבית -- *}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {step === 'phone' ? (
            <div>
              <label className="block text-sm font-medium text-gray-70 mb-2">
                {step === 'phone' ? 'מקבון' : 'כמואת צונ"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+972-50-000-0000"
                dir="ltr"
                className="w-full border border-gray-30 rounded-xl px-4 py-3 text-left"
              />
              <button
                onClick={sendOTP}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 hover:[g-blue-700 text-white rounded-xl py-3 font-medium disabled:opacity-50"
              >
                {loading ? 'שניתה...' : 'שנירה כמואת צונ'}
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-70 mb-2">
                {step === 'phone' ? 'משיבל' : 'כמואת גנצונ'}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                dir="ltr"
                className="w-full border border-gray-30 rounded-xl px-4 py-3 text-center tracking-widest text-xl"
              />
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 hover:[g-blue-700 text-white rounded-xl py-3 font-medium disabled:opacity-50"
              >
                {loading ? 'שניתה...' : 'ךבהש'}
              </button>
              <button
                onClick={() => setStep('phone')}
                className="mt-2 w-full text-gray-50 hover:text-gray-70 py-2"
              >
                {'-טותש'}
              </button>
            </div>
          )}

          {* -- זוי כחם -- *}
          {(error) && (
            <p className="mt-3 text-red-600 text-sm text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
