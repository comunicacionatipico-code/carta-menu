import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  const subtitulo = 'Paellas y Tapas · Valencia'
  const resultados: Record<string, string> = {}

  for (const slug of ['redondo-en-boca', 'el-socarrat']) {
    const { data: row } = await supabase
      .from('restaurantes').select('data').eq('slug', slug).single()

    if (!row?.data) {
      resultados[slug] = 'no existe en Supabase (se usará JSON local)'
      continue
    }

    const updated = { ...(row.data as any), subtitulo }
    const { error } = await supabase
      .from('restaurantes')
      .update({ data: updated, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    resultados[slug] = error ? 'ERROR: ' + error.message : 'OK'
  }

  return NextResponse.json({ subtitulo, resultados })
}
