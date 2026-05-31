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

export type CartItem = MeatOrder & { id: string }

export type CustomerDetails = {
  name: string
  phone: string
  email: string
}

type OrderState = {
  cart: CartItem[]
  customer: CustomerDetails
}

type OrderContextType = {
  order: OrderState
  addToCart: (item: MeatOrder) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  updateCustomer: (data: Partial<CustomerDetails>) => void
}

const defaultOrder: OrderState = {
  cart: [],
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
      if (parsed) {
        return {
          cart: Array.isArray(parsed.cart) ? parsed.cart : [],
          customer: { ...defaultOrder.customer, ...parsed.customer },
        }
      }
      return defaultOrder
    } catch {
      return defaultOrder
    }
  })

  useEffect(() => {
    localStorage.setItem('order-data', JSON.stringify(order))
  }, [order])

  function addToCart(item: MeatOrder) {
    const cartItem: CartItem = {
      ...item,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    }
    setOrder(prev => ({ ...prev, cart: [...prev.cart, cartItem] }))
  }

  function removeFromCart(id: string) {
    setOrder(prev => ({ ...prev, cart: prev.cart.filter(i => i.id !== id) }))
  }

  function clearCart() {
    setOrder(prev => ({ ...prev, cart: [] }))
  }

  function updateCustomer(data: Partial<CustomerDetails>) {
    setOrder(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data },
    }))
  }

  return (
    <OrderContext.Provider value={{ order, addToCart, removeFromCart, clearCart, updateCustomer }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used inside OrderProvider')
  return ctx
}
