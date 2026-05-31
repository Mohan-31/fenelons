import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const PUBLIC_PATHS = ['/admin/login', '/admin/setup', '/admin/forgot-password']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!isPublic) {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (session?.value !== 'true') {
      const returnTo = pathname ? `?redirect=${encodeURIComponent(pathname)}` : ''
      redirect(`/admin/login${returnTo}`)
    }
  }

  return <>{children}</>
}
