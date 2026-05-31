import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'

export async function DELETE(req: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_session')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const confirm = req.headers.get('x-confirm-delete')
  if (confirm !== 'DELETE_ALL_ORDERS') {
    return NextResponse.json(
      { error: 'Missing confirmation header: x-confirm-delete: DELETE_ALL_ORDERS' },
      { status: 400 }
    )
  }

  const [orders, resets] = await Promise.all([
    prisma.order.deleteMany({}),
    prisma.passwordReset.deleteMany({}),
  ])

  return NextResponse.json({
    success: true,
    deleted: { orders: orders.count, passwordResets: resets.count },
  })
}
