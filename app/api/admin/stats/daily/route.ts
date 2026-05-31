import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, amountPaid: true },
      orderBy: { createdAt: 'asc' },
    })

    // Build a map for each of the last 7 days
    const days: { name: string; date: string; revenue: number; orders: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      days.push({
        name: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        revenue: 0,
        orders: 0,
      })
    }

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const day = days.find(d => d.date === dateKey)
      if (day) {
        day.revenue += (order.amountPaid || 0) / 100
        day.orders += 1
      }
    }

    return NextResponse.json(days)
  } catch (error) {
    console.error('Daily stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch daily stats' }, { status: 500 })
  }
}
