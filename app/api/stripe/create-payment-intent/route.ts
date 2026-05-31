import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { cart, customer } = await req.json()

    if (!Array.isArray(cart) || cart.length === 0 || !customer) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 })
    }

    const amountCents = Math.round(ADVANCE_PRICE_EUR * 100)

    // Build Stripe metadata — customer fields + one entry per cart item
    const metadata: Record<string, string> = {
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      itemCount: String(cart.length),
    }

    cart.forEach((item: Record<string, unknown>, i: number) => {
      // Compact encoding to stay within Stripe's 500-char value limit
      metadata[`item_${i}`] = JSON.stringify({
        mt: item.meatType || '',
        cut: item.cut || '',
        w: String(item.weight ?? ''),
        cw: String(item.customWeight || '').slice(0, 200),
        pd: item.pickupDate || '',
        n: String(item.notes || '').slice(0, 200),
      })
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Stripe Server Error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
