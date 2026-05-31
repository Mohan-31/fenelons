import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

const OTHER_MEATS_TYPES = ['beef', 'lamb', 'chicken']

function parseWeight(weight: string, customWeight: string | null): number {
  if (weight === 'custom' || weight === 'unknown') {
    const parsed = parseFloat(customWeight || '0')
    return isNaN(parsed) ? 0 : parsed
  }
  const parsed = parseFloat(weight)
  return isNaN(parsed) ? 0 : parsed
}

export async function POST(req: Request) {
  try {
    const { meatType, orderIds, status } = await req.json()

    if (!meatType || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const isFinished = status === 'done'
    const isOtherMeats = ['other', 'other-meats'].includes(meatType.toLowerCase())

    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { isFinished },
    })

    const whereClause = isOtherMeats
      ? { meatType: { in: OTHER_MEATS_TYPES } }
      : { meatType: meatType.toLowerCase() }

    const dbOrders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const orders = dbOrders.map(o => ({
      id: o.id,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      status: o.isFinished ? 'done' : 'pending',
      cut: o.cut,
      weight: parseWeight(o.weight, o.customWeight),
      meatType: o.meatType,
      customWeight: o.customWeight || null,
      notes: o.notes || null,
      pickupDate: o.pickupDate.toISOString(),
      isNew: o.createdAt > oneDayAgo,
      version: 0,
    }))

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Bulk status error:', error)
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 })
  }
}