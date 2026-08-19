import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  const { data, error } = await supabase
    .from('restaurantes').select('data, updated_at').eq('slug', 'el-socarrat').single()

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'No encontrado' }, { status: 500 })

  const r = data.data as Restaurante
  return NextResponse.json({
    updated_at: data.updated_at,
    menus_ocultos: r.menus_ocultos ?? [],
    total_categorias: r.categorias.length,
    categorias: r.categorias.map(c => ({
      id: c.id,
      nombre: c.nombre.es,
      tipo: c.tipo ?? 'carta',
      platos: c.platos.length,
      platos_con_imagen: c.platos.filter(p => p.imagen_url).map(p => ({
        nombre: p.nombre.es,
        url: p.imagen_url?.slice(0, 80),
      })),
    })),
  })
}
