import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function createServerSupabaseClient() {
  const cs = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{get(n:string){return cs.get(n)?.value},set(n:string,v:string,o:any){cs.set({name:n,value:v,...o})},remove(n:string,o:any){cs.set({name:n,value:'',...o})}}})
}
