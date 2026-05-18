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
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-7 md:p-8">
      <PaymentElement className="mb-6" />

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full py-5 rounded-2xl bg-[#8B0000] text-white font-black uppercase tracking-widest text-sm hover:bg-[#a50000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          `Pay €${ADVANCE_PRICE_EUR} Deposit Now →`
        )}
      </button>

      <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        🔒 Secured by Stripe · Your card details are never stored
      </p>
    </form>
  )
}
