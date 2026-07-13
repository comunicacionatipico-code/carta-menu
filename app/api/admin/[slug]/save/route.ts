import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json() as Restaurante

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })

    // Leer datos actuales para preservar imágenes que ya estén en Supabase
    const { data: current } = await supabase
      .from('restaurantes').select('data').eq('slug', params.slug).single()

    let datosAGuardar = body

    if (current?.data) {
      const currentData = current.data as Restaurante
      // Mapa de imagen_url existentes por id de plato
      const imagenesGuardadas: Record<string, string> = {}
      for (const cat of currentData.categorias ?? []) {
        for (const plato of cat.platos ?? []) {
          if (plato.imagen_url) imagenesGuardadas[plato.id] = plato.imagen_url
        }
      }

      // Si el body llega sin imagen pero Supabase ya la tiene, se preserva
      datosAGuardar = {
        ...body,
        logo_url: body.logo_url ?? currentData.logo_url ?? null,
        categorias: body.categorias.map(cat => ({
          ...cat,
          platos: cat.platos.map(plato => ({
            ...plato,
            imagen_url: plato.imagen_url ?? imagenesGuardadas[plato.id] ?? null,
          })),
        })),
      }
    }

    const now = new Date().toISOString()
    const { data: upsertData, error, status, statusText } = await supabase
      .from('restaurantes')
      .upsert({ slug: params.slug, data: datosAGuardar, updated_at: now }, { onConflict: 'slug' })
      .select('updated_at')
      .single()

    if (error) {
      console.error('Supabase upsert error:', error, status, statusText)
      return NextResponse.json({ error: error.message, code: error.code, details: { status, statusText } }, { status: 500 })
    }

    const primerPlato = datosAGuardar.categorias?.[0]?.platos?.[0]
    return NextResponse.json({
      ok: true,
      updated_at: upsertData?.updated_at ?? now,
      recibido: {
        primer_plato_nombre: primerPlato?.nombre?.es,
        primer_plato_precio: primerPlato?.precio,
        primer_plato_imagen: primerPlato?.imagen_url?.slice(0, 60) ?? null,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
