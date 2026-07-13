import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getRestaurante } from '@/lib/restaurante'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  const data = getRestaurante('el-socarrat')
  if (!data) return NextResponse.json({ error: 'No local data' }, { status: 500 })

  const { error } = await supabase
    .from('restaurantes')
    .upsert({ slug: 'el-socarrat', data, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    categorias: data.categorias.map(c => ({ nombre: (c.nombre as any).es, tipo: c.tipo, platos: c.platos.length }))
  })
}
