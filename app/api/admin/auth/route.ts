import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const isAuthenticated = session?.value === 'true'
  return NextResponse.json({ authenticated: isAuthenticated }, { status: isAuthenticated ? 200 : 401 })
}

export async function POST() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const isAuthenticated = session?.value === 'true'
  return NextResponse.json({ authenticated: isAuthenticated }, { status: isAuthenticated ? 200 : 401 })
}