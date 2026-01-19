'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/app/components/admin/Sidebar'
import { TrendingUp, Users, ShoppingCart, Euro } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for graphs (Replace with real data from stats API if available)
  const chartData = [
    { name: 'Mon', sales: 400, orders: 12 },
    { name: 'Tue', sales: 300, orders: 8 },
    { name: 'Wed', sales: 900, orders: 25 },
    { name: 'Thu', sales: 600, orders: 18 },
    { name: 'Fri', sales: 1200, orders: 32 },
    { name: 'Sat', sales: 1500, orders: 40 },
    { name: 'Sun', sales: 1100, orders: 28 },
  ]

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f8f9fa] text-[#8B0000] font-black uppercase tracking-wider italic text-xl">
      LOADING FENELONS DATA...
    </div>
  )

  const cards = [
    { title: 'Total Deposits', value: `€${stats?.monthly?.deposits || 0}`, period: 'This Month', icon: Euro, color: 'text-green-600' },
    { title: 'Today\'s Deposits', value: `€${stats?.today?.deposits || 0}`, period: 'Today', icon: TrendingUp, color: 'text-blue-600' },
    { title: 'Orders Today', value: stats?.today?.count || 0, period: 'New', icon: ShoppingCart, color: 'text-[#8B0000]' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, period: 'Lifetime', icon: Users, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      
      <main
        className="
            p-4 md:p-8 pt-6
            transition-all duration-300
            ml-0
            lg:ml-[var(--sidebar-width)]
        "
        >
        <header className="mb-10 mt-4 lg:mt-0">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic">Analytics<span className="text-[#8B0000]">.</span></h1>
          <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Real-time store performance</p>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {cards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-[32px] border-2 border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gray-50 ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                  {card.period}
                </span>
              </div>
              <h3 className="text-gray-400 text-xs font-black uppercase tracking-wider mb-2">{card.title}</h3>
              <p className="text-3xl font-black text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* GRAPHS SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-6 uppercase italic">Revenue Trend (€)</h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B0000" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fontWeight: 900, fill: '#6b7280'}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fontWeight: 900, fill: '#6b7280'}}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #f3f4f6',
                      borderRadius: '16px',
                      fontWeight: 900,
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8B0000" 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    strokeWidth={3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-8 uppercase italic">Performance Comparison</h3>
            <div className="grid grid-cols-1 gap-6">
              <ComparisonBlock label="Today" amount={stats?.today?.deposits} count={stats?.today?.count} />
              <ComparisonBlock label="Weekly" amount={stats?.weekly?.deposits} count={stats?.weekly?.count} highlight />
              <ComparisonBlock label="Monthly" amount={stats?.monthly?.deposits} count={stats?.monthly?.count} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ComparisonBlock({ label, amount, count, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-3xl transition-all ${highlight ? 'bg-[#8B0000] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <p className={`text-xs font-black uppercase tracking-widest mb-2 ${highlight ? 'text-white/70' : 'text-gray-400'}`}>
        {label}
      </p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-3xl font-black">€{amount || 0}</p>
          <p className={`text-sm font-bold uppercase tracking-wider ${highlight ? 'text-white/80' : 'text-gray-500'}`}>
            {count || 0} Orders
          </p>
        </div>
        {highlight && <div className="bg-white/20 p-2 rounded-xl text-white"><TrendingUp size={20} /></div>}
      </div>
    </div>
  )
}