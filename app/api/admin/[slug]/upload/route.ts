import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif']
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 })
    }

    const dir = path.join(process.cwd(), 'public', 'uploads', params.slug)
    fs.mkdirSync(dir, { recursive: true })

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    fs.writeFileSync(path.join(dir, filename), buffer)

    return NextResponse.json({ url: `/uploads/${params.slug}/${filename}` })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
