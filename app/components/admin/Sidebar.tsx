'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Globe
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)      // Mobile
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  ]

  // NEW: Bottom items for Navigation and Session
  const bottomItems = [
    { name: 'Main Site', icon: Globe, href: '/' },
    { name: 'Logout', icon: LogOut, href: '/api/admin/logout', isLogout: true },
  ]

  /* ===============================
     CONTROL PAGE LAYOUT WIDTH
  =============================== */
  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '80px' : '256px'
    )
  }, [isCollapsed])

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b sticky top-0 z-40">
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-900">
          <Menu size={28} />
        </button>
        <div className="text-xl font-black text-[#8B0000]">FENELONS</div>
        <div className="w-10" />
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#121212] text-white
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* DESKTOP COLLAPSE BUTTON */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-10 bg-[#8B0000] rounded-full p-1 border-2 border-white"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-4 h-full flex flex-col">
          {/* LOGO */}
          <div className="flex items-center justify-between mb-10 h-10">
            {!isCollapsed && (
              <h2 className="text-2xl font-black tracking-tight">FENELONS</h2>
            )}
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>

          {/* MAIN NAV (TOP) */}
          <nav className="space-y-2 flex-1">
            {menuItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center rounded-xl transition-all
                    ${isCollapsed
                      ? 'justify-center h-12'
                      : 'gap-4 px-4 py-3'}
                    ${isActive
                      ? 'bg-[#8B0000] text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon size={22} />
                  {!isCollapsed && (
                    <span className="font-bold">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* BOTTOM NAV (LOGOUT & MAIN SITE) */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            {bottomItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center rounded-xl transition-all
                    ${isCollapsed
                      ? 'justify-center h-12'
                      : 'gap-4 px-4 py-3'}
                    ${item.isLogout 
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-500' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon size={22} />
                  {!isCollapsed && (
                    <span className="font-bold">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </>
  )
}