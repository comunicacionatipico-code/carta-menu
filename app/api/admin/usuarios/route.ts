import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabase } from '@/lib/supabase'
import { verifySession } from '@/lib/session'

function getSuperAdmin(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')?.value
  if (!cookie) return null
  const s = verifySession(cookie)
  return s?.superAdmin ? s : null
}

export async function GET(req: NextRequest) {
  if (!getSuperAdmin(req)) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Sin Supabase' }, { status: 500 })
  const { data } = await supabase.from('usuarios').select('id, usuario, restaurantes, created_at').order('created_at')
  return NextResponse.json({ usuarios: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!getSuperAdmin(req)) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Sin Supabase' }, { status: 500 })

  const { usuario, password, restaurantes } = await req.json()
  if (!usuario || !password) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase.from('usuarios').insert({ usuario, password_hash, restaurantes: restaurantes ?? [] }).select('id, usuario, restaurantes').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, usuario: data })
}
