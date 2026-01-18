import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function PATCH(req: Request) {
  try {
    // 1. Verify session first (only an logged-in admin can change passwords)
    const cookieStore = await cookies()
    if (cookieStore.get('admin_session')?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, newPassword } = await req.json()
    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.admin.update({
      where: { username },
      data: { passwordHash }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}