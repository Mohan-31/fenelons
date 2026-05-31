import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

function parseWeight(weight: string, customWeight: string | null): number {
  if (weight === 'custom' || weight === 'unknown') {
    const parsed = parseFloat(customWeight || '0')
    return isNaN(parsed) ? 0 : parsed
  }
  const parsed = parseFloat(weight)
  return isNaN(parsed) ? 0 : parsed
}

const OTHER_MEATS_TYPES = ['beef', 'lamb', 'chicken']

function mapOrder(order: any, oneDayAgo: Date) {
  const weight = parseWeight(order.weight, order.customWeight)
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    status: order.isFinished ? 'done' : 'pending',
    cut: order.cut,
    weight,
    meatType: order.meatType,
    customWeight: order.customWeight || null,
    notes: order.notes || null,
    pickupDate: order.pickupDate.toISOString(),
    isNew: order.createdAt > oneDayAgo,
    version: 0,
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const meatType = searchParams.get('meatType')

  if (!meatType) {
    return NextResponse.json({ error: 'meatType required' }, { status: 400 })
  }

  const isOtherMeats = meatType.toLowerCase() === 'other-meats'
  const whereClause = isOtherMeats
    ? { meatType: { in: OTHER_MEATS_TYPES } }
    : { meatType: meatType.toLowerCase() }

  try {
    const dbOrders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const orders = dbOrders.map(o => mapOrder(o, oneDayAgo))

    // Build stats from pending orders (grouped by cut + weight)
    const statsMap = new Map<string, { cut: string; weight: number; count: number }>()
    for (const o of orders) {
      if (o.status !== 'pending') continue
      const key = `${o.cut}|${o.weight}`
      const existing = statsMap.get(key)
      if (existing) {
        existing.count++
      } else {
        statsMap.set(key, { cut: o.cut, weight: o.weight, count: 1 })
      }
    }

    const stats = Array.from(statsMap.values()).map(s => ({
      cut: s.cut,
      weight: s.weight,
      _count: { _all: s.count },
    }))

    return NextResponse.json({ stats, orders })
  } catch (error) {
    console.error('Production snapshot error:', error)
    return NextResponse.json({ error: 'Failed to load production data' }, { status: 500 })
  }
}
