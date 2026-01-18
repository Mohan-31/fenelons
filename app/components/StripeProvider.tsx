'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ReactNode } from 'react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function StripeProvider({
  clientSecret,
  children,
}: {
  clientSecret: string
  children: ReactNode
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      {children}
    </Elements>
  )
}
