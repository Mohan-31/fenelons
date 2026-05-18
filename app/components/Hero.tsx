'use client'

import { motion } from 'framer-motion'

const STATS = [
  { num: '€30', label: 'Deposit to Secure' },
  { num: '100%', label: 'Free Range' },
  { num: '2', label: 'Meat Types' },
  { num: '1', label: 'Local Butcher' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col justify-center overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-0 right-0 w-175 h-175 bg-[#8B0000]/10 dark:bg-[#8B0000]/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-[#8B0000]/6 dark:bg-[#8B0000]/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-16 w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8B0000]/10 dark:bg-[#8B0000]/15 border border-[#8B0000]/25 dark:border-[#8B0000]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B0000] dark:text-[#cc4444]">
              Christmas 2025 · Pre-Orders Now Open
            </span>
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-black italic uppercase text-gray-900 dark:text-white leading-[0.88] tracking-tight"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 10.5rem)' }}
        >
          <span className="block">Christmas</span>
          <span className="block text-[#8B0000]">Meat.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-black italic uppercase text-gray-300 dark:text-white/20 tracking-[0.06em]"
          style={{ fontSize: 'clamp(1.5rem, 4.5vw, 4rem)' }}
        >
          Done Right.
        </motion.p>

        {/* Description + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <p className="text-gray-500 dark:text-white/35 font-bold text-sm leading-relaxed max-w-xs uppercase tracking-wider">
            Premium turkeys &amp; hams from Fenelons.<br />
            Skip the Christmas rush. Collect fresh.
          </p>
          <a
            href="#order"
            className="group flex items-center gap-3 px-8 py-4 bg-[#8B0000] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#a50000] transition-colors shrink-0 shadow-lg shadow-[#8B0000]/25"
          >
            Place Your Order
            <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14"
        >
          {/* Mobile: 2×2 bordered grid */}
          <div className="md:hidden inline-grid grid-cols-2 border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
            {STATS.map(({ num, label }, i) => (
              <div
                key={label}
                className={`px-8 py-5 ${
                  i % 2 === 0 ? 'border-r border-gray-200 dark:border-white/8' : ''
                } ${
                  i < 2 ? 'border-b border-gray-200 dark:border-white/8' : ''
                }`}
              >
                <span className="text-2xl font-black text-gray-900 dark:text-white block">{num}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/25 mt-1 block">{label}</span>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal row with dividers */}
          <div className="hidden md:flex items-start divide-x divide-gray-200 dark:divide-white/10">
            {STATS.map(({ num, label }) => (
              <div key={label} className="px-10 first:pl-0">
                <span className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white block leading-none">{num}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-white/30 mt-2 block">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
