'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ADVANCE_PRICE_EUR } from '@/app/config/pricing'

async function generateAndDownloadReceipt(order: {
  meat: { meatType?: string; pickupDate?: string; weight?: number | 'custom'; customWeight?: string; cut?: string; notes?: string }
  customer: { name: string; phone: string; email: string }
}, paymentRef: string) {
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

  // Order meta
  const today = format(new Date(), 'dd MMMM yyyy')
  const shortRef = paymentRef ? `#${paymentRef.slice(-8).toUpperCase()}` : '#FENELONS'

  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Order Date: ${today}`, margin, y)
  doc.text(`Reference: ${shortRef}`, pageW - margin, y, { align: 'right' })

  y += 14

  // Section: Customer
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
  drawRow('Name', order.customer.name)
  drawRow('Phone', order.customer.phone)
  drawRow('Email', order.customer.email)

  y += 4

  // Section: Order Details
  const weightLabel =
    order.meat.weight === 'custom'
      ? `${order.meat.customWeight}kg (custom)`
      : `${order.meat.weight}kg`

  const pickupLabel = order.meat.pickupDate
    ? format(new Date(order.meat.pickupDate), 'EEEE, dd MMMM yyyy')
    : 'Not specified'

  const meatLabel = order.meat.meatType
    ? order.meat.meatType.charAt(0).toUpperCase() + order.meat.meatType.slice(1)
    : 'N/A'

  drawSection('Order Details')
  drawRow('Meat Type', meatLabel)
  drawRow('Cut', order.meat.cut || 'N/A')
  drawRow('Weight', weightLabel)
  drawRow('Collection Date', pickupLabel)
  if (order.meat.notes) drawRow('Special Requests', order.meat.notes)

  y += 4

  // Section: Payment
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

  // Footer box
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
  const downloaded = useRef(false)

  useEffect(() => {
    if (downloaded.current) return
    downloaded.current = true

    const params = new URLSearchParams(window.location.search)
    const status = params.get('redirect_status')
    const paymentRef = params.get('payment_intent') || ''

    if (status !== 'succeeded') return

    const raw = localStorage.getItem('order-data')
    if (!raw) return

    try {
      const order = JSON.parse(raw)
      generateAndDownloadReceipt(order, paymentRef)
    } catch {
      console.error('Could not generate receipt')
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.04),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.06),_transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative max-w-lg w-full"
      >
        {/* Check circle */}
        <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-8">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15, stiffness: 300 }}
            className="text-green-400 text-4xl font-black"
          >
            ✓
          </motion.span>
        </div>

        {/* Badge */}
        <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-500 dark:text-green-400">
            Order Confirmed
          </span>
        </div>

        {/* Headline */}
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

        {/* Next steps */}
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
