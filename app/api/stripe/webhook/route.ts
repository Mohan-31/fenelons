import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent

    try {
      const metadata = intent.metadata || {}

      // Idempotency: check if any order for this payment intent already exists
      const existingCount = await prisma.order.count({
        where: { stripePaymentIntentId: { startsWith: intent.id } },
      })
      if (existingCount > 0) {
        console.log('⚠️ Order(s) already exist for intent:', intent.id)
        return NextResponse.json({ received: true })
      }

      const actualAmountEuro = intent.amount / 100
      const itemCount = parseInt(metadata.itemCount || '1', 10)

      for (let i = 0; i < itemCount; i++) {
        let meatType: string, cut: string, weight: string, customWeight: string | null, pickupDate: string, notes: string | null

        if (metadata.itemCount) {
          // New cart format
          const raw = metadata[`item_${i}`]
          const item = raw ? JSON.parse(raw) : {}
          meatType = item.mt || 'turkey'
          cut = item.cut || 'standard'
          weight = item.w || 'unknown'
          customWeight = item.cw || null
          pickupDate = item.pd || ''
          notes = item.n || null
        } else {
          // Legacy single-item format (backward compat)
          meatType = metadata.meatType || 'turkey'
          cut = metadata.cut || 'standard'
          weight = metadata.weight || 'unknown'
          customWeight = metadata.customWeight || null
          pickupDate = metadata.pickupDate || ''
          notes = metadata.notes || null
        }

        // For multi-item carts, suffix the payment intent ID to satisfy @unique constraint
        const intentId = itemCount > 1 ? `${intent.id}_${i}` : intent.id

        const order = await prisma.order.create({
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

        console.log(`✅ Order ${i + 1}/${itemCount} saved:`, order.id)
      }
    } catch (err) {
      console.error('🔥 Database save failed:', err)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
