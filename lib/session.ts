import { createHmac } from 'crypto'

export type SessionPayload = {
  id: string
  usuario: string
  superAdmin: boolean
  restaurantes: string[] // slugs asignados; vacío = acceso a todos si superAdmin
  exp: number
}

export function signSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', process.env.ADMIN_SECRET ?? 'fallback')
    .update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySession(cookie: string): SessionPayload | null {
  const dot = cookie.lastIndexOf('.')
  if (dot < 0) return null
  const data = cookie.slice(0, dot)
  const sig  = cookie.slice(dot + 1)
  const expected = createHmac('sha256', process.env.ADMIN_SECRET ?? 'fallback')
    .update(data).digest('base64url')
  if (sig !== expected) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload
    if (payload.exp < Date.now()) return null
    return payload
  } catch { return null }
}

export function canAccessRestaurant(session: SessionPayload, slug: string): boolean {
  if (session.superAdmin) return true
  return session.restaurantes.includes(slug)
}
