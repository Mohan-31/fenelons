'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  label?: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function Dropdown({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-[#8B0000] mb-2">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full rounded-2xl border border-black/10
          bg-white/90 backdrop-blur-md
          px-4 py-3 text-left
          text-[#1f1f1f]
          flex justify-between items-center
          focus:outline-none focus:ring-2 focus:ring-[#8B0000]/30
        "
      >
        <span
          className={
            value
              ? 'text-[#1f1f1f]'
              : 'text-[#6b6b6b]'
          }
        >
          {value || 'Select an option'}
        </span>
        <span className="text-[#4a4a4a]">▾</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="
              absolute z-20 mt-2 w-full
              rounded-2xl border border-black/10
              bg-white/95 backdrop-blur-xl
              shadow-xl overflow-hidden
            "
          >
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className="
                    w-full px-4 py-3 text-left
                    text-[#1f1f1f]
                    hover:bg-black/5
                    transition-colors
                  "
                >
                  {option}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
