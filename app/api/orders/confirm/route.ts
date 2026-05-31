import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const paymentIntentId = searchParams.get('payment_intent')

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'payment_intent required' }, { status: 400 })
  }

  try {
    // Check if order already exists (webhook may have already created it)
    const existing = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    })

    if (existing) {
      return NextResponse.json({ saved: true, orderId: existing.id })
    }

    // Verify payment with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (intent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not succeeded' }, { status: 402 })
    }

    const metadata = intent.metadata || {}
    const actualAmountEuro = intent.amount / 100

    const order = await prisma.order.create({
      data: {
        stripePaymentIntentId: intent.id,
        customerName: metadata.customerName || 'Unknown Customer',
        customerPhone: metadata.customerPhone || 'No Phone',
        customerEmail: metadata.customerEmail || 'No Email',
        pickupDate: metadata.pickupDate ? new Date(metadata.pickupDate) : new Date(),
        meatType: metadata.meatType || 'turkey',
        weight: metadata.weight || 'unknown',
        customWeight: metadata.customWeight || null,
        cut: metadata.cut || 'standard',
        notes: metadata.notes || null,
        amountPaid: intent.amount,
        depositAmount: actualAmountEuro.toString(),
        currency: intent.currency.toUpperCase(),
        status: 'paid',
        isFinished: false,
      },
    })

    return NextResponse.json({ saved: true, orderId: order.id })
  } catch (err) {
    console.error('Order confirm error:', err)
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
  }
}
