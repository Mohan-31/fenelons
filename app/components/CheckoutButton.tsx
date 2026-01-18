'use client'

import { useEffect, useState } from 'react'
import { useOrder } from '@/app/context/OrderContext'
import { useRouter } from 'next/navigation'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

export default function CheckoutButton() {
  const { order } = useOrder()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ⛔ Prevent hydration mismatch
  if (!mounted) return null

  // 1️⃣ Strict Validation Logic
  function isValid() {
    const { meat, customer } = order

    // Meat selection checks
    if (!meat.pickupDate) return false
    if (!meat.weight) return false
    if (meat.weight === 'custom' && !meat.customWeight) return false
    if (!meat.cut) return false

    // Customer details checks
    if (!customer.name || !customer.phone || !customer.email) return false

    return true
  }

  const valid = isValid()

  // 2️⃣ Handle Navigation
  function handleCheckout() {
    if (!valid) return
    router.push('/checkout')
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={!valid}
      className="
        w-full max-w-xl mx-auto mt-6
        bg-[#8B0000] text-white py-4
        rounded-2xl text-lg font-semibold
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-40 disabled:cursor-not-allowed
      "
    >
      {valid
        ? `Pay €${ADVANCE_PRICE_EUR} Advance`
        : 'Please Complete Order Details'}
    </button>
  )
}
