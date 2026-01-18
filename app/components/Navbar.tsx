'use client'

import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#8B0000]">
          Fenelons
        </h1>

        <div className="hidden md:flex gap-6 font-medium">
          <a href="#order" className="hover:text-[#8B0000]">Order</a>
          <a href="#about" className="hover:text-[#8B0000]">About</a>
          <a href="#contact" className="hover:text-[#8B0000]">Contact</a>
        </div>
      </div>
    </motion.nav>
  )
}
