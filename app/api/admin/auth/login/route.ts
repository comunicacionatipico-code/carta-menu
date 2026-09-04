import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabase } from '@/lib/supabase'
import { signSession } from '@/lib/session'

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 días

export async function POST(req: NextRequest) {
  const { usuario, password } = await req.json()
  const secret = process.env.ADMIN_SECRET

  if (!secret) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })

  // ── Super admin via env vars ──
  const superUser = process.env.ADMIN_USER ?? 'admin'
  const superPass = process.env.ADMIN_PASSWORD ?? secret
  if (usuario === superUser && password === superPass) {
    const token = signSession({ id: 'superadmin', usuario: superUser, superAdmin: true, restaurantes: [], exp: Date.now() + SESSION_TTL })
    const res = NextResponse.json({ ok: true, superAdmin: true })
    res.cookies.set('admin_session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  }

  // ── Usuario normal en Supabase ──
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })

  const { data: user } = await supabase.from('usuarios').select('*').eq('usuario', usuario).single()
  if (!user) return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })

  const token = signSession({ id: user.id, usuario: user.usuario, superAdmin: false, restaurantes: user.restaurantes ?? [], exp: Date.now() + SESSION_TTL })
  const res = NextResponse.json({ ok: true, superAdmin: false, restaurantes: user.restaurantes ?? [] })
  res.cookies.set('admin_session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
  return res
}
