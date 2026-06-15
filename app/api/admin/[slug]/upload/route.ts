import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: 'dxlfyx8tq',
  api_key: '188964613556253',
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif']
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `carta-menu/${params.slug}`, resource_type: 'image' },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
