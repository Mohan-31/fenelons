import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const turkeyCount = await prisma.order.count({ where: { meatType: 'turkey', isFinished: false } })
    const hamCount = await prisma.order.count({ where: { meatType: 'ham', isFinished: false } })

    return NextResponse.json({
      turkey: turkeyCount,
      ham: hamCount,
      total: turkeyCount + hamCount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Stats failed' }, { status: 500 })
  }
}