import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  try {
    const { base64, path, contentType: ct } = await req.json() as { base64: string; path: string; contentType: string }

    if (!base64 || !path) return NextResponse.json({ error: 'Missing base64 or path' }, { status: 400 })

    const buffer = Buffer.from(base64, 'base64')
    const contentType = ct || 'image/jpeg'

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
