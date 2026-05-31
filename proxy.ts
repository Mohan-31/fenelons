import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/setup', '/admin/forgot-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('admin_session')
  const isAuthenticated = session?.value === 'true'

  const isPublic = PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))

  // Forward pathname to server components via header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  if (isPublic) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = { matcher: '/admin/:path*' }
