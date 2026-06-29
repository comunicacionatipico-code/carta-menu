import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase no configurado', env: !!process.env.SUPABASE_URL })

  const { data, error } = await supabase
    .from('restaurantes')
    .select('slug, updated_at')

  return NextResponse.json({ data, error })
}
