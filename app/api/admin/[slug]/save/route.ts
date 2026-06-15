import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { Restaurante } from '@/types/restaurante'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json() as Restaurante

    // Try Vercel Blob first (production)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await put(`restaurantes/${params.slug}.json`, JSON.stringify(body, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      return NextResponse.json({ ok: true })
    }

    // Fallback: local filesystem (development)
    const filePath = path.join(process.cwd(), 'data', 'restaurantes', `${params.slug}.json`)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
    }
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
