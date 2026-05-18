'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useOrder } from '@/app/context/OrderContext'
import CheckoutForm from './CheckoutForm'
import Link from 'next/link'
import { format } from 'date-fns'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { order } = useOrder()
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const hasOrder = !!order.meat.pickupDate && !!order.customer.email

  useEffect(() => {
    if (!hasOrder || clientSecret) return

    async function createIntent() {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meat: order.meat, customer: order.customer }),
        })
        const data = await res.json()
        if (data.clientSecret) setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Initialization error:', err)
      }
    }

    createIntent()
  }, [order, clientSecret, hasOrder])

  if (!hasOrder) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">🥩</div>
        <h2 className="text-3xl font-black italic uppercase text-white mb-3">
          No Order Found
        </h2>
        <p className="text-white/40 font-bold text-sm uppercase tracking-widest mb-8">
          Please select your items first
        </p>
        <Link
          href="/#order"
          className="px-8 py-4 bg-[#8B0000] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#a50000] transition-colors"
        >
          Back to Order →
        </Link>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-white/40 font-black uppercase tracking-widest text-sm">
          Securing your order...
        </p>
      </div>
    )
  }

  const meatLabel = order.meat.meatType
    ? order.meat.meatType.charAt(0).toUpperCase() + order.meat.meatType.slice(1)
    : ''

  const weightLabel =
    order.meat.weight === 'custom'
      ? `${order.meat.customWeight}kg (custom)`
      : `${order.meat.weight}kg`

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Back link below global navbar */}
      <div className="px-6 md:px-12 py-3 border-b border-white/5">
        <Link
          href="/#order"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors"
        >
          <span>←</span> Back to Order
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 grid md:grid-cols-5 gap-10 md:gap-16">

        {/* Order summary */}
        <div className="md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#cc4444] mb-4">
            Order Summary
          </p>
          <h1
            className="font-black italic uppercase text-white leading-none mb-10"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Secure<br />Checkout.
          </h1>

          <div className="space-y-1">
            {[
              { label: 'Meat',     value: meatLabel },
              { label: 'Cut',      value: order.meat.cut || '' },
              { label: 'Weight',   value: weightLabel },
              { label: 'Pickup',   value: order.meat.pickupDate ? format(new Date(order.meat.pickupDate), 'dd MMM yyyy') : '' },
              { label: 'Customer', value: order.customer.name || '' },
              { label: 'Email',    value: order.customer.email || '' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  {label}
                </span>
                <span className="text-sm font-black text-white max-w-[60%] text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-4 px-5 bg-[#8B0000]/10 border border-[#8B0000]/20 rounded-2xl mt-5">
            <span className="text-xs font-black uppercase tracking-[0.15em] text-[#cc4444]">
              Deposit Due Today
            </span>
            <span className="text-2xl font-black text-white">€{ADVANCE_PRICE_EUR}</span>
          </div>
        </div>

        {/* Payment form */}
        <div className="md:col-span-3">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-4">
            Payment Details
          </p>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#8B0000',
                  borderRadius: '16px',
                  fontFamily: 'inherit',
                },
              },
            }}
          >
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  )
}
