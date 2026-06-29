import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  const envInfo = {
    SUPABASE_URL: url ? url.slice(0, 30) + '...' : 'NO CONFIGURADO',
    SUPABASE_SERVICE_KEY: key ? key.slice(0, 20) + '...' : 'NO CONFIGURADO',
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ env: envInfo, error: 'getSupabase() devuelve null' })
  }

  const slugs = ['redondo-en-boca', 'el-socarrat']
  const resultados: Record<string, any> = {}

  for (const slug of slugs) {
    try {
      const { data, error } = await supabase
        .from('restaurantes')
        .select('slug, updated_at')
        .eq('slug', slug)
        .single()

      resultados[slug] = error
        ? { error: error.message, code: error.code }
        : { ok: true, updated_at: data?.updated_at }
    } catch (e) {
      resultados[slug] = { exception: String(e) }
    }
  }

  return NextResponse.json({ env: envInfo, supabase: resultados })
}
