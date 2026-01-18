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
      // 1. Idempotency Check
      const existing = await prisma.order.findUnique({
        where: { stripePaymentIntentId: intent.id },
      })

      if (existing) {
        console.log('⚠️ Order already exists:', intent.id)
        return NextResponse.json({ received: true })
      }

      // 2. Logic & Formatting
      const actualAmountEuro = intent.amount / 100 
      const metadata = intent.metadata || {}

      // 3. Create Order
      const order = await prisma.order.create({
        data: {
          stripePaymentIntentId: intent.id,
          customerName: metadata.customerName || 'Unknown Customer',
          customerPhone: metadata.customerPhone || 'No Phone',
          customerEmail: metadata.customerEmail || 'No Email',
          pickupDate: metadata.pickupDate ? new Date(metadata.pickupDate) : new Date(),
          meatType: metadata.meatType || 'turkey', // Defaulting to turkey to avoid crash
          weight: metadata.weight || 'unknown',
          customWeight: metadata.customWeight || null,
          cut: metadata.cut || 'standard',
          notes: metadata.notes || null,
          
          // These must match your Int and String requirements
          amountPaid: intent.amount, // Store in cents (Int)
          depositAmount: actualAmountEuro.toString(), // Store display value (String)
          currency: intent.currency.toUpperCase(),
          status: 'paid',
          isFinished: false,
        },
      })

      console.log('✅ Order saved successfully:', order.id)
    } catch (err) {
      console.error('🔥 Database save failed:', err)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}