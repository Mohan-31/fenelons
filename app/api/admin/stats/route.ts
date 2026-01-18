import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const ordersToday = await prisma.order.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
    })
    
    const totalCustomers = await prisma.order.count()
    
    // Sum of amountPaid for today
    const depositsToday = await prisma.order.aggregate({
      where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      _sum: { amountPaid: true }
    })

    return NextResponse.json({
      ordersToday,
      totalCustomers,
      todayDeposits: (depositsToday._sum.amountPaid || 0) / 100 // Convert cents to Euro
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}