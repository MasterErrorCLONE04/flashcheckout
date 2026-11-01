'use client'

import React from 'react'
import { ShoppingCart, Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Store, NavLink, CatalogSettings } from '../types'
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from '../common/SocialIcons'

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
  radiusBadge,
  schedule,
  announcement,
  navbarLinks,
  activeNavTab,
  setActiveNavTab,
  handleNavbarLinkClick,
  socialsShowInCatalog,
  aiSettings,
  searchQuery,
  setSearchQuery,
  setIsCartOpen,
  itemsInCart,
  total
}: CatalogDesktopHeaderProps) {
  return (
    <>
      {/* Barra de anuncios (Desktop) */}
      {announcement?.enabled && announcement?.text && (
        <div 
          className="w-full text-center py-2 px-4 text-xs font-bold leading-tight select-none shrink-0"
          style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
        >
          {announcement.text}
        </div>
      )}

      {/* Cabecera Premium Rediseñada según headerStyle */}
      <header className={cn(
        "transition-all duration-300 z-50 select-none shrink-0 w-full",
        headerStyle === 'floating-glass' 
          ? "sticky top-3.5 max-w-[1300px] mx-auto px-6 h-[72px] bg-white/85 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-sm mb-2" 
          : headerStyle === 'editorial-centered'
            ? "sticky top-0 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 shadow-none"
            : "sticky top-0 bg-white/95 backdrop-blur-md border-b border-zinc-150 h-[76px] shadow-none"
      )}>
        <div className={cn(
          "max-w-[1300px] mx-auto w-full h-full flex items-center justify-between gap-6",
          headerStyle === 'floating-glass' ? "px-0" : "px-6"
        )}>
          
          {/* Logo o Nombre de la Tienda */}
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={store.logoUrl} alt={formattedStoreName} className="h-8 max-w-[120px] object-contain shrink-0 rounded-md" />
                <span className="font-black text-sm uppercase tracking-tight" style={{ color: colors.texto }}>{formattedStoreName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]"
                  style={{ backgroundColor: `${colors.primario}15`, color: colors.primario, border: `1px solid ${colors.primario}30` }}
                >
                  ☕
                </div>
                <span className="font-black text-sm uppercase tracking-tight" style={{ color: colors.texto }}>{formattedStoreName}</span>
              </div>
            )}

            {/* Schedule Badge (Desktop) */}
            {schedule?.enabled && (
              <div className="relative group shrink-0 select-none">
                <span 
                  className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold cursor-pointer", radiusBadge)}
                  style={{ backgroundColor: `${colors.primario}14`, color: colors.primario }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.acento || colors.primario }} />
                  <span>{schedule.alwaysOpen ? 'Abierto 24/7' : 'Abierto'}</span>
                </span>
                
                {!schedule.alwaysOpen && (
                  <div className="absolute left-0 mt-1.5 hidden group-hover:block bg-zinc-900 text-white text-[9px] font-bold rounded px-2.5 py-1.5 whitespace-nowrap shadow-lg z-50 animate-in fade-in duration-200">
                    Horario: {schedule.text}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enlaces de Navegación del Rediseño */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-bold text-zinc-500">
            {navbarLinks.map((item, idx: number) => {
              const isActive = activeNavTab === item.label;
              return (
                <span
                  key={idx}
                  onClick={() => {
                    setActiveNavTab(item.label)
                    handleNavbarLinkClick(item)
                  }}
                  className={cn(
                    "cursor-pointer hover:text-zinc-900 transition-all pb-1 relative",
                    isActive ? "text-zinc-950 border-b-2 border-emerald-600 font-extrabold" : "text-zinc-500"
                  )}
                >
                  {item.label}
                </span>
              )
            })}
          </nav>

          {/* Buscador y Carrito */}
          <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
            
            {/* Redes Sociales en cabecera (Desktop) */}
            {socialsShowInCatalog && (
              <div className="flex items-center gap-1.5 shrink-0">
                {aiSettings.socials?.instagram && (
                  <a 
                    href={aiSettings.socials.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                    title="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {aiSettings.socials?.facebook && (
                  <a 
                    href={aiSettings.socials.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                    title="Facebook"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {aiSettings.socials?.twitter && (
                  <a 
                    href={aiSettings.socials.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                    title="Twitter / X"
                  >
                    <TwitterIcon />
                  </a>
                )}
                {aiSettings.socials?.tiktok && (
                  <a 
                    href={aiSettings.socials.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                    title="TikTok"
                  >
                    <TikTokIcon />
                  </a>
                )}
              </div>
            )}

            {/* Buscador Compacto */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-10 pr-4 text-xs font-semibold text-zinc-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            {/* Botón Carrito */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 h-9.5 px-3 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-all active:scale-95 shrink-0 relative border-0 cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-zinc-700" />
                <span className="absolute -top-2.5 -right-2.5 bg-[#10B981] text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                  {itemsInCart}
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none text-left">
                <span className="text-[10px] font-bold text-zinc-800">Carrito</span>
                <span className="text-[9px] text-zinc-500 font-bold mt-0.5" suppressHydrationWarning={true}>
                  ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </span>
              </div>
            </button>

          </div>

        </div>
      </header>
    </>
  )
}
