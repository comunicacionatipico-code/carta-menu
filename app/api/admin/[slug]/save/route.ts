import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Restaurante } from '@/types/restaurante'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'restaurantes', `${params.slug}.json`)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
    }

    const body = await req.json() as Restaurante
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8')

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
