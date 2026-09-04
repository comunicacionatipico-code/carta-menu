import { NextRequest, NextResponse } from 'next/server'
import { verifySession, canAccessRestaurant } from '@/lib/session'

const domainCache = new Map<string, { slug: string | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000
const SYSTEM_HOSTS = ['carta-menu-topaz.vercel.app', 'carta-menu-seven.vercel.app', 'localhost']

async function resolveCustomDomain(host: string, origin: string): Promise<string | null> {
  const cached = domainCache.get(host)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.slug
  try {
    const res = await fetch(`${origin}/api/resolve-domain?host=${encodeURIComponent(host)}`, { headers: { 'x-internal': '1' }, next: { revalidate: 300 } })
    const json: { slug: string | null } = await res.json()
    domainCache.set(host, { slug: json.slug, ts: Date.now() })
    return json.slug
  } catch { return null }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''

  // Public: login page
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  // Admin routes — verify session
  if (pathname.startsWith('/admin')) {
    const cookie = req.cookies.get('admin_session')?.value
    const session = cookie ? verifySession(cookie) : null

    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Restrict restaurant-specific routes to assigned users
    const match = pathname.match(/^\/admin\/([^\/]+)/)
    if (match) {
      const slug = match[1]
      const reserved = ['login', 'usuarios']
      if (!reserved.includes(slug) && !canAccessRestaurant(session, slug)) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
      // Only superAdmin can access /admin/usuarios
      if (slug === 'usuarios' && !session.superAdmin) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }

    // Inject session info as headers for server components
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
