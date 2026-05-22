import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/setup', '/admin/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('admin_session')
  const isAuthenticated = session?.value === 'true'

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    // Already logged in — send straight to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // All other /admin/* routes require a session
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
