'use client'

import React from 'react'
import { X, Sprout, ChevronRight, MessageCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Store, NavLink, CatalogSettings, getCategoryIcon } from '../types'
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from '../common/SocialIcons'

export interface MobileMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  device?: string
  store: Store
  formattedStoreName: string
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  categoryCounts: Record<string, number>
  navbarLinks: NavLink[]
  handleNavbarLinkClick: (link: NavLink) => void
  initialPhone?: string
  schedule?: CatalogSettings['schedule']
  socialsShowInCatalog?: boolean
  aiSettings: CatalogSettings
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  device,
  store,
  formattedStoreName,
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  navbarLinks,
  handleNavbarLinkClick,
  initialPhone,
  schedule,
  socialsShowInCatalog,
  aiSettings
}: MobileMenuDrawerProps) {
  if (!isOpen) return null

  return (
    <div className={cn("inset-0 z-50 flex lg:hidden", !!device ? "absolute" : "fixed")}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={cn("inset-0 bg-black/40 backdrop-blur-sm transition-opacity", !!device ? "absolute" : "fixed")}
      />
      {/* Menu Panel */}
      <div className="relative flex w-full max-w-[280px] flex-col bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 overflow-hidden">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={formattedStoreName} className="w-full h-full object-cover" />
              ) : (
                <Sprout className="w-4.5 h-4.5" />
              )}
            </div>
            <span className="font-bold text-xs text-zinc-900 tracking-tight">{formattedStoreName}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-650 cursor-pointer border-none bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-left">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Categorías</h4>
            <div className="space-y-1">
              {categories.map(cat => {
                const Icon = getCategoryIcon(cat)
                const isActive = selectedCategory === cat
                const count = cat === 'Todos' ? store.products.length : categoryCounts[cat] || 0

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat)
                      onClose()
                      document.getElementById('mobile-categories-row')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={cn(
                      "w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer",
                      isActive
                        ? "text-emerald-700 bg-emerald-50/50 font-bold border-l-2 border-emerald-500 rounded-l-none"
                        : "text-zinc-600 hover:text-zinc-900 border-l-2 border-transparent hover:bg-zinc-50/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat === 'Todos' ? 'Todos los productos' : cat}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                      isActive ? "bg-emerald-100 text-emerald-800" : "text-zinc-400 bg-zinc-100"
                    )}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Navbar Links (Mobile menu) */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Navegación</h4>
            <div className="space-y-1">
              {navbarLinks.map((item, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    onClose()
                    handleNavbarLinkClick(item)
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 rounded-lg text-left cursor-pointer border-0 bg-transparent"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Contacto</h4>
            <a 
              href={`https://wa.me/${initialPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50/50 rounded-lg"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 fill-current" />
              <span>Comprar por WhatsApp</span>
            </a>
          </div>

          {/* Schedule Info (Mobile menu) */}
          {schedule?.enabled && (
            <div className="space-y-2 pt-4 border-t border-zinc-100 text-left">
              <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Horario de atención</h4>
              <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-150 rounded-lg text-zinc-700 text-[11px] font-semibold">
                {schedule.alwaysOpen ? 'Abierto las 24 horas (Siempre abierto)' : schedule.text}
              </div>
            </div>
          )}

          {/* Socials Links (Mobile menu) */}
          {socialsShowInCatalog && (aiSettings.socials?.instagram || aiSettings.socials?.facebook || aiSettings.socials?.twitter || aiSettings.socials?.tiktok) && (
            <div className="space-y-2 pt-4 border-t border-zinc-100 text-left">
              <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Redes sociales</h4>
              <div className="flex gap-2 px-1">
                {aiSettings.socials?.instagram && (
                  <a href={aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="Instagram">
                    <InstagramIcon />
                  </a>
                )}
                {aiSettings.socials?.facebook && (
                  <a href={aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="Facebook">
                    <FacebookIcon />
                  </a>
                )}
                {aiSettings.socials?.twitter && (
                  <a href={aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="Twitter / X">
                    <TwitterIcon />
                  </a>
                )}
                {aiSettings.socials?.tiktok && (
                  <a href={aiSettings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="TikTok">
                    <TikTokIcon />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
