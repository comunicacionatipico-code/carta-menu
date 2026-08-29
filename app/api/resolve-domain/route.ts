import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// Called by middleware to resolve a custom hostname → slug
// Kept lightweight and public intentionally (returns only slug, no sensitive data)
export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get('host')
  if (!host) return NextResponse.json({ slug: null })

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ slug: null })

  const { data } = await supabase
    .from('restaurantes')
    .select('slug, data')
    .order('slug')

  if (!data) return NextResponse.json({ slug: null })

  for (const row of data) {
    const dominio = (row.data as { dominio_personalizado?: string })?.dominio_personalizado
    if (dominio && host.includes(dominio)) {
      return NextResponse.json({ slug: row.slug }, {
        headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
      })
    }
  }

  return NextResponse.json({ slug: null })
}
