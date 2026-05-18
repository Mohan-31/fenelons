'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'

export default function Navbar() {
  const { theme, toggle } = useTheme()

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-black italic uppercase tracking-wide text-gray-900 dark:text-white">
          Fenelons<span className="text-[#8B0000]">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#order" className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold uppercase text-[11px] tracking-[0.2em] transition-colors">Order</a>
          <a href="#about" className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white font-bold uppercase text-[11px] tracking-[0.2em] transition-colors">About</a>
          <a href="#order" className="px-5 py-2.5 bg-[#8B0000] text-white rounded-xl font-black uppercase text-[11px] tracking-[0.15em] hover:bg-[#a30000] transition-colors">
            Order Now
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/12 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a href="#order" className="md:hidden px-4 py-2 bg-[#8B0000] text-white rounded-lg font-black uppercase text-[10px] tracking-widest">
            Order
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
