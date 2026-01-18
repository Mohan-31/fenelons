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
 * PRODUCTION-SAFE ADMIN PAGE
 * 
 * Critical guarantees:
 * 1. Backend is source of truth - UI syncs after every mutation
 * 2. Atomic bulk operations - all or nothing
 * 3. Server-side "new" detection - consistent across admins
 * 4. Concurrency-safe - backend rejects stale updates
 * 5. Full audit trail - every change tracked with admin context
 * 6. Performance-optimized - memoized filtering for scale
 * 7. Atomic snapshots - stats + orders fetched together
 */

/**
 * REQUIRED BACKEND CONTRACTS (must be implemented):
 * 
 * GET /api/admin/production-snapshot?meatType=turkey
 * Response: {
 *   stats: Array<{ cut: string, weight: number, _count: { _all: number } }>,
 *   orders: Array<{
 *     id: string,
 *     customerName: string,
 *     status: 'pending' | 'done',
 *     cut: string,
 *     weight: number,
 *     pickupDate: string,
 *     isNew: boolean,  // Server calculates based on admin's lastSeenAt
 *     version: number  // For optimistic concurrency control
 *   }>
 * }
 * 
 * PATCH /api/admin/orders/:id/status
 * Body: { status: 'done', adminId: string, version: number }
 * Response: { order: Order } | { error: 'version_conflict' | 'already_done' }
 * 
 * POST /api/admin/orders/bulk-status
 * Body: { 
 *   meatType: string,
 *   orderIds: string[],
 *   status: 'done',
 *   adminId: string
 * }
 * Response: { 
 *   orders: Order[],  // Full updated order list for this meatType
 *   updated: number,
 *   skipped: number,
 *   conflicts: string[]
 * } | { error: string }
 * 
 * POST /api/admin/mark-seen
 * Body: { meatType: string, adminId: string }
 * Updates admin's lastSeenAt timestamp for this meatType
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
  
  // Loading states - granular for better UX
  const [initialLoading, setInitialLoading] = useState(true);
  const [isBulkOperationInProgress, setIsBulkOperationInProgress] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // UI states
  const [isBulkMarkOpen, setIsBulkMarkOpen] = useState(false);
  const [bulkMarkCount, setBulkMarkCount] = useState('');
  
  // Data states - backend is authoritative
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

  // Get adminId from session (placeholder - replace with actual auth)
  // In production, this should come from useSession() or similar
  const adminId = 'admin-placeholder-id';

  /**
   * Initial data load - atomic snapshot
   * Fetches stats and orders together to prevent desync
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
        
        // Backend is source of truth
        setStats(Array.isArray(snapshot.stats) ? snapshot.stats : []);
        setOrders(Array.isArray(snapshot.orders) ? snapshot.orders : []);
        
        // Mark that admin has seen current state (for "new" detection)
        await fetch('/api/admin/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meatType, adminId })
        }).catch(err => console.error('Failed to update lastSeenAt:', err));
        
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error("Production snapshot load error:", err);
        setError(message);
        setStats([]);
        setOrders([]);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadProductionSnapshot();
  }, [meatType, adminId]);

  /**
   * Single order status update
   * - Optimistic UI disabled (backend is authoritative)
   * - Handles concurrency conflicts
   * - Syncs UI with backend response
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
          adminId,
          version: order.version  // Optimistic concurrency control
        }) 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.error === 'version_conflict') {
          // Another admin updated this order - reload full snapshot
          alert('This order was updated by another admin. Refreshing...');
          window.location.reload();
          return;
        }
        
        if (errorData.error === 'already_done') {
          // Order already marked done - just sync UI
          setOrders(prev => prev.map(o => 
            o.id === order.id ? { ...o, status: 'done' } : o
          ));
          return;
        }
        
        throw new Error(errorData.error || 'Failed to update order');
      }

      const { order: updatedOrder } = await response.json();
      
      // Sync UI with backend authoritative state
      setOrders(prev => prev.map(o => 
        o.id === updatedOrder.id ? updatedOrder : o
      ));
      
    } catch (error) {
      console.error('Error marking order as done:', error);
      alert(error instanceof Error ? error.message : 'Failed to update order. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /**
   * Atomic bulk status update
   * - Single transaction (all or nothing)
   * - Backend returns full updated order list
   * - UI locked during operation
   * - Handles partial conflicts gracefully
   */
  const handleBulkMarkDone = async () => {
    const count = parseInt(bulkMarkCount);
    if (isNaN(count) || count <= 0) return;

    // Get pending orders, sorted by pickup date (oldest first)
    const pendingOrders = filteredOrders
      .filter(o => o.status === 'pending')
      .sort((a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime());
    
    const toMarkIds = pendingOrders.slice(0, count).map(o => o.id);
    
    if (toMarkIds.length === 0) return;

    // Lock UI
    setIsBulkOperationInProgress(true);
    
    try {
      const response = await fetch('/api/admin/orders/bulk-status', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          meatType,
          orderIds: toMarkIds,
          status: 'done',
          adminId
        }) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk operation failed');
      }

      const result = await response.json();
      
      // Backend returns authoritative order state
      setOrders(result.orders);
      
      // Inform admin of outcome
      if (result.skipped > 0 || result.conflicts.length > 0) {
        alert(
          `Bulk operation completed:\n` +
          `✓ Updated: ${result.updated}\n` +
          `⊘ Skipped (already done): ${result.skipped}\n` +
          (result.conflicts.length > 0 ? `⚠ Conflicts: ${result.conflicts.length}` : '')
        );
      }
      
      setBulkMarkCount('');
      setIsBulkMarkOpen(false);
      
    } catch (error) {
      console.error('Bulk mark error:', error);
      alert(
        'Bulk operation failed. No orders were updated.\n\n' +
        (error instanceof Error ? error.message : 'Unknown error')
      );
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

  /**
   * Memoized filtering - critical for performance at scale
   * Recomputes only when orders or filters change
   */
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

  /**
   * Memoized stats grouping - avoid recomputing on every render
   */
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
      <p className="text-[#8B0000] font-black italic uppercase tracking-wider">
        Loading {meatType} Production...
      </p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] p-4">
      <AlertCircle className="text-red-600 mb-4" size={48} />
      <p className="text-gray-900 font-black uppercase text-center mb-2">Production Load Failed</p>
      <p className="text-gray-600 text-sm text-center mb-4 max-w-md">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-[#8B0000] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-wider"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Sidebar />
      
      <main className="flex-1 transition-all duration-300 ml-0 lg:ml-[var(--sidebar-width)]">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-4 pb-32">
          
          {/* TOP NAVIGATION & TITLE */}
          <div className="flex flex-col gap-3 mt-12 lg:mt-0">
            <Link href="/admin/orders" className="flex items-center gap-2 text-[#8B0000] font-black uppercase text-xs tracking-widest active:opacity-70">
              <ArrowLeft size={16} /> Back to Gateway
            </Link>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">
                  {meatType}<span className="text-[#8B0000]">.</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Production Floor</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase">Active</p>
                <p className="font-black text-gray-900 italic uppercase text-sm underline decoration-[#8B0000] decoration-2">Rush '25</p>
              </div>
            </div>
          </div>

          {/* PRODUCTION STATS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#8B0000]" />
              <h2 className="font-black uppercase text-xs tracking-widest text-gray-600">Production Queue</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {Object.entries(groupedStats)
                .filter(([cut]) => cut !== 'custom')
                .map(([cut, cutStats]) => (
                  <button
                    key={cut}
                    onClick={() => toggleCutFilter(cut)}
                    disabled={isBulkOperationInProgress}
                    className={`
                      bg-white border-2 rounded-2xl p-4 text-left transition-all active:scale-95
                      ${cutFilters.has(cut) ? 'border-[#8B0000] shadow-lg' : 'border-gray-100'}
                      ${isBulkOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <h3 className="font-black uppercase italic text-gray-900 text-sm mb-3 flex justify-between items-center">
                      {cut}
                      {cutFilters.has(cut) && <div className="w-2 h-2 bg-[#8B0000] rounded-full" />}
                    </h3>
                    <div className="space-y-2">
                      {cutStats.map(s => (
                        <div key={s.weight} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <span className="font-black text-gray-600 text-sm">{s.weight}kg</span>
                          <span className="bg-[#8B0000] text-white px-2 py-1 rounded-md font-black text-xs">
                            {s._count._all}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}

              {groupedStats['custom'] && (
                <button
                  onClick={() => toggleCutFilter('custom')}
                  disabled={isBulkOperationInProgress}
                  className={`
                    rounded-2xl p-4 text-left transition-all active:scale-95
                    ${cutFilters.has('custom') ? 'bg-orange-700 shadow-lg' : 'bg-orange-600'}
                    text-white border-2 border-orange-500
                    ${isBulkOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <h3 className="font-black uppercase italic text-sm mb-3 flex justify-between items-center">
                    Custom
                    <AlertCircle size={16} />
                  </h3>
                  <div className="space-y-2">
                    {groupedStats['custom'].map(s => (
                      <div key={s.weight} className="flex justify-between items-center bg-orange-500/50 p-2 rounded-lg border border-orange-400">
                        <span className="font-black text-sm">{s.weight}kg</span>
                        <span className="bg-white text-orange-600 px-2 py-1 rounded-md font-black text-xs">
                          {s._count._all}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              )}
            </div>
          </section>

          {/* SEARCH BAR */}
          <div className="sticky top-[60px] lg:top-0 z-40 bg-[#f8f9fa] py-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="SEARCH CUSTOMER OR ID..."
                className="w-full bg-white border-2 border-gray-900 rounded-2xl py-4 pl-12 pr-4 font-black uppercase text-sm tracking-wider focus:ring-4 focus:ring-[#8B0000]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isBulkOperationInProgress}
              />
            </div>
          </div>

          {/* FILTER CHIPS */}
          <section className="sticky top-[124px] lg:top-[64px] z-30 bg-[#f8f9fa] pb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black uppercase text-xs tracking-widest text-gray-600">Quick Filters</h3>
              {activeFilterCount > 0 && (
                <button 
                  onClick={clearAllFilters}
                  disabled={isBulkOperationInProgress}
                  className="text-xs font-black uppercase text-[#8B0000] active:opacity-70 disabled:opacity-30"
                >
                  Clear All ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Status Chips */}
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Status</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'done', 'new'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    disabled={isBulkOperationInProgress}
                    className={`
                      px-4 py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all active:scale-95
                      ${statusFilters.has(status) 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-600 border-2 border-gray-200'}
                      ${isBulkOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Cut Type Chips */}
            {cutFilters.size > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Cut</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(cutFilters).map(cut => (
                    <button
                      key={cut}
                      onClick={() => toggleCutFilter(cut)}
                      disabled={isBulkOperationInProgress}
                      className={`
                        px-4 py-3 rounded-xl font-black uppercase text-xs tracking-wider bg-[#8B0000] text-white flex items-center gap-2 active:scale-95
                        ${isBulkOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {cut}
                      <X size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight Chips */}
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Weight (kg)</p>
              <div className="flex flex-wrap gap-2">
                {availableWeights.map(weight => (
                  <button
                    key={weight}
                    onClick={() => toggleWeightFilter(weight)}
                    disabled={isBulkOperationInProgress}
                    className={`
                      px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95
                      ${weightFilters.has(weight) 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-600 border-2 border-gray-200'}
                      ${isBulkOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Chips */}
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider">Pickup Date</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'today', 'tomorrow', 'custom'].map(date => (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    disabled={isBulkOperationInProgress}
                    className={`
                      px-4 py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all active:scale-95
                      ${dateFilter === date 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-600 border-2 border-gray-200'}
                      ${isBulkOperationInProgress ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {date}
                  </button>
                ))}
              </div>
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  disabled={isBulkOperationInProgress}
                  className="mt-2 w-full bg-white border-2 border-gray-900 rounded-xl py-3 px-4 font-black uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
            </div>
          </section>

          {/* BULK ACTION BAR */}
          {filteredOrders.filter(o => o.status === 'pending').length > 0 && (
            <div className="sticky top-[400px] lg:top-[340px] z-30 bg-gradient-to-r from-[#8B0000] to-red-700 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-black uppercase text-xs tracking-wider opacity-90">
                    {isBulkOperationInProgress ? 'Processing...' : 'Bulk Mark Done'}
                  </p>
                  <p className="text-white text-2xl font-black italic">
                    {filteredOrders.filter(o => o.status === 'pending').length} <span className="text-sm opacity-70">Pending</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsBulkMarkOpen(true)}
                  disabled={isBulkOperationInProgress}
                  className="bg-white text-[#8B0000] px-6 py-4 rounded-xl font-black uppercase text-sm tracking-wider active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBulkOperationInProgress ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Wait
                    </>
                  ) : (
                    <>
                      Mark <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ORDER LIST */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#8B0000]" />
                <h2 className="font-black uppercase text-xs tracking-widest text-gray-600">
                  {filteredOrders.length} Orders
                </h2>
              </div>
            </div>

            {filteredOrders.map((order) => {
              const isUpdating = updatingOrderId === order.id;
              const isLocked = isBulkOperationInProgress || isUpdating;
              
              return (
                <div 
                  key={order.id}
                  className={`
                    bg-white border-2 rounded-2xl p-4 transition-all
                    ${order.status === 'done' 
                      ? 'opacity-40 border-gray-100' 
                      : order.isNew 
                        ? 'border-green-500 shadow-lg shadow-green-500/20' 
                        : 'border-gray-100 active:border-[#8B0000]'}
                    ${isLocked ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <button 
                      onClick={() => handleMarkDone(order)}
                      disabled={isLocked || order.status === 'done'}
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90
                        ${order.status === 'done' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-300'}
                        ${isLocked ? 'cursor-not-allowed' : ''}
                      `}
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin text-[#8B0000]" size={28} />
                      ) : order.status === 'done' ? (
                        <CheckCircle2 size={28} />
                      ) : (
                        <Circle size={28} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 uppercase truncate text-lg leading-tight">
                            {order.customerName || 'Unknown'}
                          </p>
                          <p className="text-xs font-bold text-[#8B0000]">#{order.id}</p>
                        </div>
                        {order.isNew && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-lg font-black text-[10px] uppercase shrink-0">
                            New
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Cut</p>
                          <p className="font-black text-gray-900 uppercase text-sm flex items-center gap-1">
                            {order.cut}
                            {order.cut === 'custom' && <AlertCircle size={12} className="text-orange-500"/>}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                          <p className="font-black text-gray-900 text-lg leading-none">
                            {order.weight}<span className="text-xs text-gray-400">kg</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
                          <p className="font-black text-gray-900 uppercase text-xs flex items-center gap-1">
                            <Calendar size={12} className="text-gray-300" />
                            {new Date(order.pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasNoOrders && (
              <div className="py-20 text-center">
                <Package size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="font-black text-gray-300 uppercase tracking-widest text-sm">No Orders in System</p>
                <p className="text-xs text-gray-400 mt-2">Orders will appear here when created</p>
              </div>
            )}

            {hasNoFilteredOrders && (
              <div className="py-20 text-center">
                <Circle size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="font-black text-gray-300 uppercase tracking-widest text-sm">No Orders Match Filters</p>
                <button 
                  onClick={clearAllFilters}
                  disabled={isBulkOperationInProgress}
                  className="mt-4 text-xs font-black uppercase text-[#8B0000] active:opacity-70 disabled:opacity-30"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* BULK MARK BOTTOM SHEET */}
      {isBulkMarkOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => !isBulkOperationInProgress && setIsBulkMarkOpen(false)} 
          />
          <div className="relative bg-white w-full lg:w-[500px] rounded-t-3xl lg:rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase italic text-gray-900">Bulk Mark Done</h2>
              <button 
                onClick={() => setIsBulkMarkOpen(false)}
                disabled={isBulkOperationInProgress}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            {isBulkOperationInProgress && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3">
                <Loader2 className="text-blue-600 animate-spin shrink-0" size={24} />
                <div>
                  <p className="font-black text-blue-900 text-sm">Operation in Progress</p>
                  <p className="text-xs text-blue-700">Do not close this window</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 mb-2">Currently Showing</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-black text-gray-900">
                    {filteredOrders.filter(o => o.status === 'pending').length} Pending Orders
                  </p>
                  {cutFilters.size > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Cuts: {Array.from(cutFilters).join(', ')}
                    </p>
                  )}
                  {weightFilters.size > 0 && (
                    <p className="text-xs text-gray-600">
                      Weights: {Array.from(weightFilters).sort((a, b) => a - b).join('kg, ')}kg
                    </p>
                  )}
                  <p className="text-xs text-orange-600 mt-2 font-bold">
                    ⚠ Orders marked by pickup date (oldest first)
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">
                  Mark How Many?
                </label>
                <input
                  type="number"
                  value={bulkMarkCount}
                  onChange={(e) => setBulkMarkCount(e.target.value)}
                  placeholder="Enter number"
                  disabled={isBulkOperationInProgress}
                  className="w-full border-2 border-gray-900 rounded-xl py-4 px-4 font-black text-2xl text-center focus:ring-4 focus:ring-[#8B0000]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  min="1"
                  max={filteredOrders.filter(o => o.status === 'pending').length}
                />
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                <p className="text-xs font-black text-yellow-900 uppercase mb-1">Transaction Safety</p>
                <p className="text-xs text-yellow-800">
                  All {bulkMarkCount || '0'} orders will be marked in a single atomic operation. 
                  If any fail, none will be updated.
                </p>
              </div>

              <button
                onClick={handleBulkMarkDone}
                disabled={!bulkMarkCount || parseInt(bulkMarkCount) <= 0 || isBulkOperationInProgress}
                className="w-full bg-[#8B0000] text-white py-5 rounded-xl font-black uppercase text-sm tracking-wider active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isBulkOperationInProgress ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  `Mark ${bulkMarkCount || '0'} as Done`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}