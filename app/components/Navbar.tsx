'use client'

import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-black italic uppercase tracking-wide text-white">
          Fenelons<span className="text-[#8B0000]">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#order" className="text-white/50 hover:text-white font-bold uppercase text-[11px] tracking-[0.2em] transition-colors">Order</a>
          <a href="/about" className="text-white/50 hover:text-white font-bold uppercase text-[11px] tracking-[0.2em] transition-colors">About</a>
          <a href="#order" className="px-5 py-2.5 bg-[#8B0000] text-white rounded-xl font-black uppercase text-[11px] tracking-[0.15em] hover:bg-[#a30000] transition-colors">
            Order Now
          </a>
        </div>

        <a href="#order" className="md:hidden px-4 py-2 bg-[#8B0000] text-white rounded-lg font-black uppercase text-[10px] tracking-widest">
          Order
        </a>
      </div>
    </motion.nav>
  )
}
