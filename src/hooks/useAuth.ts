'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'
export function useAuth() {
  const supabase = createClient()
  const [user,setUser] = useState<User|null>(null)
  const [profile,setProfile] = useState<Profile|null>(null)
  const [loading,setLoading] = useState(true)
  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      setUser(session?.user??null)
      if(session?.user){const{data}=await supabase.from('profiles').select('*,neighborhoods(name),cities(name)').eq('id',session.user.id).single();setProfile(data as Profile)}
      setLoading(false)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
      setUser(session?.user??null)
      if(session?.user){const{data}=await supabase.from('profiles').select('*,neighborhoods(name),cities(name)').eq('id',session.user.id).single();setProfile(data as Profile)}else{setProfile(null)}
      setLoading(false)
    })
    return ()=>subscription.unsubscribe()
  },[])
  return {user,profile,loading,signOut:()=>supabase.auth.signOut()}
}
