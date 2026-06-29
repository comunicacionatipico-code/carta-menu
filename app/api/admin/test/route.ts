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
        .select('slug, updated_at, data')
        .eq('slug', slug)
        .single()

      if (error) {
        resultados[slug] = { error: error.message, code: error.code }
      } else {
        const cats = data?.data?.categorias ?? []
        const primerPlato = cats[0]?.platos?.[0]
        resultados[slug] = {
          ok: true,
          updated_at: data?.updated_at,
          primer_plato: primerPlato ? {
            nombre: primerPlato.nombre?.es,
            precio: primerPlato.precio,
            imagen_url: primerPlato.imagen_url?.slice(0, 60) ?? null,
          } : null,
        }
      }
    } catch (e) {
      resultados[slug] = { exception: String(e) }
    }
  }

  return NextResponse.json({ env: envInfo, supabase: resultados })
}
