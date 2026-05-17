'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type MeatOrder = {
  meatType?: string
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

const defaultOrder: OrderState = {
  meat: {
    meatType: '',
    pickupDate: '',
    weight: undefined,
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

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<OrderState>(() => {
    if (typeof window === 'undefined') return defaultOrder
    
    try {
      const saved = localStorage.getItem('order-data')
      const parsed = saved ? JSON.parse(saved) : null
      return parsed 
        ? { ...defaultOrder, ...parsed, meat: { ...defaultOrder.meat, ...parsed.meat } } 
        : defaultOrder
    } catch (e) {
      console.error("Failed to load order from localStorage", e)
      return defaultOrder
    }
  })

  useEffect(() => {
    localStorage.setItem('order-data', JSON.stringify(order))
  }, [order])

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

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used inside OrderProvider')
  return ctx
}
