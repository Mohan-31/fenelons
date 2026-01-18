import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const { id, isFinished } = await req.json()
    const updated = await prisma.order.update({
      where: { id },
      data: { isFinished }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}