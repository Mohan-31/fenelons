'use client'

import { createContext, useContext, useEffect, useState } from 'react'

/* ---------- TYPES ---------- */

// STEP 2: Updated MeatOrder to include customWeight and allow numbers/custom for weight
export type MeatOrder = {
  pickupDate?: string
  weight?: number | 'custom'
  customWeight?: string
  cut?: string
  notes?: string
}

export type CustomerDetails = {
  name: string
  phone: string
  email: string
}

type OrderState = {
  meat: MeatOrder
  customer: CustomerDetails
}

type OrderContextType = {
  order: OrderState
  updateMeat: (data: Partial<MeatOrder>) => void
  updateCustomer: (data: Partial<CustomerDetails>) => void
  clearOrder: () => void
}

/* ---------- DEFAULT ---------- */

// STEP 4: Updated initial state for meat
const defaultOrder: OrderState = {
  meat: {
    pickupDate: '',
    weight: undefined, // Changed from '' to undefined for type safety
    customWeight: '',
    cut: '',
    notes: '',
  },
  customer: {
    name: '',
    phone: '',
    email: '',
  },
}

const OrderContext = createContext<OrderContextType | null>(null)

/* ---------- PROVIDER ---------- */

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<OrderState>(() => {
    if (typeof window === 'undefined') return defaultOrder
    
    try {
      const saved = localStorage.getItem('order-data')
      const parsed = saved ? JSON.parse(saved) : null
      
      // If we have saved data, merge it with the default structure
      // to ensure all required fields exist.
      return parsed 
        ? { ...defaultOrder, ...parsed } 
        : defaultOrder
    } catch (e) {
      console.error("Failed to load order from localStorage", e)
      return defaultOrder
    }
  })

  useEffect(() => {
    localStorage.setItem('order-data', JSON.stringify(order))
  }, [order])

  // STEP 3: Ensure updateMeat uses Partial<MeatOrder>
  function updateMeat(data: Partial<MeatOrder>) {
    setOrder(prev => ({
      ...prev,
      meat: { ...prev.meat, ...data },
    }))
  }

  function updateCustomer(data: Partial<CustomerDetails>) {
    setOrder(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data },
    }))
  }

  function clearOrder() {
    localStorage.removeItem('order-data')
    setOrder(defaultOrder)
  }

  return (
    <OrderContext.Provider
      value={{ order, updateMeat, updateCustomer, clearOrder }}
    >
      {children}
    </OrderContext.Provider>
  )
}

/* ---------- HOOK ---------- */

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used inside OrderProvider')
  return ctx
}