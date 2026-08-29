import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabase } from '@/lib/supabase'
import { Restaurante, Categoria, Plato } from '@/types/restaurante'

const client = new Anthropic()

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

const SYSTEM = `Eres un experto en extracción de cartas de restaurantes.
Se te dará el texto de un PDF de una carta de restaurante.
Tu tarea: extraer TODAS las secciones y platos con sus precios, descripciones y alérgenos.

Responde SOLO con un JSON válido con esta estructura exacta (sin markdown, sin texto extra):
{
  "categorias": [
    {
      "nombre": "Nombre de la sección",
      "tipo": "carta",
      "platos": [
        {
          "nombre": "Nombre del plato",
          "descripcion": "Descripción si la hay, si no cadena vacía",
          "precio": 12.50,
          "precio_label": "opcional, ej: 'desde' o 'por persona'",
          "alergenos": ["gluten", "lacteos", "huevos", "pescado", "marisco", "frutos_secos", "soja", "apio", "mostaza", "sesamo", "sulfitos", "altramuces", "moluscos"]
        }
      ]
    }
  ]
}

Reglas:
- tipo debe ser "carta", "bebidas", "vinos" o "cocktails" según el contenido
- Si no hay descripción deja cadena vacía ""
- Si el precio no está claro pon 0
- precio_label solo si hay indicación especial (por persona, desde, media/ración, etc.)
- alergenos: incluye solo los que estén mencionados explícitamente o sean muy evidentes por los ingredientes
- Si hay precios medias/ración, usa precio para la ración y precio2 para la media con su precio2_label
- Extrae TODO, no omitas nada`

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    if (!file) return NextResponse.json({ error: 'No PDF' }, { status: 400 })

    // Extract text from PDF using pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer())
    // dynamic import to avoid SSR issues
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default ?? pdfParseModule
    const parsed = await pdfParse(buffer)
    const texto = parsed.text

    if (!texto || texto.trim().length < 50) {
      return NextResponse.json({ error: 'No se pudo extraer texto del PDF. Asegúrate de que el PDF no sea solo imágenes.' }, { status: 400 })
    }

    // Call Claude to structure the menu
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `Extrae la carta de este restaurante en JSON estructurado:\n\n${texto.slice(0, 30000)}`,
        },
      ],
      system: SYSTEM,
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    let parsed2: { categorias: Array<{ nombre: string; tipo: string; platos: Array<{ nombre: string; descripcion: string; precio: number; precio_label?: string; precio2?: number; precio2_label?: string; alergenos: string[] }> }> }

    try {
      // strip possible markdown fences
      const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      parsed2 = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Claude no devolvió JSON válido', raw }, { status: 500 })
    }

    // Build categorias in our format
    const IDIOMAS = ['es', 'en', 'it', 'fr', 'de', 'ru']
    const categorias: Categoria[] = parsed2.categorias.map(cat => ({
      id: makeId(),
      nombre: Object.fromEntries(IDIOMAS.map(l => [l, cat.nombre])),
      tipo: (cat.tipo as 'carta' | 'bebidas' | 'vinos' | 'cocktails') || 'carta',
      platos: cat.platos.map(p => ({
        id: makeId(),
        nombre: Object.fromEntries(IDIOMAS.map(l => [l, p.nombre])),
        descripcion: Object.fromEntries(IDIOMAS.map(l => [l, p.descripcion || ''])),
        precio: Number(p.precio) || 0,
        ...(p.precio_label ? { precio_label: p.precio_label } : {}),
        ...(p.precio2 ? { precio2: Number(p.precio2) } : {}),
        ...(p.precio2_label ? { precio2_label: p.precio2_label } : {}),
        emoji: '',
        imagen_url: null,
        alergenos: p.alergenos || [],
        disponible: true,
      } as Plato)),
    }))

    // Merge with existing data in Supabase
    const supabase = getSupabase()
    if (supabase) {
      const { data: current } = await supabase.from('restaurantes').select('data').eq('slug', params.slug).single()
      if (current?.data) {
        const existing = current.data as Restaurante
        const updated: Restaurante = { ...existing, categorias: [...existing.categorias, ...categorias] }
        await supabase.from('restaurantes').update({ data: updated }).eq('slug', params.slug)
      }
    }

    return NextResponse.json({ categorias, total: categorias.length, platos: categorias.reduce((a, c) => a + c.platos.length, 0) })
  } catch (e) {
    console.error('import-pdf error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
