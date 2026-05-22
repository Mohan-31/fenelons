'use client'

import { useState, useEffect, use, useMemo } from 'react'
import Sidebar from '@/app/components/admin/Sidebar'
import {
  Search, X, CheckCircle2, Circle,
  AlertCircle, ArrowLeft, ChevronRight,
  Package, Loader2, Filter, SlidersHorizontal
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  customerName: string
  status: 'pending' | 'done'
  cut: string
  weight: number
  pickupDate: string
  isNew: boolean
  version: number
}

interface Stat {
  cut: string
  weight: number
  _count: { _all: number }
}

interface ProductionSnapshot {
  stats: Stat[]
  orders: Order[]
}

const MEAT_CUTS: Record<string, string[]> = {
  turkey: ['Whole Turkey', 'Turkey Crown', 'Turkey Breast', 'Turkey Legs', 'Turkey Wings'],
  ham: ['Whole Fillet Ham', 'Shoulder Fillet Ham', 'Boneless Ham', 'Gammon Joint', 'Half Ham'],
  other: ['Whole Fillet Ham', 'Shoulder Fillet Ham', 'Boneless Ham', 'Gammon Joint', 'Half Ham'],
}

type StatusFilter = 'pending' | 'done' | 'all'
type DateFilter = 'all' | 'today' | 'tomorrow' | 'custom'

export default function ProductionPage({ params }: { params: Promise<{ meatType: string }> }) {
  const { meatType } = use(params)

  const [initialLoading, setInitialLoading] = useState(true)
  const [isBulkOperationInProgress, setIsBulkOperationInProgress] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [isBulkMarkOpen, setIsBulkMarkOpen] = useState(false)
  const [bulkMarkCount, setBulkMarkCount] = useState('')
  const [stats, setStats] = useState<Stat[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [cutFilters, setCutFilters] = useState<Set<string>>(new Set())
  const [weightFilters, setWeightFilters] = useState<Set<number>>(new Set())
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [customDate, setCustomDate] = useState('')

  const availableCuts = MEAT_CUTS[meatType.toLowerCase()] || []

  // Derive weights from actual orders
  const availableWeights = useMemo(() => {
    const ws = new Set<number>()
    orders.forEach(o => { if (o.weight > 0) ws.add(o.weight) })
    return Array.from(ws).sort((a, b) => a - b)
  }, [orders])

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const res = await fetch(`/api/admin/production-snapshot?meatType=${meatType}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const snap: ProductionSnapshot = await res.json()
        setStats(Array.isArray(snap.stats) ? snap.stats : [])
        setOrders(Array.isArray(snap.orders) ? snap.orders : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
        setStats([])
        setOrders([])
      } finally {
        setInitialLoading(false)
      }
    }
    load()
  }, [meatType])

  const handleMarkDone = async (order: Order) => {
    if (updatingOrderId || isBulkOperationInProgress) return
    setUpdatingOrderId(order.id)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done', version: order.version }),
      })
      if (!res.ok) throw new Error('Failed to update order')
      const { order: updated } = await res.json()
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleBulkMarkDone = async () => {
    const count = parseInt(bulkMarkCount)
    if (isNaN(count) || count <= 0) return
    const pending = filteredOrders
      .filter(o => o.status === 'pending')
      .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime())
    const ids = pending.slice(0, count).map(o => o.id)
    if (!ids.length) return
    setIsBulkOperationInProgress(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meatType, orderIds: ids, status: 'done' }),
      })
      if (!res.ok) throw new Error('Bulk operation failed')
      const result = await res.json()
      setOrders(result.orders)
      setBulkMarkCount('')
      setIsBulkMarkOpen(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk operation failed')
    } finally {
      setIsBulkOperationInProgress(false)
    }
  }

  const clearAllFilters = () => {
    setStatusFilter('pending')
    setCutFilters(new Set())
    setWeightFilters(new Set())
    setDateFilter('all')
    setCustomDate('')
    setSearch('')
  }

  const toggleCut = (cut: string) => {
    setCutFilters(prev => {
      const next = new Set(prev)
      next.has(cut) ? next.delete(cut) : next.add(cut)
      return next
    })
  }

  const toggleWeight = (w: number) => {
    setWeightFilters(prev => {
      const next = new Set(prev)
      next.has(w) ? next.delete(w) : next.add(w)
      return next
    })
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const term = search.toLowerCase()
      const matchSearch = !term ||
        (o.customerName || '').toLowerCase().includes(term) ||
        (o.id || '').toLowerCase().includes(term)

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && o.status === 'pending') ||
        (statusFilter === 'done' && o.status === 'done')

      const matchCut = cutFilters.size === 0 || cutFilters.has(o.cut)
      const matchWeight = weightFilters.size === 0 || weightFilters.has(o.weight)

      let matchDate = true
      if (dateFilter === 'today') {
        matchDate = new Date(o.pickupDate).toDateString() === new Date().toDateString()
      } else if (dateFilter === 'tomorrow') {
        const tom = new Date()
        tom.setDate(tom.getDate() + 1)
        matchDate = new Date(o.pickupDate).toDateString() === tom.toDateString()
      } else if (dateFilter === 'custom' && customDate) {
        matchDate = new Date(o.pickupDate).toDateString() === new Date(customDate).toDateString()
      }

      return matchSearch && matchStatus && matchCut && matchWeight && matchDate
    })
  }, [orders, search, statusFilter, cutFilters, weightFilters, dateFilter, customDate])

  const groupedStats = useMemo(() => {
    return stats.reduce((acc, s) => {
      if (!acc[s.cut]) acc[s.cut] = []
      acc[s.cut].push(s)
      return acc
    }, {} as Record<string, Stat[]>)
  }, [stats])

  const activeFilterCount =
    (statusFilter !== 'pending' ? 1 : 0) +
    cutFilters.size +
    weightFilters.size +
    (dateFilter !== 'all' ? 1 : 0)

  const pendingCount = filteredOrders.filter(o => o.status === 'pending').length

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa]">
      <Loader2 className="text-[#8B0000] animate-spin mb-4" size={48} />
      <p className="text-[#8B0000] font-black italic uppercase tracking-wider">
        Loading {meatType} Orders...
      </p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] p-4">
      <AlertCircle className="text-red-600 mb-4" size={48} />
      <p className="text-gray-900 font-black uppercase text-center mb-2">Load Failed</p>
      <p className="text-gray-500 text-sm mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-[#8B0000] text-white px-6 py-3 rounded-xl font-black uppercase text-xs"
      >
        Retry
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ml-0 lg:ml-[var(--sidebar-width)]">
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full pb-32 space-y-4">

          {/* Header */}
          <div className="flex flex-col gap-2 mt-14 lg:mt-0">
            <Link href="/admin/orders" className="flex items-center gap-1.5 text-[#8B0000] font-black uppercase text-xs tracking-widest w-fit">
              <ArrowLeft size={14} /> Back
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase text-gray-900 leading-none">
              {meatType}<span className="text-[#8B0000]">.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em]">Production Floor</p>
          </div>

          {/* Production Queue Stats */}
          {Object.keys(groupedStats).length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-[#8B0000]" />
                <h2 className="font-black uppercase text-[10px] tracking-widest text-gray-500">Production Queue</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {Object.entries(groupedStats).map(([cut, cutStats]) => (
                  <button
                    key={cut}
                    onClick={() => toggleCut(cut)}
                    className={`bg-white border-2 rounded-2xl p-4 text-left transition-all ${
                      cutFilters.has(cut) ? 'border-[#8B0000] shadow-md' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <h3 className="font-black uppercase italic text-gray-900 text-xs mb-2 flex justify-between items-center">
                      {cut}
                      {cutFilters.has(cut) && <span className="w-2 h-2 bg-[#8B0000] rounded-full" />}
                    </h3>
                    <div className="space-y-1.5">
                      {cutStats.map(s => (
                        <div key={s.weight} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded-lg">
                          <span className="font-bold text-gray-500 text-xs">{s.weight}kg</span>
                          <span className="bg-[#8B0000] text-white px-2 py-0.5 rounded font-black text-xs">{s._count._all}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Search + Filter Toggle */}
          <div className="sticky top-[60px] lg:top-0 z-40 bg-[#f8f9fa] pt-2 pb-1 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search customer name or order ID..."
                  className="w-full bg-white border-2 border-gray-200 focus:border-gray-900 outline-none rounded-2xl py-3.5 pl-11 pr-4 font-bold text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 font-black uppercase text-xs tracking-wider transition-all ${
                  filtersOpen || activeFilterCount > 0
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#8B0000] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {filtersOpen && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-4">
                {/* Row 1: Status + Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Status</p>
                    <div className="flex gap-2">
                      {(['pending', 'done', 'all'] as StatusFilter[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-wider flex-1 transition-all ${
                            statusFilter === s
                              ? s === 'done' ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Pickup Date</p>
                    <div className="flex flex-wrap gap-2">
                      {(['all', 'today', 'tomorrow'] as DateFilter[]).map(d => (
                        <button
                          key={d}
                          onClick={() => setDateFilter(d)}
                          className={`px-3 py-2 rounded-xl font-black uppercase text-xs tracking-wider transition-all ${
                            dateFilter === d ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                      <button
                        onClick={() => setDateFilter('custom')}
                        className={`px-3 py-2 rounded-xl font-black uppercase text-xs tracking-wider transition-all ${
                          dateFilter === 'custom' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {dateFilter === 'custom' && (
                      <input
                        type="date"
                        value={customDate}
                        onChange={e => setCustomDate(e.target.value)}
                        className="mt-2 px-3 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 focus:border-gray-900 outline-none w-full"
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Cut filter */}
                {availableCuts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Cut Type</p>
                    <div className="flex flex-wrap gap-2">
                      {availableCuts.map(cut => (
                        <button
                          key={cut}
                          onClick={() => toggleCut(cut)}
                          className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                            cutFilters.has(cut) ? 'bg-[#8B0000] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {cut}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 3: Weight filter (dynamic from data) */}
                {availableWeights.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Weight</p>
                    <div className="flex flex-wrap gap-2">
                      {availableWeights.map(w => (
                        <button
                          key={w}
                          onClick={() => toggleWeight(w)}
                          className={`px-3 py-2 rounded-xl font-black text-xs transition-all ${
                            weightFilters.has(w) ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {w}kg
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear */}
                {activeFilterCount > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <button onClick={clearAllFilters} className="text-xs font-black uppercase text-[#8B0000] hover:underline">
                      Clear All Filters ({activeFilterCount})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Showing</p>
                <p className="text-2xl font-black text-gray-900">{filteredOrders.length}</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Pending</p>
                <p className="text-2xl font-black text-[#8B0000]">{pendingCount}</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Done</p>
                <p className="text-2xl font-black text-green-600">{filteredOrders.filter(o => o.status === 'done').length}</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <button
                onClick={() => setIsBulkMarkOpen(true)}
                className="flex items-center gap-2 bg-[#8B0000] text-white px-4 py-2 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#a50000] transition-colors"
              >
                Bulk Done <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Orders List */}
          <section className="space-y-2">
            {orders.length === 0 && (
              <div className="text-center py-16">
                <Package size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 font-black uppercase text-sm">No {meatType} orders yet</p>
              </div>
            )}
            {orders.length > 0 && filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <Filter size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 font-black uppercase text-sm">No orders match your filters</p>
                <button onClick={clearAllFilters} className="mt-3 text-[#8B0000] font-black uppercase text-xs underline">
                  Clear Filters
                </button>
              </div>
            )}

            {filteredOrders.map(order => (
              <div
                key={order.id}
                className={`bg-white border-2 rounded-2xl p-4 transition-all ${
                  order.status === 'done'
                    ? 'border-gray-100 opacity-40'
                    : order.isNew
                    ? 'border-[#8B0000]/30'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMarkDone(order)}
                    disabled={updatingOrderId === order.id || order.status === 'done'}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      order.status === 'done'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                    }`}
                  >
                    {updatingOrderId === order.id
                      ? <Loader2 size={20} className="animate-spin text-[#8B0000]" />
                      : order.status === 'done'
                      ? <CheckCircle2 size={22} />
                      : <Circle size={22} />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-gray-900 uppercase">{order.customerName}</p>
                      {order.isNew && order.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-[#8B0000]/10 text-[#8B0000] text-[9px] font-black uppercase tracking-widest rounded">New</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 font-mono mt-0.5">#{order.id.slice(-8).toUpperCase()}</p>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div>
                        <p className="text-gray-400 font-black uppercase text-[9px] tracking-wider">Cut</p>
                        <p className="font-black text-gray-900 text-xs uppercase leading-tight">{order.cut}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-black uppercase text-[9px] tracking-wider">Weight</p>
                        <p className="font-black text-gray-900 text-base">{order.weight}kg</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-black uppercase text-[9px] tracking-wider">Pickup</p>
                        <p className="font-black text-gray-900 text-xs">{new Date(order.pickupDate).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* Bulk Mark Modal */}
      {isBulkMarkOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isBulkOperationInProgress && setIsBulkMarkOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => !isBulkOperationInProgress && setIsBulkMarkOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-black uppercase italic mb-1">Bulk Mark Done</h2>
            <p className="text-gray-400 font-bold text-xs mb-5">
              Marks the first N pending orders as done, sorted by pickup date.
            </p>
            <input
              type="number"
              value={bulkMarkCount}
              onChange={e => setBulkMarkCount(e.target.value)}
              placeholder={`Max ${pendingCount}`}
              className="w-full border-2 border-gray-200 focus:border-gray-900 outline-none rounded-2xl py-3 px-4 font-black text-2xl mb-4 transition-colors"
              min="1"
              max={pendingCount}
            />
            <button
              onClick={handleBulkMarkDone}
              disabled={isBulkOperationInProgress || !bulkMarkCount || parseInt(bulkMarkCount) <= 0}
              className="w-full bg-[#8B0000] text-white py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#a50000] transition-colors"
            >
              {isBulkOperationInProgress
                ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                : 'Confirm Bulk Mark Done'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
