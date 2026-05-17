import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayAgg, weeklyAgg, monthlyAgg, totalCustomers] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: todayStart } },
        _count: { _all: true },
        _sum: { amountPaid: true }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: weekStart } },
        _count: { _all: true },
        _sum: { amountPaid: true }
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: monthStart } },
        _count: { _all: true },
        _sum: { amountPaid: true }
      }),
      prisma.order.count()
    ])

    return NextResponse.json({
      today: {
        deposits: (todayAgg._sum.amountPaid || 0) / 100,
        count: todayAgg._count._all
      },
      weekly: {
        deposits: (weeklyAgg._sum.amountPaid || 0) / 100,
        count: weeklyAgg._count._all
      },
      monthly: {
        deposits: (monthlyAgg._sum.amountPaid || 0) / 100,
        count: monthlyAgg._count._all
      },
      totalCustomers
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
