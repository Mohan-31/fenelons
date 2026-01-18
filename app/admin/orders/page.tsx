'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/app/components/admin/Sidebar'
import { Bird, Disc, TrendingUp, ArrowRight, Package } from 'lucide-react'

export default function OrdersGateway() {
  const [summary, setSummary] = useState({ turkey: 0, ham: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        // Updated to matching API structure
        const res = await fetch('/api/admin/stats?type=summary') 
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        console.error("Failed to load summary", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  const turkeyPercentage = summary.total > 0 ? (summary.turkey / summary.total) * 100 : 0
  const hamPercentage = summary.total > 0 ? (summary.ham / summary.total) * 100 : 0

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* 1. SIDEBAR COMPONENT */}
      <Sidebar />
      
      {/* 2. MAIN CONTENT AREA
          Matches your working "Ham Gateway" layout logic
      */}
      <main className="
        flex-1
        transition-all 
        duration-300
        ml-0
        lg:ml-[var(--sidebar-width)]
      ">
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-8 md:space-y-12">
          
          {/* HEADER SECTION */}
          <header className="mb-8 md:mb-12 mt-12 lg:mt-0">
            <div className="inline-block px-2 py-1 bg-red-50 rounded text-[#8B0000] text-[10px] font-black uppercase tracking-widest mb-3">
              Production Central
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase text-gray-900 leading-none">
              Production <span className="text-[#8B0000]">Gateway</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em] mt-3">
              Christmas Order Distribution Hub
            </p>
          </header>

          {/* SUMMARY CHARTS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            
            {/* Split Card */}
            <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black uppercase text-sm text-gray-400 tracking-widest leading-none">Volume Split</h3>
                  <p className="text-[10px] font-bold text-gray-300 uppercase italic mt-1">Live Inventory Ratio</p>
                </div>
                <div className="p-3 bg-red-50 rounded-2xl">
                  <TrendingUp className="text-[#8B0000]" size={24} />
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Turkey Bar */}
                <div className="group">
                  <div className="flex justify-between mb-3 text-sm font-black uppercase tracking-tight">
                    <span className="flex items-center gap-2">
                      <Bird size={16} className="text-[#8B0000]" /> Turkeys
                    </span>
                    <span className="text-gray-900">{summary.turkey} Units</span>
                  </div>
                  <div className="w-full bg-gray-50 h-6 rounded-2xl overflow-hidden border p-1">
                    <div 
                      className="bg-[#8B0000] h-full rounded-xl transition-all duration-1000 ease-out shadow-lg" 
                      style={{ width: `${turkeyPercentage}%` }} 
                    />
                  </div>
                </div>

                {/* Ham Bar */}
                <div className="group">
                  <div className="flex justify-between mb-3 text-sm font-black uppercase tracking-tight">
                    <span className="flex items-center gap-2">
                      <Disc size={16} className="text-pink-600" /> Hams
                    </span>
                    <span className="text-gray-900">{summary.ham} Units</span>
                  </div>
                  <div className="w-full bg-gray-50 h-6 rounded-2xl overflow-hidden border p-1">
                    <div 
                      className="bg-pink-600 h-full rounded-xl transition-all duration-1000 ease-out shadow-lg" 
                      style={{ width: `${hamPercentage}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Card */}
            <div className="bg-[#121212] p-6 md:p-10 rounded-[32px] text-white flex flex-col justify-center items-center text-center relative overflow-hidden group">
              <p className="text-gray-500 font-black uppercase text-xs tracking-[0.2em] mb-4 relative z-10">Total Items Pending</p>
              <h2 className="text-7xl md:text-9xl font-black italic relative z-10 leading-none">{summary.total}</h2>
              <div className="mt-6 px-4 py-1 border border-gray-700 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest relative z-10">
                Live Server Data
              </div>
            </div>
          </div>

          {/* CTA NAV BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <Link href="/admin/orders/turkey" 
                  className="group bg-white p-8 md:p-12 rounded-[48px] border-2 border-transparent hover:border-[#8B0000] transition-all shadow-sm hover:shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="p-5 bg-red-50 rounded-[32px] group-hover:rotate-12 transition-transform duration-300">
                  <Bird className="text-[#8B0000]" size={40} />
                </div>
                <ArrowRight className="text-gray-200 group-hover:text-[#8B0000] group-hover:translate-x-2 transition-all" size={32} />
              </div>
              <div className="mt-8">
                <h2 className="text-3xl md:text-4xl font-black uppercase italic leading-none">Turkey<br/>Orders</h2>
                <p className="text-gray-400 font-bold mt-4 uppercase text-[10px] tracking-[0.2em]">Enter Production Floor →</p>
              </div>
            </Link>

            <Link href="/admin/orders/ham" 
                  className="group bg-white p-8 md:p-12 rounded-[48px] border-2 border-transparent hover:border-pink-600 transition-all shadow-sm hover:shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="p-5 bg-pink-50 rounded-[32px] group-hover:rotate-12 transition-transform duration-300">
                  <Disc className="text-pink-600" size={40} />
                </div>
                <ArrowRight className="text-gray-200 group-hover:text-pink-600 group-hover:translate-x-2 transition-all" size={32} />
              </div>
              <div className="mt-8">
                <h2 className="text-3xl md:text-4xl font-black uppercase italic leading-none">Ham<br/>Orders</h2>
                <p className="text-gray-400 font-bold mt-4 uppercase text-[10px] tracking-[0.2em]">Enter Production Floor →</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}