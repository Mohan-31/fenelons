'use client'

import { useEffect, useState } from 'react'
import { useOrder } from '@/app/context/OrderContext'
import { useRouter } from 'next/navigation'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

export default function CheckoutButton() {
  const { order } = useOrder()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  function isValid() {
    const { cart, customer } = order
    if (cart.length === 0) return false
    if (!customer.name || !customer.phone || !customer.email) return false
    return true
  }

  const valid = isValid()

  return (
    <button
      onClick={() => valid && router.push('/checkout')}
      disabled={!valid}
      className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed flex items-center justify-center gap-2.5 bg-[#8B0000] text-white disabled:opacity-25 hover:bg-[#a50000] shadow-lg shadow-[#8B0000]/20"
    >
      {valid ? (
        <>
          Pay €{ADVANCE_PRICE_EUR} Deposit · Secure Booking
          <span>→</span>
        </>
      ) : (
        order.cart.length === 0
          ? 'Add Items to Cart Above'
          : 'Complete Your Details Above'
      )}
    </button>
  )
}
