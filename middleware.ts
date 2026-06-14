import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin/login')) return NextResponse.next()
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const session = req.cookies.get('admin_session')?.value
  const secret = process.env.ADMIN_SECRET

  if (!secret || session !== secret) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
