'use client'

import { useOrder } from '@/app/context/OrderContext'

const fields = [
  { key: 'name',  label: 'Full Name',     type: 'text',  placeholder: 'John Smith' },
  { key: 'phone', label: 'Phone Number',  type: 'tel',   placeholder: '+353 87 000 0000' },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
]

export default function CustomerForm() {
  const { order, updateCustomer } = useOrder()

  return (
    <div className="rounded-3xl bg-gray-100 dark:bg-white/4 border border-gray-200 dark:border-white/10 p-6 md:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8B0000] dark:text-[#cc4444] mb-1">
          Step 2 of 2
        </p>
        <h3
          className="font-black italic uppercase text-gray-900 dark:text-white leading-none"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}
        >
          Your Details.
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 mb-2">
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={order.customer[key as keyof typeof order.customer]}
              onChange={(e) => updateCustomer({ [key]: e.target.value })}
              className="w-full rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-4 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-white/15 focus:border-[#8B0000] outline-none transition-all text-sm"
            />
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs font-bold text-gray-400 dark:text-white/30 text-center">
        Please read our{' '}
        <span className="text-[#8B0000] dark:text-[#cc4444]">Terms &amp; Conditions</span>
        {' '}before paying the deposit. You will be prompted to agree when you click the button below.
      </p>
    </div>
  )
}
