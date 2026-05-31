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
    // Idempotency: check if any order(s) for this payment intent already exist
    const existingCount = await prisma.order.count({
      where: { stripePaymentIntentId: { startsWith: paymentIntentId } },
    })
    if (existingCount > 0) {
      return NextResponse.json({ saved: true })
    }

    // Verify payment with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (intent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not succeeded' }, { status: 402 })
    }

    const metadata = intent.metadata || {}
    const actualAmountEuro = intent.amount / 100
    const itemCount = parseInt(metadata.itemCount || '1', 10)

    for (let i = 0; i < itemCount; i++) {
      let meatType: string, cut: string, weight: string, customWeight: string | null, pickupDate: string, notes: string | null

      if (metadata.itemCount) {
        const raw = metadata[`item_${i}`]
        const item = raw ? JSON.parse(raw) : {}
        meatType = item.mt || 'turkey'
        cut = item.cut || 'standard'
        weight = item.w || 'unknown'
        customWeight = item.cw || null
        pickupDate = item.pd || ''
        notes = item.n || null
      } else {
        meatType = metadata.meatType || 'turkey'
        cut = metadata.cut || 'standard'
        weight = metadata.weight || 'unknown'
        customWeight = metadata.customWeight || null
        pickupDate = metadata.pickupDate || ''
        notes = metadata.notes || null
      }

      const intentId = itemCount > 1 ? `${intent.id}_${i}` : intent.id

      await prisma.order.create({
        data: {
          stripePaymentIntentId: intentId,
          customerName: metadata.customerName || 'Unknown Customer',
          customerPhone: metadata.customerPhone || 'No Phone',
          customerEmail: metadata.customerEmail || 'No Email',
          pickupDate: pickupDate ? new Date(pickupDate) : new Date(),
          meatType,
          weight,
          customWeight,
          cut,
          notes,
          amountPaid: intent.amount,
          depositAmount: actualAmountEuro.toString(),
          currency: intent.currency.toUpperCase(),
          status: 'paid',
          isFinished: false,
        },
      })
    }

    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error('Order confirm error:', err)
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
  }
}
