import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json() as Restaurante

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    const { error, status, statusText } = await supabase
      .from('restaurantes')
      .upsert({ slug: params.slug, data: body, updated_at: new Date().toISOString() })

    if (error) {
      console.error('Supabase upsert error:', error, status, statusText)
      return NextResponse.json({ error: error.message, details: { status, statusText } }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
