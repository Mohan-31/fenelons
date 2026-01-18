'use client'

import MeatCard from './MeatCard'
import CustomerForm from './CustomerForm'
import CheckoutButton from './CheckoutButton'

export default function OrderSection() {
  return (
    <section id="order" className="py-24 bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#8B0000]">
          Place Your Order
        </h2>

        {/* Meat Selection Grid */}
        <div className="grid gap-6">
          <MeatCard
            title="Turkey"
            description="Free-range Christmas turkeys"
          />

          <MeatCard
            title="Ham"
            description="Honey-glazed and traditional hams"
          />

          <MeatCard
            title="Other Meats"
            description="Custom festive cuts"
          />
        </div>

        {/* Customer Details Form */}
        <div className="mt-12">
          <CustomerForm />
        </div> 

        {/* Checkout Button */}
        <div className="mt-8 text-center">
          <CheckoutButton />
        </div>
        
      </div>
    </section>
  )
}