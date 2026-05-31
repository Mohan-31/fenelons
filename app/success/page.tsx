'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'
import { useOrder } from '@/app/context/OrderContext'
import type { CartItem } from '@/app/context/OrderContext'

const MEAT_LABELS: Record<string, string> = {
  turkey: 'Turkey', ham: 'Ham', beef: 'Beef', lamb: 'Lamb', chicken: 'Chicken',
}

async function generateAndDownloadReceipt(
  cart: CartItem[],
  customer: { name: string; phone: string; email: string },
  paymentRef: string,
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 22
  const contentW = pageW - margin * 2
  let y = 0

  // Header bar
  doc.setFillColor(139, 0, 0)
  doc.rect(0, 0, pageW, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('FENELONS BUTCHERS', margin, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('CHRISTMAS ORDER RECEIPT', margin, 27)

  y = 52

  const today = format(new Date(), 'dd MMMM yyyy')
  const shortRef = paymentRef ? `#${paymentRef.slice(-8).toUpperCase()}` : '#FENELONS'

  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Order Date: ${today}`, margin, y)
  doc.text(`Reference: ${shortRef}`, pageW - margin, y, { align: 'right' })

  y += 14

  function drawSection(title: string) {
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(margin, y - 5, contentW, 8, 1, 1, 'F')
    doc.setTextColor(139, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), margin + 3, y + 1)
    y += 10
  }

  function drawRow(label: string, value: string) {
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin + 3, y)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'normal')
    doc.text(value || 'N/A', margin + 52, y)
    y += 8
  }

  drawSection('Customer Information')
  drawRow('Name', customer.name)
  drawRow('Phone', customer.phone)
  drawRow('Email', customer.email)

  y += 4

  // Each cart item as its own section
  cart.forEach((item, i) => {
    const meatLabel = item.meatType
      ? (MEAT_LABELS[item.meatType] || item.meatType.charAt(0).toUpperCase() + item.meatType.slice(1))
      : 'N/A'

    const weightLabel =
      item.weight === 'custom'
        ? `${item.customWeight || '—'}`
        : item.weight
        ? `${item.weight}kg`
        : '—'

    const pickupLabel = item.pickupDate
      ? format(new Date(item.pickupDate), 'EEEE, dd MMMM yyyy')
      : 'Not specified'

    drawSection(`Order Item ${i + 1}`)
    drawRow('Meat Type', meatLabel)
    drawRow('Cut / Product', item.cut || 'N/A')
    drawRow('Weight / Qty', weightLabel)
    drawRow('Collection Date', pickupLabel)
    if (item.notes) drawRow('Special Requests', item.notes)
    y += 4
  })

  drawSection('Payment Summary')

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Deposit Paid', margin + 3, y)
  doc.setTextColor(22, 163, 74)
  doc.setFont('helvetica', 'bold')
  doc.text(`€${ADVANCE_PRICE_EUR}.00   PAID`, margin + 52, y)
  y += 8

  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'bold')
  doc.text('Balance Due', margin + 3, y)
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'normal')
  doc.text('Payable in-store on collection day', margin + 52, y)
  y += 16

  doc.setFillColor(253, 247, 247)
  doc.setDrawColor(220, 180, 180)
  doc.roundedRect(margin, y, contentW, 28, 2, 2, 'FD')

  doc.setTextColor(139, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Thank you for choosing Fenelons!', pageW / 2, y + 9, { align: 'center' })

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Please bring this receipt on your collection day.', pageW / 2, y + 17, { align: 'center' })
  doc.text('Remaining balance is paid in-store at Fenelons Butchers.', pageW / 2, y + 24, { align: 'center' })

  doc.save(`fenelons-receipt-${shortRef}.pdf`)
}

export default function SuccessPage() {
  const { clearCart } = useOrder()
  const downloaded = useRef(false)

  useEffect(() => {
    if (downloaded.current) return
    downloaded.current = true

    const params = new URLSearchParams(window.location.search)
    const status = params.get('redirect_status')
    const paymentRef = params.get('payment_intent') || ''

    if (status !== 'succeeded') return

    // Backup: ensure order is saved in DB even if webhook was delayed/missed
    if (paymentRef) {
      fetch(`/api/orders/confirm?payment_intent=${paymentRef}`).catch(() => {})
    }

    const raw = localStorage.getItem('order-data')
    if (!raw) return

    try {
      const saved = JSON.parse(raw)
      const cart: CartItem[] = Array.isArray(saved.cart) ? saved.cart : []
      const customer = saved.customer || { name: '', phone: '', email: '' }

      if (cart.length > 0) {
        generateAndDownloadReceipt(cart, customer, paymentRef).then(() => {
          clearCart()
        })
      }
    } catch {
      console.error('Could not generate receipt')
    }
  }, [clearCart])

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.04),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.06),_transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative max-w-lg w-full"
      >
        <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-500 dark:text-green-400">
            Order Confirmed
          </span>
        </div>

        <h1
          className="font-black italic uppercase text-gray-900 dark:text-white leading-none mb-4"
          style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
        >
          You&apos;re<br />
          <span className="text-green-500">All Set.</span>
        </h1>

        <p className="text-gray-500 dark:text-white/35 font-bold text-sm uppercase tracking-widest mt-6 leading-relaxed max-w-sm mx-auto">
          Your deposit has been received. Collect your order on your chosen date.
          Remaining balance is paid in-store.
        </p>

        <p className="text-gray-400 dark:text-white/20 font-bold text-xs uppercase tracking-widest mt-3">
          Your receipt has been downloaded automatically.
        </p>

        <div className="mt-10 p-6 rounded-3xl bg-gray-100 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-left space-y-4">
          {[
            'Check your email for a confirmation receipt.',
            'Bring your order confirmation on collection day.',
            'Pay the remaining balance in-store at Fenelons.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-gray-500 dark:text-white/50 font-medium">
              <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-white/8 text-gray-400 dark:text-white/30 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {i + 1}
              </span>
              {tip}
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-[#8B0000] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#a50000] transition-colors"
        >
          Back to Home →
        </Link>
      </motion.div>
    </div>
  )
}
