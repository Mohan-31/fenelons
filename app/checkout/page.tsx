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

const MEAT_LABELS: Record<string, string> = {
  turkey: 'Turkey',
  ham: 'Ham',
  beef: 'Beef',
  lamb: 'Lamb',
  chicken: 'Chicken',
}

export default function CheckoutPage() {
  const { order } = useOrder()
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const hasOrder = order.cart.length > 0 && !!order.customer.email

  useEffect(() => {
    if (!hasOrder || clientSecret) return

    async function createIntent() {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: order.cart, customer: order.customer }),
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">🥩</div>
        <h2 className="text-3xl font-black italic uppercase text-gray-900 dark:text-white mb-3">
          No Order Found
        </h2>
        <p className="text-gray-500 dark:text-white/40 font-bold text-sm uppercase tracking-widest mb-8">
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-gray-400 dark:text-white/40 font-black uppercase tracking-widest text-sm">
          Securing your order...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Back link */}
      <div className="px-6 md:px-12 py-3 border-b border-gray-200 dark:border-white/5">
        <Link
          href="/#order"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80 transition-colors"
        >
          <span>←</span> Back to Order
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 grid md:grid-cols-5 gap-10 md:gap-16">

        {/* Order summary */}
        <div className="md:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8B0000] dark:text-[#cc4444] mb-4">
            Order Summary
          </p>
          <h1
            className="font-black italic uppercase text-gray-900 dark:text-white leading-none mb-8"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Secure<br />Checkout.
          </h1>

          {/* Cart items */}
          <div className="space-y-3 mb-6">
            {order.cart.map((item, i) => (
              <div key={item.id} className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">
                    Item {i + 1}
                  </span>
                  {item.meatType && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#8B0000]">
                      {MEAT_LABELS[item.meatType] || item.meatType}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Cut', value: item.cut || '' },
                    {
                      label: 'Weight',
                      value: item.weight === 'custom'
                        ? `${item.customWeight || '—'}`
                        : item.weight
                        ? `${item.weight}kg`
                        : '—',
                    },
                    {
                      label: 'Pickup',
                      value: item.pickupDate
                        ? format(new Date(item.pickupDate), 'dd MMM yyyy')
                        : '—',
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">
                        {label}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Customer */}
          <div className="space-y-1 border-t border-gray-200 dark:border-white/5 pt-4 mb-4">
            {[
              { label: 'Customer', value: order.customer.name },
              { label: 'Email', value: order.customer.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white/30">
                  {label}
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white max-w-[60%] text-right truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-4 px-5 bg-[#8B0000]/10 border border-[#8B0000]/20 rounded-2xl">
            <span className="text-xs font-black uppercase tracking-[0.15em] text-[#8B0000] dark:text-[#cc4444]">
              Deposit Due Today
            </span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">€{ADVANCE_PRICE_EUR}</span>
          </div>
        </div>

        {/* Payment form */}
        <div className="md:col-span-3">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-white/30 mb-4">
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
