import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  const { path } = await req.json() as { path: string }
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.createBucket('imagenes', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  })
  // Ignore error if bucket already exists
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Bucket error:', bucketError)
  }

  const { data, error } = await supabase.storage
    .from('imagenes')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = supabase.storage.from('imagenes').getPublicUrl(path).data.publicUrl

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, publicUrl })
}
