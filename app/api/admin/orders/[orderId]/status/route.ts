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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { status } = await req.json()

    const isFinished = status === 'done'

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { isFinished },
    })

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const weight = parseWeight(updated.weight, updated.customWeight)

    const order = {
      id: updated.id,
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      customerEmail: updated.customerEmail,
      status: updated.isFinished ? 'done' : 'pending',
      cut: updated.cut,
      weight,
      customWeight: updated.customWeight || null,
      notes: updated.notes || null,
      pickupDate: updated.pickupDate.toISOString(),
      isNew: updated.createdAt > oneDayAgo,
      version: 0,
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}