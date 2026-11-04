'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ShoppingBag, Search, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Store, NavLink, CatalogSettings } from '../types'

export interface CatalogDesktopHeaderProps {
  store: Store
  formattedStoreName: string
  colors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
  headerStyle: string
  radiusBadge: string
  schedule: {
    enabled?: boolean
    text?: string
    alwaysOpen?: boolean
  }
  announcement: {
    enabled?: boolean
    text?: string
    bgColor?: string
    textColor?: string
  }
  navbarLinks: NavLink[]
  activeNavTab: string
  setActiveNavTab: (tab: string) => void
  handleNavbarLinkClick: (link: NavLink) => void
  socialsShowInCatalog: boolean
  aiSettings: CatalogSettings
  searchQuery: string
  setSearchQuery: (query: string) => void
  setIsCartOpen: (open: boolean) => void
  itemsInCart: number
  total: number
}

export function CatalogDesktopHeader({
  store,
  formattedStoreName,
  colors,
  headerStyle,
  schedule,
  announcement,
  navbarLinks,
  activeNavTab,
  setActiveNavTab,
  handleNavbarLinkClick,
  searchQuery,
  setSearchQuery,
  setIsCartOpen,
  itemsInCart,
}: CatalogDesktopHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [promoIdx, setPromoIdx] = useState(0)

  const promoMessages = useMemo(() => {
    const raw = announcement?.text || ''
    return raw
      .split('|')
      .map(s => s.trim())
      .filter(Boolean)
  }, [announcement?.text])

  useEffect(() => {
    if (promoMessages.length <= 1) return
    const timer = setInterval(() => {
      setPromoIdx(prev => (prev + 1) % promoMessages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [promoMessages.length])

  const isDarkCanvas =
    colors.fondo.toLowerCase() === '#0b0f19' || colors.fondo.toLowerCase() === '#09090b'

  return (
    <>
      {/* Waterdrop Architectural Top Promo Strip */}
      {announcement?.enabled && promoMessages.length > 0 && (
        <div
          data-maker-section="hero"
          data-maker-title="Barra de Anuncios"
          className="w-full h-[34px] text-[11.5px] font-semibold tracking-[-0.01em] select-none shrink-0 flex items-center cursor-pointer"
          style={{
            backgroundColor: announcement.bgColor || colors.acento || '#8CE5A7',
            color: announcement.textColor || '#111111',
          }}
        >
          <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 flex items-center justify-between">
            {promoMessages.length > 1 ? (
              <button
                type="button"
                onClick={() =>
                  setPromoIdx(prev => (prev === 0 ? promoMessages.length - 1 : prev - 1))
                }
                className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-0"
                style={{ color: announcement.textColor || '#111111' }}
                aria-label="Promoción anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            ) : (
              <span className="w-5" />
            )}

            <span className="text-center truncate px-3">
              {promoMessages[promoIdx % promoMessages.length]}
            </span>

            {promoMessages.length > 1 ? (
              <button
                type="button"
                onClick={() => setPromoIdx(prev => (prev + 1) % promoMessages.length)}
                className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-0"
                style={{ color: announcement.textColor || '#111111' }}
                aria-label="Siguiente promoción"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            ) : (
              <span className="w-5" />
            )}
          </div>
        </div>
      )}

      {/* Gallery-White Flagship Waterdrop Navbar */}
      <header
        data-maker-section="hero"
        data-maker-title="Encabezado & Logo"
        className={cn(
          'transition-all duration-300 z-50 select-none shrink-0 w-full cursor-pointer',
          headerStyle === 'floating-glass'
            ? 'sticky top-3 max-w-[1380px] mx-auto px-6 h-[68px] bg-white/92 backdrop-blur-xl border border-zinc-200/80 rounded-full shadow-xs my-2'
            : cn(
                'sticky top-0 backdrop-blur-md border-b h-[68px]',
                isDarkCanvas
                  ? 'bg-zinc-950/92 border-zinc-800'
                  : 'bg-white/96 border-zinc-200/60'
              )
        )}
      >
        <div
          className={cn(
            'max-w-[1440px] mx-auto w-full h-full flex items-center justify-between gap-8',
            headerStyle === 'floating-glass' ? 'px-2' : 'px-6 lg:px-12'
          )}
        >
          {/* Left Group: Iconic Wordmark + Inline Navigation */}
          <div className="flex items-center gap-10 min-w-0">
            <button
              type="button"
              onClick={() => setActiveNavTab('Inicio')}
              className="flex items-center gap-2.5 cursor-pointer bg-transparent border-0 p-0 text-left shrink-0 group"
            >
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={formattedStoreName}
                  className="h-7 max-w-[140px] object-contain shrink-0"
                />
              ) : (
                <span
                  className="font-black text-[23px] tracking-[-0.05em] lowercase leading-none"
                  style={{ color: colors.texto }}
                >
                  {store.name.trim().toLowerCase()}
                  <sup className="text-[9px] font-bold ml-0.5 opacity-70">®</sup>
                </span>
              )}
            </button>

            {headerStyle !== 'editorial-centered' && (
              <nav className="hidden lg:flex items-center gap-8 text-[13.5px] tracking-[-0.01em]">
                {navbarLinks.map((item, idx) => {
                  const isActive = activeNavTab === item.label
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveNavTab(item.label)
                        handleNavbarLinkClick(item)
                      }}
                      className={cn(
                        'cursor-pointer transition-all py-1.5 bg-transparent border-0 relative',
                        isActive
                          ? 'font-bold opacity-100'
                          : 'font-medium opacity-75 hover:opacity-100'
                      )}
                      style={{ color: colors.texto }}
                    >
                      {item.label}
                      <span
                        className={cn(
                          'absolute bottom-0 left-0 right-0 h-[1.5px] transition-transform duration-300 origin-left',
                          isActive ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                        )}
                        style={{ backgroundColor: colors.texto }}
                      />
                    </button>
                  )
                })}
              </nav>
            )}
          </div>

          {/* Optional Editorial Centered Nav */}
          {headerStyle === 'editorial-centered' && (
            <nav className="hidden lg:flex items-center gap-8 text-[13.5px]">
              {navbarLinks.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveNavTab(item.label)
                    handleNavbarLinkClick(item)
                  }}
                  className={cn(
                    'cursor-pointer bg-transparent border-0 transition-opacity',
                    activeNavTab === item.label
                      ? 'font-bold opacity-100'
                      : 'font-medium opacity-70 hover:opacity-100'
                  )}
                  style={{ color: colors.texto }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Group: Fine-Stroke Minimalist Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {schedule?.enabled && (
              <span
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-zinc-200/80 mr-1"
                style={{ color: colors.texto }}
                title={schedule.alwaysOpen ? 'Abierto 24/7' : schedule.text}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{schedule.alwaysOpen ? '24/7' : 'En línea'}</span>
              </span>
            )}

            {/* Expandable Inline Search */}
            {searchOpen || searchQuery ? (
              <div className="relative flex items-center w-48 sm:w-64 animate-in fade-in duration-200">
                <Search className="absolute left-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar en la colección..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    if (e.target.value && activeNavTab !== 'Productos') {
                      setActiveNavTab('Productos')
                    }
                  }}
                  className="w-full bg-[#F6F6F4] border border-transparent rounded-full py-2 pl-9 pr-8 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchOpen(false)
                  }}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-900 cursor-pointer bg-transparent border-0 p-0"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-full hover:bg-zinc-100/80 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-0"
                style={{ color: colors.texto }}
                aria-label="Buscar"
                title="Buscar productos"
              >
                <Search className="w-[19px] h-[19px] stroke-[1.6]" />
              </button>
            )}

            {/* Direct WhatsApp Concierge Icon */}
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${store.name}, me gustaría recibir asesoría.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full hover:bg-zinc-100/80 flex items-center justify-center transition-colors no-underline"
                style={{ color: colors.texto }}
                title="Atención por WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-[19px] h-[19px] stroke-[1.6]" />
              </a>
            )}

            {/* Minimalist Shopping Bag Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative h-9 px-2 rounded-full hover:bg-zinc-100/80 flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-0"
              style={{ color: colors.texto }}
              aria-label="Abrir bolsa de compras"
            >
              <ShoppingBag className="w-[19px] h-[19px] stroke-[1.6]" />
              <span
                className={cn(
                  'text-[11px] font-bold tabular-nums',
                  itemsInCart > 0
                    ? 'min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black'
                    : 'opacity-70'
                )}
                style={
                  itemsInCart > 0
                    ? { backgroundColor: colors.primario, color: '#FFFFFF' }
                    : undefined
                }
              >
                {itemsInCart}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
