'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { X, ShoppingCart } from 'lucide-react'
import { useOrder } from '@/app/context/OrderContext'

const MEAT_LABELS: Record<string, string> = {
  turkey: 'Turkey',
  ham: 'Ham',
  beef: 'Beef',
  lamb: 'Lamb',
  chicken: 'Chicken',
}

const MEAT_COLORS: Record<string, string> = {
  turkey: 'bg-red-100 text-red-700',
  ham: 'bg-orange-100 text-orange-700',
  beef: 'bg-red-100 text-red-700',
  lamb: 'bg-purple-100 text-purple-700',
  chicken: 'bg-amber-100 text-amber-700',
}

export default function CartSummary() {
  const { order, removeFromCart } = useOrder()
  const { cart } = order

  if (cart.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-white/4 border-2 border-[#8B0000]/25 dark:border-[#8B0000]/20 p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#8B0000]/10 flex items-center justify-center">
            <ShoppingCart size={18} className="text-[#8B0000]" />
          </div>
          <div>
            <p className="font-black uppercase italic text-gray-900 dark:text-white text-xl leading-none">
              Your Cart
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 mt-0.5">
              {cart.length} item{cart.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/8 rounded-2xl px-4 py-3"
              >
                {item.meatType && (
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      MEAT_COLORS[item.meatType] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {MEAT_LABELS[item.meatType] || item.meatType}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 dark:text-white text-sm uppercase truncate">
                    {item.cut}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-white/30">
                    {item.weight === 'custom'
                      ? item.customWeight || '—'
                      : item.weight
                      ? `${item.weight}kg`
                      : '—'}
                    {' · '}
                    {item.pickupDate
                      ? format(new Date(item.pickupDate), 'dd MMM yyyy')
                      : '—'}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/8 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  aria-label="Remove item"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Continue CTA */}
        <button
          onClick={() =>
            document.getElementById('customer-form')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="mt-6 w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-sm hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
        >
          Continue to Your Details ↓
        </button>
      </motion.div>
    </div>
  )
}
