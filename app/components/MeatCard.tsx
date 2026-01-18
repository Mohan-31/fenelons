'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dropdown } from './ui/Dropdown'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { useOrder } from '@/app/context/OrderContext'

type Props = {
  title: 'Turkey' | 'Ham' | 'Other Meats'
  description: string
}

const turkeyCuts = [
  'Whole Turkey',
  'Turkey Crown',
  'Turkey Breast',
  'Turkey Legs',
  'Turkey Wings',
]

const hamCuts = [
  'Whole Fillet Ham',
  'Shoulder Fillet Ham',
  'Boneless Ham',
  'Gammon Joint',
  'Half Ham',
]

const weightOptions: {
  value: number | 'custom'
  label: string
}[] = [
  { value: 3, label: '3kg - serves at least 6 people' },
  { value: 5, label: '5kg - serves at least 10 people' },
  { value: 7, label: '7kg - serves at least 14 people' },
  { value: 10, label: '10kg - serves at least 20 people' },
  { value: 'custom', label: 'Custom weight' },
]

export default function MeatCard({ title, description }: Props) {
  // Use context hook to access global meat state
  const { order, updateMeat } = useOrder()

  // UI Local States
  const [open, setOpen] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const isTurkey = title === 'Turkey'
  const cuts = isTurkey ? turkeyCuts : hamCuts

  // Calculate weight for display and serving logic
  const finalWeight =
    order.meat.weight === 'custom'
      ? Number(order.meat.customWeight)
      : Number(order.meat.weight)

  const serves =
    finalWeight && finalWeight >= 3
      ? Math.floor((finalWeight * 1000) / (isTurkey ? 500 : 300))
      : null

  // Validation logic
  const isValid =
    order.meat.pickupDate &&
    finalWeight &&
    finalWeight >= 3 &&
    order.meat.cut &&
    agreed

  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur-md border shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 flex justify-between items-center"
      >
        <div>
          <h3 className="text-xl font-semibold text-[#8B0000]">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <span className="text-2xl font-bold text-[#8B0000]">
          {open ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-5 pb-6"
          >
            <div className="grid gap-5 mt-4 max-w-xl lg:max-w-none">
              
              {/* Pickup Date Section */}
              <div>
                <label className="text-sm font-medium text-[#8B0000]">
                  Pickup Date
                </label>

                {/* Date Display */}
                <div className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black">
                  {order.meat.pickupDate
                    ? format(new Date(order.meat.pickupDate), 'dd MMM yyyy')
                    : 'Select a pickup date'}
                </div>

                {/* Calendar Picker */}
                <div className="mt-3 mx-auto rounded-3xl bg-white/70 backdrop-blur-xl border shadow-lg p-4 max-w-md lg:max-w-sm">
                  <DayPicker
                    mode="single"
                    selected={
                      order.meat.pickupDate
                        ? new Date(order.meat.pickupDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      updateMeat({
                        pickupDate: date ? date.toISOString() : '',
                      })
                    }
                    className="text-[#1f1f1f]"
                  />
                </div>
              </div>

              {/* Weight Selection */}
              <Dropdown
                label="Select Weight"
                value={
                  order.meat.weight === 'custom'
                    ? 'Custom weight'
                    : order.meat.weight
                    ? `${order.meat.weight}kg`
                    : ''
                }
                options={weightOptions.map((w) => w.label)}
                onChange={(label) => {
                  const selected = weightOptions.find((w) => w.label === label)
                  if (!selected) return

                  if (selected.value === 'custom') {
                    updateMeat({ weight: 'custom', customWeight: '' })
                  } else {
                    updateMeat({ weight: selected.value, customWeight: '' })
                  }
                }}
              />

              {/* Custom Weight Input */}
              {order.meat.weight === 'custom' && (
                <input
                  type="number"
                  min={3}
                  step={0.5}
                  placeholder="Enter custom weight (kg)"
                  value={order.meat.customWeight}
                  onChange={(e) =>
                    updateMeat({ customWeight: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-black"
                />
              )}

              {serves && (
                <p className="text-sm text-[#2a2a2a]">
                  This will comfortably serve at least <strong>{serves}</strong> people
                </p>
              )}

              {/* Cut Selection */}
              <Dropdown
                label="Cut / Part Required"
                value={order.meat.cut || ''}
                options={cuts}
                onChange={(value) => updateMeat({ cut: value })}
              />

              {/* Additional Notes */}
              <textarea
                placeholder="Additional notes (optional)"
                value={order.meat.notes || ''}
                onChange={(e) => updateMeat({ notes: e.target.value })}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-black resize-none h-24"
              />

              {/* Terms Link */}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-sm text-blue-600 underline text-left w-fit"
              >
                Read before making payment
              </button>

              {/* Submit Button */}
              <button
                disabled={!isValid}
                className="mt-4 rounded-2xl py-4 font-semibold bg-[#8B0000] text-white disabled:opacity-40 transition-opacity"
              >
                Proceed to Advance Payment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl mx-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <h3 className="text-lg font-semibold text-black">
                Order Terms & Conditions
              </h3>

              <ul className="mt-4 space-y-2 text-sm text-black/80">
                <li>• Orders must be collected strictly on the selected pickup date.</li>
                <li>• Remaining balance must be paid in-store.</li>
                <li>• Late collection may affect quality.</li>
                <li>• No refunds or replacements for late pickups.</li>
                <li>• Orders cannot be processed earlier or later.</li>
              </ul>

              <div className="mt-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)} // Fixed toggle logic
                  className="cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="text-sm text-black cursor-pointer">
                  I understand and agree
                </label>
              </div>

              <button
                disabled={!agreed}
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full rounded-xl bg-[#8B0000] py-3 text-white disabled:opacity-40"
              >
                Confirm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}