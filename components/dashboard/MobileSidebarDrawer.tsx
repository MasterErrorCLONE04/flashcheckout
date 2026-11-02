'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Zap,
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Package,
  Settings,
  Clock,
  Gift,
  BookOpenText,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SidebarNav from './SidebarNav'

interface MobileSidebarDrawerProps {
  storeName: string
  isPro: boolean
  productCount: number
  conversationsCount: number
  ordersCount: number
}

export function MobileSidebarDrawer({
  storeName,
  isPro,
  productCount,
  conversationsCount,
  ordersCount,
}: MobileSidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const close = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center h-9 w-9 lg:hidden hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        aria-label="Abrir menú de navegación"
      >
        <Menu className="h-5 w-5 text-zinc-700" />
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
              onClick={close}
            />

            {/* Drawer Panel */}
            <aside className="relative z-10 w-[280px] max-w-[85vw] h-full bg-[#FAFAFA] border-r border-zinc-200 flex flex-col justify-between overflow-y-auto scrollbar-none shadow-2xl">
              {/* Top Bar */}
              <div>
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 bg-white sticky top-0 z-10">
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="flex items-center gap-2.5 min-w-0"
                  >
                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-white fill-current" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-zinc-950 truncate block leading-tight">
                        {storeName}
                      </span>
                      <span className="text-[11px] text-zinc-500 block leading-tight">
                        {isPro ? 'Plan Pro' : 'Plan Gratuito'}
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={close}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-3">
                  <SidebarNav
                    conversationsCount={conversationsCount}
                    ordersCount={ordersCount}
                    expanded
                    onNavigate={close}
                  />
                </div>
              </div>

              {/* Footer Info & Secondary Links */}
              <div className="p-3 space-y-3 border-t border-zinc-200 bg-white">
                {!isPro ? (
                  <Link href="/pricing" onClick={close} className="block">
                    <div className="flex flex-col gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                      <div className="flex justify-between items-center text-xs font-semibold text-zinc-800">
                        <span>Productos usados</span>
                        <span className="tabular-nums">{productCount} / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            productCount >= 10
                              ? 'bg-red-500'
                              : productCount >= 8
                              ? 'bg-amber-500'
                              : 'bg-zinc-900'
                          )}
                          style={{ width: `${Math.min((productCount / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-600">
                        Actualizar a Pro →
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Plan Premium
                    </span>
                    <span className="text-zinc-500 tabular-nums">{productCount} productos</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5 text-xs font-medium text-zinc-600">
                  <Link
                    href="/work/doc"
                    onClick={close}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <BookOpenText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Docs</span>
                  </Link>
                  <Link
                    href="/help"
                    onClick={close}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Ayuda</span>
                  </Link>
                  <Link
                    href="/changelog"
                    onClick={close}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Novedades</span>
                  </Link>
                  <Link
                    href="/affiliate"
                    onClick={close}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Afiliados</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  )
}

export function MobileBottomDock({
  conversationsCount = 0,
  ordersCount = 0,
}: {
  conversationsCount?: number
  ordersCount?: number
}) {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: '/conversaciones', label: 'Chats', icon: MessageSquare, badge: conversationsCount },
    { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart, badge: ordersCount },
    { href: '/productos', label: 'Catálogo', icon: Package },
    { href: '/configuracion', label: 'Ajustes', icon: Settings },
  ]

  return (
    <nav
      aria-label="Acceso rápido móvil"
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/90 backdrop-blur-md rounded-2xl border border-zinc-200/90 shadow-lg px-2 py-1.5"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (pathname?.startsWith(`${item.href}/`) && item.href !== '/dashboard')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-semibold transition-colors',
                isActive
                  ? 'bg-zinc-950 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="leading-none">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'absolute top-1 right-2 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center tabular-nums leading-none',
                    isActive ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

