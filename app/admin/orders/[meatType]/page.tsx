'use client'

import { useState, useEffect, use, useMemo } from 'react'
import Sidebar from '@/app/components/admin/Sidebar'
import { 
  Search, X, CheckCircle2, Circle, 
  Calendar, AlertCircle, ArrowLeft, ChevronRight,
  Package, TrendingUp, Loader2
} from 'lucide-react'
import Link from 'next/link'

/**
 * PRODUCTION-SAFE ADMIN PAGE (Auth-free Version)
 */

interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'done';
  cut: string;
  weight: number;
  pickupDate: string;
  isNew: boolean;
  version: number;
}

interface Stat {
  cut: string;
  weight: number;
  _count: { _all: number };
}

interface ProductionSnapshot {
  stats: Stat[];
  orders: Order[];
}

export default function ProductionPage({ params }: { params: Promise<{ meatType: string }> }) {
  const { meatType } = use(params);
  
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [isBulkOperationInProgress, setIsBulkOperationInProgress] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // UI states
  const [isBulkMarkOpen, setIsBulkMarkOpen] = useState(false);
  const [bulkMarkCount, setBulkMarkCount] = useState('');
  
  // Data states
  const [stats, setStats] = useState<Stat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set(['pending']));
  const [cutFilters, setCutFilters] = useState<Set<string>>(new Set());
  const [weightFilters, setWeightFilters] = useState<Set<number>>(new Set());
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');

  const availableWeights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  /**
   * Initial data load
   */
  useEffect(() => {
    const loadProductionSnapshot = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/admin/production-snapshot?meatType=${meatType}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load production data`);
        }

        const snapshot: ProductionSnapshot = await response.json();
        setStats(Array.isArray(snapshot.stats) ? snapshot.stats : []);
        setOrders(Array.isArray(snapshot.orders) ? snapshot.orders : []);
        
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        setStats([]);
        setOrders([]);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadProductionSnapshot();
  }, [meatType]);

  /**
   * Single order status update
   */
  const handleMarkDone = async (order: Order) => {
    if (updatingOrderId || isBulkOperationInProgress) return;
    
    setUpdatingOrderId(order.id);
    
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'done',
          version: order.version 
        }) 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'version_conflict') {
          alert('This order was updated elsewhere. Refreshing...');
          window.location.reload();
          return;
        }
        throw new Error(errorData.error || 'Failed to update order');
      }

      const { order: updatedOrder } = await response.json();
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update order.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /**
   * Bulk status update
   */
  const handleBulkMarkDone = async () => {
    const count = parseInt(bulkMarkCount);
    if (isNaN(count) || count <= 0) return;

    const pendingOrders = filteredOrders
      .filter(o => o.status === 'pending')
      .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());
    
    const toMarkIds = pendingOrders.slice(0, count).map(o => o.id);
    if (toMarkIds.length === 0) return;

    setIsBulkOperationInProgress(true);
    
    try {
      const response = await fetch('/api/admin/orders/bulk-status', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          meatType,
          orderIds: toMarkIds,
          status: 'done'
        }) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk operation failed');
      }

      const result = await response.json();
      setOrders(result.orders);
      setBulkMarkCount('');
      setIsBulkMarkOpen(false);
      
    } catch (error) {
      alert('Bulk operation failed.\n\n' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsBulkOperationInProgress(false);
    }
  };

  const toggleStatusFilter = (status: string) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
  };

  const toggleCutFilter = (cut: string) => {
    const newFilters = new Set(cutFilters);
    if (newFilters.has(cut)) {
      newFilters.delete(cut);
    } else {
      newFilters.add(cut);
    }
    setCutFilters(newFilters);
  };

  const toggleWeightFilter = (weight: number) => {
    const newFilters = new Set(weightFilters);
    if (newFilters.has(weight)) {
      newFilters.delete(weight);
    } else {
      newFilters.add(weight);
    }
    setWeightFilters(newFilters);
  };

  const clearAllFilters = () => {
    setStatusFilters(new Set(['pending']));
    setCutFilters(new Set());
    setWeightFilters(new Set());
    setDateFilter('all');
    setCustomDate('');
    setSearch('');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const customerName = order.customerName || '';
      const orderId = order.id || '';
      const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) || 
                           orderId.toLowerCase().includes(search.toLowerCase());
      
      const orderStatus = order.status || 'pending';
      const matchesStatus = statusFilters.size === 0 || 
                            statusFilters.has(orderStatus) || 
                            (statusFilters.has('new') && order.isNew);
      
      const matchesCut = cutFilters.size === 0 || cutFilters.has(order.cut);
      const matchesWeight = weightFilters.size === 0 || weightFilters.has(order.weight);
      
      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date().toDateString();
        matchesDate = new Date(order.pickupDate).toDateString() === today;
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = new Date(order.pickupDate).toDateString() === tomorrow.toDateString();
      } else if (dateFilter === 'custom' && customDate) {
        matchesDate = new Date(order.pickupDate).toDateString() === new Date(customDate).toDateString();
      }
      
      return matchesSearch && matchesStatus && matchesCut && matchesWeight && matchesDate;
    });
  }, [orders, search, statusFilters, cutFilters, weightFilters, dateFilter, customDate]);

  const groupedStats = useMemo(() => {
    return stats.reduce((acc, stat) => {
      if (!acc[stat.cut]) acc[stat.cut] = [];
      acc[stat.cut].push(stat);
      return acc;
    }, {} as Record<string, Stat[]>);
  }, [stats]);

  const activeFilterCount = 
    ((statusFilters.size > 1 || (statusFilters.size === 1 && !statusFilters.has('pending'))) ? 1 : 0) +
    cutFilters.size +
    weightFilters.size +
    (dateFilter !== 'all' ? 1 : 0);

  const hasNoOrders = orders.length === 0;
  const hasNoFilteredOrders = filteredOrders.length === 0 && !hasNoOrders;

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa]">
      <Loader2 className="text-[#8B0000] animate-spin mb-4" size={48} />
      <p className="text-[#8B0000] font-black italic uppercase tracking-wider">Loading {meatType} Production...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] p-4">
      <AlertCircle className="text-red-600 mb-4" size={48} />
      <p className="text-gray-900 font-black uppercase text-center mb-2">Production Load Failed</p>
      <button onClick={() => window.location.reload()} className="bg-[#8B0000] text-white px-6 py-3 rounded-xl font-black uppercase text-xs">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ml-0 lg:ml-[var(--sidebar-width)]">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-4 pb-32">
          
          <div className="flex flex-col gap-3 mt-12 lg:mt-0">
            <Link href="/admin/orders" className="flex items-center gap-2 text-[#8B0000] font-black uppercase text-xs tracking-widest">
              <ArrowLeft size={16} /> Back to Gateway
            </Link>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                  {meatType}<span className="text-[#8B0000]">.</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Production Floor</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#8B0000]" />
              <h2 className="font-black uppercase text-xs tracking-widest text-gray-600">Production Queue</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {Object.entries(groupedStats).filter(([cut]) => cut !== 'custom').map(([cut, cutStats]) => (
                <button
                  key={cut}
                  onClick={() => toggleCutFilter(cut)}
                  disabled={isBulkOperationInProgress}
                  className={`bg-white border-2 rounded-2xl p-4 text-left transition-all ${cutFilters.has(cut) ? 'border-[#8B0000] shadow-lg' : 'border-gray-100'}`}
                >
                  <h3 className="font-black uppercase italic text-gray-900 text-sm mb-3 flex justify-between items-center">
                    {cut}
                    {cutFilters.has(cut) && <div className="w-2 h-2 bg-[#8B0000] rounded-full" />}
                  </h3>
                  <div className="space-y-2">
                    {cutStats.map(s => (
                      <div key={s.weight} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-black text-gray-600 text-sm">{s.weight}kg</span>
                        <span className="bg-[#8B0000] text-white px-2 py-1 rounded-md font-black text-xs">{s._count._all}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="sticky top-[60px] lg:top-0 z-40 bg-[#f8f9fa] py-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="SEARCH CUSTOMER OR ID..."
                className="w-full bg-white border-2 border-gray-900 rounded-2xl py-4 pl-12 pr-4 font-black uppercase text-sm tracking-wider"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <section className="sticky top-[124px] lg:top-[64px] z-30 bg-[#f8f9fa] pb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-600">Quick Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs font-black uppercase text-[#8B0000]">Clear All ({activeFilterCount})</button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {['pending', 'done', 'new'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-4 py-3 rounded-xl font-black uppercase text-xs tracking-wider ${statusFilters.has(status) ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border-2 border-gray-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableWeights.map(weight => (
                <button
                  key={weight}
                  onClick={() => toggleWeightFilter(weight)}
                  className={`px-4 py-3 rounded-xl font-black text-sm ${weightFilters.has(weight) ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border-2 border-gray-200'}`}
                >
                  {weight}kg
                </button>
              ))}
            </div>
          </section>

          {filteredOrders.filter(o => o.status === 'pending').length > 0 && (
            <div className="sticky top-[400px] lg:top-[340px] z-30 bg-gradient-to-r from-[#8B0000] to-red-700 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-black uppercase text-xs tracking-wider opacity-90">Bulk Mark Done</p>
                  <p className="text-white text-2xl font-black italic">{filteredOrders.filter(o => o.status === 'pending').length} <span className="text-sm opacity-70">Pending</span></p>
                </div>
                <button onClick={() => setIsBulkMarkOpen(true)} className="bg-white text-[#8B0000] px-6 py-4 rounded-xl font-black uppercase text-sm tracking-wider flex items-center gap-2">
                  Mark <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          <section className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className={`bg-white border-2 rounded-2xl p-4 transition-all ${order.status === 'done' ? 'opacity-40' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleMarkDone(order)}
                    disabled={updatingOrderId === order.id || order.status === 'done'}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${order.status === 'done' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                  >
                    {updatingOrderId === order.id ? <Loader2 className="animate-spin text-[#8B0000]" /> : order.status === 'done' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </button>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 uppercase text-lg">{order.customerName}</p>
                    <p className="text-xs font-bold text-[#8B0000]">#{order.id}</p>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <p className="font-black text-gray-900 uppercase text-sm">{order.cut}</p>
                      <p className="font-black text-gray-900 text-lg">{order.weight}kg</p>
                      <p className="font-black text-gray-900 uppercase text-xs">{new Date(order.pickupDate).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* BULK MARK MODAL */}
      {isBulkMarkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isBulkOperationInProgress && setIsBulkMarkOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6">
            <h2 className="text-2xl font-black uppercase italic mb-6">Bulk Mark Done</h2>
            <input
              type="number"
              value={bulkMarkCount}
              onChange={(e) => setBulkMarkCount(e.target.value)}
              placeholder="How many?"
              className="w-full border-2 border-gray-900 rounded-xl py-4 px-4 font-black text-2xl mb-4"
            />
            <button
              onClick={handleBulkMarkDone}
              disabled={isBulkOperationInProgress}
              className="w-full bg-[#8B0000] text-white py-5 rounded-xl font-black uppercase flex items-center justify-center gap-2"
            >
              {isBulkOperationInProgress ? <Loader2 className="animate-spin" /> : 'Confirm Bulk Mark'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}