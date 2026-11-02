'use client'

import React, { useState, useEffect } from 'react'
import { Menu, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Store, CatalogSettings } from '../types'

export interface MobileHeaderProps {
  store: Store
  formattedStoreName: string
  announcement: {
    enabled?: boolean
    text?: string
    bgColor?: string
    textColor?: string
  }
  schedule: CatalogSettings['schedule']
  itemsInCart: number
  setIsMobileMenuOpen: (open: boolean) => void
  handleMobileTabClick: (tab: string) => void
}

export function MobileHeader({
  store,
  formattedStoreName,
  announcement,
  schedule,
  itemsInCart,
  setIsMobileMenuOpen,
  handleMobileTabClick,
}: MobileHeaderProps) {
  const promoMessages = React.useMemo(() => {
    const raw = announcement?.text || ''
    const parts = raw
      .split('|')
      .map(s => s.trim())
      .filter(Boolean)
    return parts.length > 0 ? parts : raw ? [raw] : []
  }, [announcement?.text])

  const [promoIdx, setPromoIdx] = useState(0)

  useEffect(() => {
    if (promoMessages.length <= 1) return
    const timer = setInterval(() => {
      setPromoIdx(prev => (prev + 1) % promoMessages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [promoMessages.length])

  const currentPromo = promoMessages[promoIdx % Math.max(1, promoMessages.length)]

  return (
    <>
      {announcement?.enabled && currentPromo && (
        <div
          className="w-full py-1.5 px-3 text-[10px] font-semibold leading-tight select-none shrink-0 flex items-center justify-between gap-2"
          style={{
            backgroundColor: announcement.bgColor || '#DDF3E4',
            color: announcement.textColor || '#0D3B26',
          }}
        >
          {promoMessages.length > 1 ? (
            <button
              type="button"
              onClick={() =>
                setPromoIdx(prev => (prev - 1 + promoMessages.length) % promoMessages.length)
              }
              className="opacity-65 hover:opacity-100 bg-transparent border-0 p-0.5 cursor-pointer"
              style={{ color: announcement.textColor || '#0D3B26' }}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          ) : (
            <span className="w-3" />
          )}
          <span className="truncate text-center flex-1">{currentPromo}</span>
          {promoMessages.length > 1 ? (
            <button
              type="button"
              onClick={() => setPromoIdx(prev => (prev + 1) % promoMessages.length)}
              className="opacity-65 hover:opacity-100 bg-transparent border-0 p-0.5 cursor-pointer"
              style={{ color: announcement.textColor || '#0D3B26' }}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="w-3" />
          )}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 h-14 flex items-center justify-between px-4 relative">
        <div className="flex items-center w-10">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-zinc-900 hover:text-zinc-600 cursor-pointer border-none bg-transparent p-1"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 pointer-events-none">
          {store.logoUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={store.logoUrl}
                alt={formattedStoreName}
                className="h-6 max-w-[88px] object-contain shrink-0"
              />
            </div>
          ) : (
            <span className="font-black text-base text-zinc-950 tracking-[-0.04em] lowercase leading-none">
              {formattedStoreName.toLowerCase()}
              <sup className="text-[8px] font-bold ml-0.5">®</sup>
            </span>
          )}

          {schedule?.enabled && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-zinc-100 text-zinc-700 select-none shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{schedule.alwaysOpen ? '24/7' : 'Abierto'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-end w-10">
          <button
            type="button"
            onClick={() => handleMobileTabClick('carrito')}
            className="h-9 px-1.5 flex items-center gap-1 relative bg-transparent border-0 cursor-pointer text-zinc-950"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="w-4.5 h-4.5 stroke-[1.8]" />
            {itemsInCart > 0 && (
              <span className="text-[11px] font-bold tabular-nums">{itemsInCart}</span>
            )}
          </button>
        </div>
      </header>
    </>
  )
}
