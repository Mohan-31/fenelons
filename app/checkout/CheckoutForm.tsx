'use client'

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
      <PaymentElement className="mb-6" />

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full rounded-2xl bg-[#8B0000] py-4 text-white font-bold text-lg shadow-lg hover:bg-[#a30000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Processing...
          </span>
        ) : (
          `Pay €${ADVANCE_PRICE_EUR} Deposit Now`
        )}
      </button>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 grayscale opacity-60">
        {/* Placeholder for small card brand icons if desired */}
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Protected by Stripe</p>
      </div>
    </form>
  )
}