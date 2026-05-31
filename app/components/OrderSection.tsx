'use client'

import MeatCard from './MeatCard'
import CartSummary from './CartSummary'
import CustomerForm from './CustomerForm'
import CheckoutButton from './CheckoutButton'

export default function OrderSection() {
  return (
    <section id="order" className="bg-gray-50 dark:bg-[#0a0a0a] pb-32">

      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="inline-block px-3 py-1.5 bg-[#8B0000]/10 dark:bg-[#8B0000]/15 border border-[#8B0000]/20 rounded text-[#8B0000] dark:text-[#cc4444] text-[10px] font-black uppercase tracking-[0.25em] mb-5">
          Pre-Order 2026
        </div>
        <h2
          className="font-black italic uppercase text-gray-900 dark:text-white leading-none"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
        >
          Place Your <span className="text-[#8B0000]">Order.</span>
        </h2>
        <p className="text-gray-400 dark:text-white/30 font-bold uppercase text-[11px] tracking-[0.25em] mt-4">
          Select your meat · configure your order · secure with a €30 deposit
        </p>
      </div>

      {/* Meat cards */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-3">
        <MeatCard title="Turkey" description="Free-range Christmas turkeys" />
        <MeatCard title="Ham" description="Honey-glazed and traditional hams" />
        <MeatCard title="Other Meats" description="Custom festive cuts" />
      </div>

      {/* Cart Summary */}
      <CartSummary />

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 mb-4 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/20">
          Your Details
        </span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
      </div>

      {/* Customer form */}
      <div id="customer-form" className="max-w-7xl mx-auto px-6 md:px-12">
        <CustomerForm />
      </div>

      {/* Checkout button */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-4">
        <CheckoutButton />
      </div>
    </section>
  )
}
