'use client'

import React from 'react'
import { Home, LayoutGrid, Search, ShoppingCart, Truck } from 'lucide-react'
import { SiVisa, SiMastercard } from 'react-icons/si'
import { cn } from "@/lib/utils"
import { CatalogSettings } from '../types'
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from '../common/SocialIcons'

export interface MobileFooterProps {
  activeNavTab: string
  formattedStoreName: string
  socialsShowInCatalog: boolean
  aiSettings: CatalogSettings
  device?: string
  activeMobileTab: string
  handleMobileTabClick: (tab: string) => void
  itemsInCart: number
}

export function MobileFooter({
  activeNavTab,
  formattedStoreName,
  socialsShowInCatalog,
  aiSettings,
  device,
  activeMobileTab,
  handleMobileTabClick,
  itemsInCart
}: MobileFooterProps) {
  return (
    <>
      {/* Premium Footer (Mobile) */}
      {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
        <footer className="pt-8 border-t border-zinc-150 shrink-0 text-left pb-16 select-none">
          <div className="space-y-4">
            <span className="font-black text-sm text-zinc-900 uppercase tracking-wider">{formattedStoreName}</span>
            
            {socialsShowInCatalog && (
              <div className="flex gap-3 text-zinc-400">
                {aiSettings.socials?.instagram && (
                  <a href={aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Instagram">
                    <InstagramIcon />
                  </a>
                )}
                {aiSettings.socials?.facebook && (
                  <a href={aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Facebook">
                    <FacebookIcon />
                  </a>
                )}
                {aiSettings.socials?.twitter && (
                  <a href={aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Twitter / X">
                    <TwitterIcon />
                  </a>
                )}
                {aiSettings.socials?.tiktok && (
                  <a href={aiSettings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="TikTok">
                    <TikTokIcon />
                  </a>
                )}
              </div>
            )}

            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
              © {new Date().getFullYear()} {formattedStoreName}. Todos los derechos reservados.
            </p>
            <div className="flex gap-2 items-center">
              <div className="bg-white px-2 py-0.5 rounded border border-zinc-200/80 flex items-center justify-center h-5.5 shadow-xs">
                <SiVisa className="h-3.5 w-auto text-[#1A1F71]" style={{ minWidth: '18px' }} />
              </div>
              <div className="bg-white px-2 py-0.5 rounded border border-zinc-200/80 flex items-center justify-center h-5.5 shadow-xs">
                <SiMastercard className="h-3.5 w-auto text-[#EB001B]" style={{ minWidth: '18px' }} />
              </div>
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded flex items-center justify-center gap-1 h-5.5 text-[8px] font-bold shadow-xs">
                <Truck className="w-2.5 h-2.5" />
                <span>Contra Entrega</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* BOTTOM NAVIGATION BAR FOR MOBILE (Mockup Móvil) */}
      <div className={cn(
        (device === 'tablet' || device === 'movil') ? "absolute" : "fixed",
        "bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-150 h-16 flex items-center justify-around shadow-none px-4 select-none"
      )}>
        <button 
          type="button"
          onClick={() => handleMobileTabClick('inicio')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
        >
          <Home className={cn("w-5 h-5 transition-colors", activeMobileTab === 'inicio' ? "text-emerald-600" : "text-zinc-400")} />
          <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'inicio' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Inicio</span>
        </button>
        
        <button 
          type="button"
          onClick={() => handleMobileTabClick('categorias')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
        >
          <LayoutGrid className={cn("w-5 h-5 transition-colors", activeMobileTab === 'categorias' ? "text-emerald-600" : "text-zinc-400")} />
          <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'categorias' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Categorías</span>
        </button>
        
        <button 
          type="button"
          onClick={() => handleMobileTabClick('buscar')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
        >
          <Search className={cn("w-5 h-5 transition-colors", activeMobileTab === 'buscar' ? "text-emerald-600" : "text-zinc-400")} />
          <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'buscar' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Buscar</span>
        </button>
        
        <button 
          type="button"
          onClick={() => handleMobileTabClick('carrito')}
          className="flex flex-col items-center gap-1 cursor-pointer relative bg-transparent border-0 outline-none"
        >
          <div className="relative">
            <ShoppingCart className={cn("w-5 h-5 transition-colors", activeMobileTab === 'carrito' ? "text-emerald-600" : "text-zinc-400")} />
            {itemsInCart > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                {itemsInCart}
              </span>
            )}
          </div>
          <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'carrito' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Carrito</span>
        </button>
      </div>
    </>
  )
}
