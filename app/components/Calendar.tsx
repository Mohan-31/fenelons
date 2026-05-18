'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  selected?: Date
  onSelect: (date: Date) => void
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar({ selected, onSelect }: Props) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewDate, setViewDate] = useState(() => {
    const base = selected || today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      date.setHours(0, 0, 0, 0)
      arr.push(date)
    }
    return arr
  }, [year, month])

  function isSameDay(a: Date, b: Date) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  }

  function isPast(d: Date) {
    return d < today
  }

  return (
    <div className="w-full select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-600 dark:text-white/70 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={13} />
        </button>

        <span className="font-black uppercase tracking-[0.08em] text-gray-900 dark:text-white text-xs">
          {MONTHS[month]} {year}
        </span>

        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-600 dark:text-white/70 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div
            key={d}
            className="text-center text-[9px] font-black uppercase tracking-wide text-gray-400 dark:text-white/30 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="aspect-square" />

          const isSelected = selected && isSameDay(day, selected)
          const isDisabledDay = isPast(day)
          const isToday = isSameDay(day, today)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !isDisabledDay && onSelect(day)}
              disabled={isDisabledDay}
              className={`
                aspect-square w-full flex items-center justify-center rounded-lg font-bold text-xs transition-all duration-100
                ${isSelected
                  ? 'bg-[#8B0000] text-white shadow-md shadow-[#8B0000]/30'
                  : isDisabledDay
                    ? 'text-gray-300 dark:text-white/15 cursor-not-allowed'
                    : isToday
                      ? 'ring-2 ring-[#8B0000]/60 text-[#8B0000] dark:text-[#ff8888] hover:bg-[#8B0000]/10'
                      : 'text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/12 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
