import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  const { nombre, subtitulo, slug, color_primario, color_acento, wifi } = await req.json()

  if (!nombre || !slug) return NextResponse.json({ error: 'Nombre y slug son obligatorios' }, { status: 400 })

  const slugLimpio = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const { data: existe } = await supabase.from('restaurantes').select('slug').eq('slug', slugLimpio).single()
  if (existe) return NextResponse.json({ error: `El slug "${slugLimpio}" ya está en uso` }, { status: 409 })

  const restaurante: Restaurante = {
    nombre,
    subtitulo: subtitulo || '',
    color_primario: color_primario || '#1a1a1a',
    color_acento: color_acento || '#c9a96e',
    logo_url: null,
    wifi: wifi || '',
    menus_ocultos: [],
    idiomas: ['es', 'en'],
    categorias: [],
  }

  const { error } = await supabase.from('restaurantes').insert({ slug: slugLimpio, data: restaurante })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ slug: slugLimpio })
}
