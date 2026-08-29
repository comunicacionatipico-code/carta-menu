import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getAllSlugs, getRestaurante } from '@/lib/restaurante'
import { Restaurante } from '@/types/restaurante'

export async function GET() {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase.from('restaurantes').select('slug, data').order('slug')
    if (!error && data) {
      return NextResponse.json(data.map(row => ({
        slug: row.slug,
        ...(row.data as Restaurante),
      })))
    }
  }

  // fallback: local JSON
  const slugs = getAllSlugs()
  const lista = slugs.map(slug => ({ slug, ...getRestaurante(slug) })).filter(Boolean)
  return NextResponse.json(lista)
}
