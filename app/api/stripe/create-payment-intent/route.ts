import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { meat, customer } = await req.json()

    if (!meat || !customer) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 })
    }

    // ✅ Mandatory Fix: Rounding to prevent floating point math errors
    const amountCents = Math.round(ADVANCE_PRICE_EUR * 100) 

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        pickupDate: meat.pickupDate,
        weight: String(meat.weight),
        customWeight: meat.customWeight || '', // ✅ Mandatory Fix: Added custom weight
        cut: meat.cut,
        notes: meat.notes || 'None',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Stripe Server Error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}