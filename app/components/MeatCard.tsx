'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Plus, X, ShoppingCart, Check } from 'lucide-react'
import { format } from 'date-fns'
import { useOrder } from '@/app/context/OrderContext'
import Calendar from './Calendar'

type Props = {
  title: 'Turkey' | 'Ham' | 'Other Meats'
  description: string
}

const CUTS: Record<string, string[]> = {
  Turkey: ['Whole Turkey', 'Turkey Crown', 'Turkey Breast', 'Turkey Legs', 'Turkey Wings'],
  Ham: ['Whole Fillet Ham', 'Shoulder Fillet Ham', 'Boneless Ham', 'Gammon Joint', 'Half Ham'],
}

const WEIGHTS = [
  { value: 3 as number | 'custom', label: '3kg', sub: 'serves 6+' },
  { value: 5 as number | 'custom', label: '5kg', sub: 'serves 10+' },
  { value: 7 as number | 'custom', label: '7kg', sub: 'serves 14+' },
  { value: 10 as number | 'custom', label: '10kg', sub: 'serves 20+' },
  { value: 'custom' as const, label: 'Custom', sub: 'specify kg' },
]

const OTHER_SUBCATEGORIES = ['Beef', 'Lamb', 'Chicken'] as const
type OtherSub = typeof OTHER_SUBCATEGORIES[number]

const OTHER_PRODUCTS: Record<OtherSub, string[]> = {
  Beef: ['Fillet Steak', 'Rib Eye Steak', 'Strip Loin Steak', 'Tomahawk Steak', 'Strip Loin Roast', 'Top Round Roast'],
  Lamb: ['Rack of Lamb', 'Center Loin Chops', 'Side Loin Chops', 'Gigot Chops', 'Lamb Flaps'],
  Chicken: ['Chicken Legs', 'Chicken Breast', 'Chicken Wings', 'Chicken Drumsticks', 'Chicken Fillets'],
}

interface DraftState {
  meatType: string
  pickupDate: string
  weight: number | 'custom' | undefined
  customWeight: string
  cut: string
  notes: string
}

function FeneIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`text-2xl font-black italic leading-none transition-colors select-none ${
        open ? 'text-white' : 'text-[#8B0000]'
      }`}
    >
      F
    </span>
  )
}

function getMeatType(title: string) {
  if (title === 'Turkey') return 'turkey'
  if (title === 'Ham') return 'ham'
  return ''
}

function makeDraft(title: string): DraftState {
  return {
    meatType: getMeatType(title),
    pickupDate: '',
    weight: undefined,
    customWeight: '',
    cut: '',
    notes: '',
  }
}

export default function MeatCard({ title, description }: Props) {
  const { addToCart } = useOrder()
  const [open, setOpen] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [added, setAdded] = useState(false)
  const [draft, setDraft] = useState<DraftState>(() => makeDraft(title))

  const isOther = title === 'Other Meats'
  const isTurkey = title === 'Turkey'
  const cuts = CUTS[title] || []

  const currentSub: OtherSub | null = isOther
    ? (OTHER_SUBCATEGORIES.find(s => s.toLowerCase() === draft.meatType) ?? null)
    : null

  const otherProducts = currentSub ? OTHER_PRODUCTS[currentSub] : []

  const finalWeight =
    draft.weight === 'custom'
      ? Number(draft.customWeight)
      : Number(draft.weight)

  const serves =
    finalWeight && finalWeight >= 3
      ? Math.floor((finalWeight * 1000) / (isTurkey ? 500 : 300))
      : null

  const isValid = isOther
    ? !!draft.pickupDate && !!currentSub && !!draft.cut && !!draft.customWeight?.trim() && agreed
    : !!draft.pickupDate && finalWeight >= 3 && !!draft.cut && agreed

  function updateDraft(data: Partial<DraftState>) {
    setDraft(prev => ({ ...prev, ...data }))
  }

  function handleToggle() {
    setOpen(prev => !prev)
  }

  function selectSubcategory(sub: OtherSub) {
    setDraft(prev => ({ ...prev, meatType: sub.toLowerCase(), cut: '', customWeight: '', weight: 'custom' }))
  }

  function handleAddToCart() {
    if (!isValid) return
    addToCart({
      meatType: draft.meatType,
      pickupDate: draft.pickupDate,
      weight: draft.weight,
      customWeight: draft.customWeight || undefined,
      cut: draft.cut,
      notes: draft.notes || undefined,
    })
    setDraft(makeDraft(title))
    setAgreed(false)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setOpen(false)
    }, 1500)
  }

  return (
    <div
      className={`rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
        open
          ? 'border-[#8B0000] bg-white dark:bg-[#141414] shadow-2xl shadow-[#8B0000]/10'
          : 'border-gray-200 dark:border-white/8 bg-white dark:bg-white/4 hover:bg-gray-50 dark:hover:bg-white/7 hover:border-gray-300 dark:hover:border-white/15'
      }`}
    >
      {/* Header toggle */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full text-left px-6 md:px-8 py-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              open ? 'bg-[#8B0000] shadow-lg shadow-[#8B0000]/30' : 'bg-gray-100 dark:bg-white/8'
            }`}
          >
            <FeneIcon open={open} />
          </div>
          <div>
            <h3
              className={`font-black italic uppercase leading-none transition-colors ${
                open ? 'text-[#8B0000]' : 'text-gray-900 dark:text-white'
              }`}
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
            >
              {title}
            </h3>
            <p
              className={`text-xs font-bold uppercase tracking-[0.15em] mt-1 transition-colors ${
                open ? 'text-gray-400 dark:text-white/35' : 'text-gray-400 dark:text-white/30'
              }`}
            >
              {description}
            </p>
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
            open
              ? 'border-[#8B0000] text-[#8B0000] bg-red-50 dark:bg-[#8B0000]/10'
              : 'border-gray-200 dark:border-white/20 text-gray-400 dark:text-white/30'
          }`}
        >
          {open ? <X size={16} /> : <Plus size={16} />}
        </div>
      </button>

      {/* Expanded form */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-gray-100 dark:border-white/6 px-6 md:px-8 py-8 space-y-8">

              {isOther ? (
                <>
                  {/* OTHER MEATS — Step 1: Subcategory */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-3">
                      Select Category
                    </p>
                    <div className="flex gap-3">
                      {OTHER_SUBCATEGORIES.map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => selectSubcategory(sub)}
                          className={`flex-1 py-3.5 rounded-2xl border-2 font-black text-sm uppercase tracking-wider transition-all ${
                            currentSub === sub
                              ? 'border-[#8B0000] bg-[#8B0000] text-white shadow-md shadow-[#8B0000]/20'
                              : 'border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OTHER MEATS — Step 2: Product */}
                  {currentSub && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-3">
                        Select Product
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {otherProducts.map(product => (
                          <button
                            key={product}
                            type="button"
                            onClick={() => updateDraft({ cut: product })}
                            className={`px-4 py-2.5 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${
                              draft.cut === product
                                ? 'border-[#8B0000] bg-[#8B0000] text-white'
                                : 'border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                          >
                            {product}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OTHER MEATS — Step 3: Quantity */}
                  {currentSub && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-3">
                        Quantity / Weight
                      </p>
                      <input
                        type="text"
                        placeholder="e.g. 2 pieces, 1.5kg, 4 fillets..."
                        value={draft.customWeight}
                        onChange={(e) => updateDraft({ customWeight: e.target.value, weight: 'custom' })}
                        className="w-full max-w-xs rounded-2xl border-2 border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 px-5 py-3.5 font-black text-gray-900 dark:text-white focus:border-[#8B0000] outline-none transition-colors"
                      />
                      <p className="mt-2 text-xs font-bold text-gray-400 dark:text-white/30">
                        No minimum — order any amount
                      </p>
                    </div>
                  )}

                  {/* OTHER MEATS — Step 4: Pickup Date */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-4">
                      Pickup Date
                    </p>
                    <div
                      className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm mb-5 ${
                        draft.pickupDate
                          ? 'bg-[#8B0000] text-white'
                          : 'bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-white/40'
                      }`}
                    >
                      <CalendarDays size={15} />
                      <span>
                        {draft.pickupDate
                          ? format(new Date(draft.pickupDate), 'EEEE, dd MMMM yyyy')
                          : 'Pick a date below'}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 p-3 max-w-xs">
                      <Calendar
                        selected={draft.pickupDate ? new Date(draft.pickupDate) : undefined}
                        onSelect={(date) => updateDraft({ pickupDate: date.toISOString() })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* TURKEY / HAM — Step 1: Pickup Date */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-4">
                      Pickup Date
                    </p>
                    <div
                      className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm mb-5 ${
                        draft.pickupDate
                          ? 'bg-[#8B0000] text-white'
                          : 'bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-white/40'
                      }`}
                    >
                      <CalendarDays size={15} />
                      <span>
                        {draft.pickupDate
                          ? format(new Date(draft.pickupDate), 'EEEE, dd MMMM yyyy')
                          : 'Pick a date below'}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 p-3 max-w-xs">
                      <Calendar
                        selected={draft.pickupDate ? new Date(draft.pickupDate) : undefined}
                        onSelect={(date) => updateDraft({ pickupDate: date.toISOString() })}
                      />
                    </div>
                  </div>

                  {/* TURKEY / HAM — Step 2: Weight */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-3">
                      Select Weight
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {WEIGHTS.map((w) => {
                        const sel =
                          w.value === 'custom'
                            ? draft.weight === 'custom'
                            : draft.weight === w.value
                        return (
                          <button
                            key={w.label}
                            type="button"
                            onClick={() => {
                              if (w.value === 'custom') {
                                updateDraft({ weight: 'custom', customWeight: '' })
                              } else {
                                updateDraft({ weight: w.value as number, customWeight: '' })
                              }
                            }}
                            className={`flex flex-col items-center px-5 py-3.5 rounded-2xl border-2 font-black transition-all ${
                              sel
                                ? 'border-[#8B0000] bg-[#8B0000] text-white shadow-md shadow-[#8B0000]/20'
                                : 'border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/20'
                            }`}
                          >
                            <span className="text-base">{w.label}</span>
                            <span className={`text-[10px] font-bold tracking-wider mt-0.5 ${sel ? 'text-white/70' : 'text-gray-400 dark:text-white/30'}`}>
                              {w.sub}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {draft.weight === 'custom' && (
                      <input
                        type="number"
                        min={3}
                        step={0.5}
                        placeholder="Enter weight in kg (min 3kg)"
                        value={draft.customWeight}
                        onChange={(e) => updateDraft({ customWeight: e.target.value })}
                        className="mt-4 w-full max-w-xs rounded-2xl border-2 border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 px-5 py-3.5 font-black text-gray-900 dark:text-white focus:border-[#8B0000] outline-none transition-colors"
                      />
                    )}

                    {serves && (
                      <p className="mt-3 text-sm font-bold text-gray-500 dark:text-white/40">
                        Comfortably serves{' '}
                        <span className="text-[#8B0000] font-black">{serves}+ people</span>
                      </p>
                    )}
                  </div>

                  {/* TURKEY / HAM — Step 3: Cut */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-3">
                      Cut / Part Required
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cuts.map((cut) => (
                        <button
                          key={cut}
                          type="button"
                          onClick={() => updateDraft({ cut })}
                          className={`px-4 py-2.5 rounded-xl border-2 font-black text-xs uppercase tracking-wider transition-all ${
                            draft.cut === cut
                              ? 'border-[#8B0000] bg-[#8B0000] text-white'
                              : 'border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          {cut}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Notes (shared) */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/35 mb-3">
                  Special Requests{' '}
                  <span className="text-gray-400 dark:text-white/30 normal-case font-bold tracking-normal">(optional)</span>
                </p>
                <textarea
                  placeholder="Any special preparation notes..."
                  value={draft.notes}
                  onChange={(e) => updateDraft({ notes: e.target.value })}
                  className="w-full rounded-2xl border-2 border-gray-200 dark:border-white/12 bg-white dark:bg-white/5 px-5 py-4 text-gray-900 dark:text-white resize-none h-24 focus:border-[#8B0000] outline-none transition-colors font-medium text-sm placeholder:text-gray-400 dark:placeholder:text-white/25"
                />
              </div>

              {/* Terms */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/8">
                <p className="flex-1 text-sm font-bold text-gray-500 dark:text-white/50">
                  Before proceeding, please read our{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[#8B0000] font-black underline underline-offset-2"
                  >
                    Order Terms &amp; Conditions
                  </button>
                </p>
                {agreed && (
                  <span className="text-green-600 font-black text-xs uppercase tracking-wider shrink-0">
                    ✓ Agreed
                  </span>
                )}
              </div>

              {/* Add to Cart CTA */}
              {added ? (
                <div className="w-full py-5 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <Check size={18} /> Added to Cart!
                </div>
              ) : (
                <button
                  disabled={!isValid}
                  onClick={handleAddToCart}
                  className="w-full py-5 rounded-2xl bg-[#8B0000] text-white font-black uppercase tracking-widest text-sm disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#a50000] transition-colors flex items-center justify-center gap-2"
                >
                  {isValid ? (
                    <><ShoppingCart size={18} /> Add to Cart</>
                  ) : (
                    'Complete All Fields Above'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-7 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
              <h3 className="text-2xl font-black italic uppercase text-gray-900">Order Terms</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-6">
                Please read before proceeding
              </p>

              <ul className="space-y-3">
                {[
                  'Orders must be collected strictly on the selected pickup date.',
                  'Remaining balance must be paid in-store on collection.',
                  'Late collection may affect product quality.',
                  'No refunds or replacements for late pickups.',
                  'Orders cannot be processed earlier or later than booked.',
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {term}
                  </li>
                ))}
              </ul>

              <div
                className="mt-7 flex items-center gap-3 p-4 rounded-2xl bg-gray-50 cursor-pointer select-none"
                onClick={() => setAgreed((a) => !a)}
              >
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    agreed ? 'border-[#8B0000] bg-[#8B0000]' : 'border-gray-300'
                  }`}
                >
                  {agreed && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <span className="text-sm font-black text-gray-900">
                  I understand and agree to these terms
                </span>
              </div>

              <button
                disabled={!agreed}
                onClick={() => setShowTerms(false)}
                className="mt-4 w-full py-4 rounded-2xl bg-[#8B0000] text-white font-black uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#a50000] transition-colors"
              >
                Confirm &amp; Continue →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
