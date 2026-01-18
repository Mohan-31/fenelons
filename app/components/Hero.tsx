'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#7a0000] via-[#8b0000] to-[#4a0d0d] text-white overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Christmas Meat <br />
            <span className="text-[#ffd6d6]">Done Right</span>
          </h1>

          <p className="mt-6 text-lg text-white/90 max-w-xl">
            Pre-order premium turkeys, hams and festive cuts from Fenelons.
            Skip the rush. Collect fresh.
          </p>

          <div className="mt-10 flex gap-4 flex-wrap">
            <a
              href="#order"
              className="px-8 py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 font-semibold hover:bg-white/30 transition"
            >
              Order Now
            </a>

            <a
              href="#about"
              className="px-8 py-4 rounded-2xl border border-white/40 font-semibold hover:bg-white/10 transition"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Visual card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="hidden md:block"
        >
          <div className="rounded-3xl bg-white/15 backdrop-blur-lg border border-white/20 p-10 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">🎄 Christmas Specials</h3>
            <ul className="space-y-3 text-white/90">
              <li>✔ Free-range Turkeys</li>
              <li>✔ Honey-glazed Hams</li>
              <li>✔ Custom cuts & weights</li>
              <li>✔ Advance booking</li>
            </ul>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
