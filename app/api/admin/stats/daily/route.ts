import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

function deduplicateByCheckout<T extends { stripePaymentIntentId: string }>(rows: T[]): T[] {
  const seen = new Set<string>()
  return rows.filter(row => {
    const base = row.stripePaymentIntentId.replace(/_\d+$/, '')
    if (seen.has(base)) return false
    seen.add(base)
    return true
  })
}

export async function GET() {
  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, amountPaid: true, stripePaymentIntentId: true },
      orderBy: { createdAt: 'asc' },
    })

    // One entry per checkout — strips _N suffix so multi-item carts count once per day
    const deduped = deduplicateByCheckout(orders)

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

    for (const order of deduped) {
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
