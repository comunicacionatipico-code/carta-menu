import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string

    if (!file || !path) return NextResponse.json({ error: 'Missing file or path' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || 'image/jpeg'

    // Ensure bucket exists
    await supabase.storage.createBucket('imagenes', { public: true, fileSizeLimit: 10485760 })

    const { error } = await supabase.storage
      .from('imagenes')
      .upload(path, buffer, { contentType, upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
    return NextResponse.json({ publicUrl: data.publicUrl })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
