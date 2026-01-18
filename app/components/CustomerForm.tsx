'use client'

import { useOrder } from '@/app/context/OrderContext'

export default function CustomerForm() {
  const { order, updateCustomer } = useOrder()

  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur-md border shadow-sm p-6 max-w-xl mx-auto">
      <h3 className="text-xl font-semibold text-[#8B0000] mb-4">
        Customer Details
      </h3>

      {/* Name */}
      <input
        type="text"
        placeholder="Full Name"
        value={order.customer.name}
        onChange={(e) => updateCustomer({ name: e.target.value })}
        className="w-full mb-4 rounded-xl border border-black/10 px-4 py-3 text-black"
      />

      {/* Phone */}
      <input
        type="tel"
        placeholder="Phone Number"
        value={order.customer.phone}
        onChange={(e) => updateCustomer({ phone: e.target.value })}
        className="w-full mb-4 rounded-xl border border-black/10 px-4 py-3 text-black"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email Address"
        value={order.customer.email}
        onChange={(e) => updateCustomer({ email: e.target.value })}
        className="w-full rounded-xl border border-black/10 px-4 py-3 text-black"
      />
    </div>
  )
}
