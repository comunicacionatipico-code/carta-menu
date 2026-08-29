import { NextRequest, NextResponse } from 'next/server'

// In-memory cache: hostname → slug (lives for the duration of the edge worker)
const domainCache = new Map<string, { slug: string | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 min

const SYSTEM_HOSTS = ['carta-menu-topaz.vercel.app', 'carta-menu-seven.vercel.app', 'localhost']

async function resolveCustomDomain(host: string, origin: string): Promise<string | null> {
  const cached = domainCache.get(host)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.slug

  try {
    const res = await fetch(`${origin}/api/resolve-domain?host=${encodeURIComponent(host)}`, {
      headers: { 'x-internal': '1' },
      next: { revalidate: 300 },
    })
    const json: { slug: string | null } = await res.json()
    domainCache.set(host, { slug: json.slug, ts: Date.now() })
    return json.slug
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host') ?? ''

  // Admin auth guard
  if (pathname.startsWith('/admin/login')) return NextResponse.next()
  if (pathname.startsWith('/admin')) {
    const session = req.cookies.get('admin_session')?.value
    const secret = process.env.ADMIN_SECRET
    if (!secret || session !== secret) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Custom domain routing: only for non-system hosts and non-API/static paths
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
