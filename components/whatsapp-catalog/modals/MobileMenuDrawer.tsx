'use client'

import React from 'react'
import { X, ChevronRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Store, NavLink, CatalogSettings } from '../types'
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
  aiSettings,
}: MobileMenuDrawerProps) {
  if (!isOpen) return null

  const cleanPhone = (initialPhone || store.whatsapp || '').replace(/\D/g, '')

  return (
    <div className={cn('inset-0 z-50 flex lg:hidden', device ? 'absolute' : 'fixed')}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity',
          device ? 'absolute' : 'fixed'
        )}
      />

      {/* Menu Panel */}
      <div className="relative flex w-full max-w-[290px] flex-col bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Clean Editorial Header */}
        <div className="px-5 py-4 border-b border-[#EAEAE8] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={formattedStoreName}
                className="h-6 max-w-[110px] object-contain shrink-0"
              />
            ) : (
              <span className="font-black text-[18px] text-[#111111] tracking-[-0.045em] lowercase leading-none truncate">
                {formattedStoreName.toLowerCase()}
                <sup className="text-[9px] font-bold ml-0.5">®</sup>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="w-8 h-8 rounded-full hover:bg-[#F6F6F4] flex items-center justify-center text-[#111111] cursor-pointer border-0 bg-transparent"
          >
            <X className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-left">
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
              Colecciones
            </h4>
            <div className="space-y-1">
              {categories.map(cat => {
                const isActive = selectedCategory === cat
                const count =
                  cat === 'Todos' ? store.products.length : categoryCounts[cat] || 0

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat)
                      onClose()
                      document
                        .getElementById('mobile-categories-row')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={cn(
                      'w-full flex items-center justify-between py-2.5 px-3 rounded-[4px] text-[12.5px] transition-all text-left cursor-pointer border-0',
                      isActive
                        ? 'text-[#111111] bg-[#F6F6F4] font-bold'
                        : 'text-[#52525B] hover:text-[#111111] bg-transparent hover:bg-[#F6F6F4]/60 font-medium'
                    )}
                  >
                    <span>{cat === 'Todos' ? 'Todos los productos' : cat}</span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] tabular-nums',
                        isActive
                          ? 'bg-[#111111] text-white'
                          : 'text-[#71717A] bg-[#F6F6F4]'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Navbar Links */}
          <div className="space-y-2.5 pt-4 border-t border-[#EAEAE8]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
              Explorar
            </h4>
            <div className="space-y-0.5">
              {navbarLinks.map((item, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onClose()
                    handleNavbarLinkClick(item)
                  }}
                  className="w-full flex items-center justify-between py-2 px-2 text-[13px] font-semibold text-[#111111] hover:bg-[#F6F6F4] rounded-[4px] text-left cursor-pointer border-0 bg-transparent"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA]" />
                </button>
              ))}
            </div>
          </div>

          {cleanPhone && (
            <div className="space-y-2.5 pt-4 border-t border-[#EAEAE8]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
                Atención directa
              </h4>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#111111] text-white text-[11px] font-bold uppercase tracking-[0.06em] no-underline"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>
          )}

          {/* Schedule Info */}
          {schedule?.enabled && (
            <div className="space-y-2 pt-4 border-t border-[#EAEAE8] text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
                Horario
              </h4>
              <div className="px-3 py-2 bg-[#F6F6F4] rounded-[4px] text-[#111111] text-[11.5px] font-medium">
                {schedule.alwaysOpen ? 'Tienda abierta 24/7' : schedule.text}
              </div>
            </div>
          )}

          {/* Socials Links */}
          {socialsShowInCatalog &&
            (aiSettings.socials?.instagram ||
              aiSettings.socials?.facebook ||
              aiSettings.socials?.twitter ||
              aiSettings.socials?.tiktok) && (
              <div className="space-y-2.5 pt-4 border-t border-[#EAEAE8] text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717A]">
                  Comunidad
                </h4>
                <div className="flex gap-2">
                  {aiSettings.socials?.instagram && (
                    <a
                      href={aiSettings.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full border border-[#E5E5E3] bg-white hover:border-[#111111] flex items-center justify-center text-[#111111] transition-all"
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
                      className="w-8 h-8 rounded-full border border-[#E5E5E3] bg-white hover:border-[#111111] flex items-center justify-center text-[#111111] transition-all"
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
                      className="w-8 h-8 rounded-full border border-[#E5E5E3] bg-white hover:border-[#111111] flex items-center justify-center text-[#111111] transition-all"
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
                      className="w-8 h-8 rounded-full border border-[#E5E5E3] bg-white hover:border-[#111111] flex items-center justify-center text-[#111111] transition-all"
                      title="TikTok"
                    >
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
