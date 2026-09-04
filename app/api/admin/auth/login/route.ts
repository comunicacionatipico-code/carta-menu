import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { usuario, password } = await req.json()

  const validUser = process.env.ADMIN_USER ?? 'admin'
  const validPass = process.env.ADMIN_PASSWORD ?? process.env.ADMIN_SECRET
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })
  }

  if (usuario !== validUser || password !== validPass) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })
  return res
}
