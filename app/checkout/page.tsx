'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useOrder } from '@/app/context/OrderContext'
import CheckoutForm from './CheckoutForm'
import Link from 'next/link'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutPage() {
  const { order } = useOrder()
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // 🟠 Optional Fix: Block checkout if order is incomplete
  if (!order.meat.pickupDate || !order.customer.email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">No active order found</h2>
        <p className="text-gray-600 mt-2 mb-6">Please select your items before proceeding to checkout.</p>
        <Link href="/#order" className="bg-[#8B0000] text-white px-6 py-3 rounded-xl font-semibold">
          Return to Shop
        </Link>
      </div>
    )
  }

  useEffect(() => {
    // 🟠 Optional Fix: Prevent duplicate PaymentIntent creation
    if (clientSecret) return

    async function createIntent() {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meat: order.meat,
            customer: order.customer,
          }),
        })

        const data = await res.json()
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        }
      } catch (err) {
        console.error("Initialization error:", err)
      }
    }

    createIntent()
  }, [order, clientSecret])

  if (!clientSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Securing your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-20 px-6">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#8B0000]">Secure Checkout</h1>
          <p className="text-gray-600 mt-2">Finalize your festive order deposit</p>
        </header>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  )
}