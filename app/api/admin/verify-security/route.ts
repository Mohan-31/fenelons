import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    // 1. Check if the session cookie exists
    if (!session || session.value !== 'true') {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // 2. Check if an admin actually exists in the DB (Safety check)
    const adminCount = await prisma.admin.count()
    if (adminCount === 0) {
      return NextResponse.json({ authenticated: false, needsSetup: true }, { status: 200 })
    }

    return NextResponse.json({ authenticated: true }, { status: 200 })
  } catch (error) {
    console.error('Security verification failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}