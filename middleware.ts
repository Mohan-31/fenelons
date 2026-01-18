import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const { pathname } = request.nextUrl

  // 1. Allow access to these specific pages without a session
  const publicAdminPages = [
    '/admin/login',
    '/admin/setup',
    '/admin/forgot-password'
  ]

  if (publicAdminPages.includes(pathname)) {
    return NextResponse.next()
  }

  // 2. Protect all other /admin routes
  if (pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}