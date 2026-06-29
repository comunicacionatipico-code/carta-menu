import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase no configurado', env: !!process.env.SUPABASE_URL })

  const { data, error } = await supabase
    .from('restaurantes')
    .select('slug, updated_at, data')

  const resumen = data?.map((r: any) => ({
    slug: r.slug,
    updated_at: r.updated_at,
    imagenes: r.data?.categorias?.flatMap((c: any) =>
      c.platos.filter((p: any) => p.imagen_url).map((p: any) => ({ nombre: p.nombre?.es, url: p.imagen_url?.slice(0, 60) }))
    ) ?? [],
    logo: r.data?.logo_url?.slice(0, 60) ?? null,
  }))

  return NextResponse.json({ resumen, error })
}
