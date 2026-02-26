import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. ' +
      '로컬 개발 시 .env 파일을 확인해주세요.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

