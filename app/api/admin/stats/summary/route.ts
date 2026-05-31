import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const [turkeyCount, hamCount, otherCount] = await Promise.all([
      prisma.order.count({ where: { meatType: 'turkey', isFinished: false } }),
      prisma.order.count({ where: { meatType: 'ham', isFinished: false } }),
      prisma.order.count({ where: { meatType: { in: ['beef', 'lamb', 'chicken'] }, isFinished: false } }),
    ])

    return NextResponse.json({
      turkey: turkeyCount,
      ham: hamCount,
      other: otherCount,
      total: turkeyCount + hamCount + otherCount,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Stats failed' }, { status: 500 })
  }
}