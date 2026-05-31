'use client'

import { useEffect, useState } from 'react'
import { useOrder } from '@/app/context/OrderContext'
import { useRouter } from 'next/navigation'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'
import { motion, AnimatePresence } from 'framer-motion'

const TERMS = [
  'Orders must be collected strictly on the selected pickup date.',
  'Remaining balance must be paid in-store on collection.',
  'Late collection may affect product quality.',
  'No refunds or replacements for late pickups.',
  'Orders cannot be processed earlier or later than booked.',
]

export default function CheckoutButton() {
  const { order } = useOrder()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  function isValid() {
    const { cart, customer } = order
    if (cart.length === 0) return false
    if (!customer.name || !customer.phone || !customer.email) return false
    return true
  }

  const valid = isValid()

  function handleClick() {
    if (!valid) return
    setAgreed(false)
    setShowTerms(true)
  }

  function handleConfirm() {
    if (!agreed) return
    setShowTerms(false)
    router.push('/checkout')
  }

  return (
    <>
      <button
        onClick={handleClick}
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

      <AnimatePresence>
        {showTerms && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowTerms(false) }}
          >
            <motion.div
              className="w-full sm:max-w-lg bg-white dark:bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl p-7 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="w-10 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />

              <h3 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">
                Order Terms
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-white/35 uppercase tracking-widest mt-1 mb-6">
                Please read before paying the deposit
              </p>

              <ul className="space-y-3">
                {TERMS.map((term, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-white/70 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {term}
                  </li>
                ))}
              </ul>

              <div
                className="mt-7 flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 cursor-pointer select-none"
                onClick={() => setAgreed(a => !a)}
              >
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    agreed ? 'border-[#8B0000] bg-[#8B0000]' : 'border-gray-300 dark:border-white/20'
                  }`}
                >
                  {agreed && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  I understand and agree to these terms
                </span>
              </div>

              <button
                disabled={!agreed}
                onClick={handleConfirm}
                className="mt-4 w-full py-4 rounded-2xl bg-[#8B0000] text-white font-black uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#a50000] transition-colors"
              >
                Agree &amp; Pay €{ADVANCE_PRICE_EUR} Deposit →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
