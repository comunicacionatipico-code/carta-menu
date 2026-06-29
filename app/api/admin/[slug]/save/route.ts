import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json() as Restaurante

    const { error } = await supabase
      .from('restaurantes')
      .upsert({ slug: params.slug, data: body, updated_at: new Date().toISOString() })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
