import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// Multi-item carts create rows pi_xxx_0, pi_xxx_1, pi_xxx_2 — all storing the full
// amountPaid. Deduplicate by stripping the _N suffix so each checkout counts once.
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
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch month (superset of today + week) and all-time in parallel
    const [monthOrders, allOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { createdAt: true, amountPaid: true, stripePaymentIntentId: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        select: { stripePaymentIntentId: true },
      }),
    ])

    function aggregate(orders: typeof monthOrders) {
      const deduped = deduplicateByCheckout(orders)
      return {
        count: deduped.length,
        deposits: deduped.reduce((sum, o) => sum + (o.amountPaid || 0), 0) / 100,
      }
    }

    return NextResponse.json({
      today: aggregate(monthOrders.filter(o => o.createdAt >= todayStart)),
      weekly: aggregate(monthOrders.filter(o => o.createdAt >= weekStart)),
      monthly: aggregate(monthOrders),
      totalCustomers: deduplicateByCheckout(allOrders).length,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
