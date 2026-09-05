export type SessionPayload = {
  id: string
  usuario: string
  superAdmin: boolean
  restaurantes: string[]
  exp: number
}

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? 'fallback-secret-change-me'
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return btoa(Array.from(new Uint8Array(sig), b => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const data = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const sig = await hmacSign(data, getSecret())
  return `${data}.${sig}`
}

export async function verifySession(cookie: string): Promise<SessionPayload | null> {
  try {
    const [data, sig] = cookie.split('.')
    if (!data || !sig) return null
    const expected = await hmacSign(data, getSecret())
    if (expected !== sig) return null
    const padded = data.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((data.length * 3) % 4 || 4)
    const payload: SessionPayload = JSON.parse(atob(padded))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function canAccessRestaurant(session: SessionPayload, slug: string): boolean {
  if (session.superAdmin) return true
  return session.restaurantes.includes(slug)
}
