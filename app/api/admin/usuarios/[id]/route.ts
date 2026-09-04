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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSuperAdmin(req)) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Sin Supabase' }, { status: 500 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (body.restaurantes !== undefined) updates.restaurantes = body.restaurantes
  if (body.password) updates.password_hash = await bcrypt.hash(body.password, 10)

  const { error } = await supabase.from('usuarios').update(updates).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSuperAdmin(req)) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Sin Supabase' }, { status: 500 })

  const { error } = await supabase.from('usuarios').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
