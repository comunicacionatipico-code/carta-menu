import { NextRequest, NextResponse } from 'next/server'

const domainCache = new Map<string, { slug: string | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000
const SYSTEM_HOSTS = ['carta-menu-topaz.vercel.app', 'carta-menu-seven.vercel.app', 'localhost']

async function resolveCustomDomain(host: string, origin: string): Promise<string | null> {
  const cached = domainCache.get(host)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.slug
  try {
    const res = await fetch(`${origin}/api/resolve-domain?host=${encodeURIComponent(host)}`, { headers: { 'x-internal': '1' } })
    const json: { slug: string | null } = await res.json()
    domainCache.set(host, { slug: json.slug, ts: Date.now() })
    return json.slug
  } catch { return null }
}

async function decodeSession(cookie: string): Promise<{ id: string; usuario: string; superAdmin: boolean; restaurantes: string[]; exp: number } | null> {
  try {
    const [data, sig] = cookie.split('.')
    if (!data || !sig) return null

    const secret = process.env.ADMIN_SECRET ?? 'fallback-secret-change-me'
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(data))
    const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    if (expected !== sig) return null

    const padded = data.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded + '=='.slice(padded.length % 4 || 4))
    const payload = JSON.parse(json)
    if (!payload || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''

  // Public: login page and static assets
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  // Admin routes — verify session
  if (pathname.startsWith('/admin')) {
    const cookie = req.cookies.get('admin_session')?.value
    const session = cookie ? await decodeSession(cookie) : null

    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    const match = pathname.match(/^\/admin\/([^/]+)/)
    if (match) {
      const slug = match[1]
      const reserved = ['login', 'usuarios']

      if (slug === 'usuarios' && !session.superAdmin) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }

      if (!reserved.includes(slug) && !session.superAdmin && !session.restaurantes.includes(slug)) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }

    const res = NextResponse.next()
    res.headers.set('x-session-super', session.superAdmin ? '1' : '0')
    res.headers.set('x-session-restaurantes', JSON.stringify(session.restaurantes))
    res.headers.set('x-session-usuario', session.usuario)
    return res
  }

  // Custom domain routing
  const isSystemHost = SYSTEM_HOSTS.some(h => host.includes(h))
  if (!isSystemHost && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const slug = await resolveCustomDomain(host, origin)
    if (slug) {
      const url = req.nextUrl.clone()
      url.pathname = `/${slug}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
