'use client'

import React from 'react'
import { Menu, ShoppingCart } from 'lucide-react'
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
  handleMobileTabClick
}: MobileHeaderProps) {
  return (
    <>
      {/* Barra de anuncios (Mobile) */}
      {announcement?.enabled && announcement?.text && (
        <div 
          className="w-full text-center py-1.5 px-3 text-[10px] font-bold leading-tight select-none shrink-0"
          style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
        >
          {announcement.text}
        </div>
      )}

      {/* Cabecera Móvil */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-150 h-16 flex items-center justify-between px-4 shadow-none relative">
        <div className="flex items-center w-10">
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-zinc-650 hover:text-zinc-900 cursor-pointer border-none bg-transparent"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 pointer-events-none">
          {store.logoUrl ? (
            <div className="flex items-center gap-2">
              <img src={store.logoUrl} alt={formattedStoreName} className="h-6 max-w-[80px] object-contain shrink-0 rounded" />
              <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">{formattedStoreName}</span>
              
              {/* Schedule Badge (Mobile with Logo) */}
              {schedule?.enabled && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-[#EEF2F0] text-emerald-700 select-none scale-90 origin-left shrink-0">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{schedule.alwaysOpen ? '24/7' : 'Abierto'}</span>
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-[9px] text-emerald-600">
                ☕
              </div>
              <span className="font-black text-xs text-zinc-955 uppercase tracking-tight">{formattedStoreName}</span>

              {/* Schedule Badge (Mobile without Logo) */}
              {schedule?.enabled && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-[#EEF2F0] text-emerald-700 select-none scale-90 origin-left shrink-0">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{schedule.alwaysOpen ? '24/7' : 'Abierto'}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end w-10">
          <button 
            type="button"
            onClick={() => handleMobileTabClick('carrito')}
            className="w-10 h-10 flex items-center justify-center relative bg-transparent border-0 cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-zinc-700" />
            {itemsInCart > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                {itemsInCart}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  )
}
