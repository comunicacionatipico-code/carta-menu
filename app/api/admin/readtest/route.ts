import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getRestaurante } from '@/lib/restaurante'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? 'redondo-en-boca'

  const localData = getRestaurante(slug)
  const localPrecio = localData?.categorias?.[0]?.platos?.[0]?.precio

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ source: 'NO_SUPABASE_CLIENT', localPrecio })
  }

  const { data, error } = await supabase
    .from('restaurantes')
    .select('data')
    .eq('slug', slug)
    .single()

  if (error) {
    return NextResponse.json({
      source: 'SUPABASE_ERROR',
      error: { code: error.code, message: error.message },
      localPrecio,
    })
  }

  const supabasePrecio = (data?.data as any)?.categorias?.[0]?.platos?.[0]?.precio

  return NextResponse.json({
    source: 'SUPABASE_OK',
    supabasePrecio,
    localPrecio,
    dataExists: !!data?.data,
  })
}
