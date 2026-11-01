'use client'

import React from 'react'
import { Truck } from 'lucide-react'
import { SiVisa, SiMastercard } from 'react-icons/si'
import { Store, CatalogSettings, Product } from '../types'
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from '../common/SocialIcons'

export interface CatalogDesktopFooterProps {
  store: Store
  formattedStoreName: string
  socialsShowInCatalog: boolean
  aiSettings: CatalogSettings
  setSelectedProduct: (p: Product | null) => void
  setActiveNavTab: (tab: string) => void
}

export function CatalogDesktopFooter({
  store,
  formattedStoreName,
  socialsShowInCatalog,
  aiSettings,
  setSelectedProduct,
  setActiveNavTab
}: CatalogDesktopFooterProps) {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-300 py-12 px-6 border-t border-zinc-900 select-none mt-auto">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
        <div className="space-y-4">
          <span className="font-black text-lg tracking-wider text-white uppercase">{formattedStoreName}</span>
          <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
            {store.bio || 'Tu tienda online de confianza con envíos garantizados y atención directa por WhatsApp.'}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Enlaces Rápidos</h4>
          <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-300">
            <span onClick={() => { setSelectedProduct(null); setActiveNavTab('Inicio'); }} className="hover:text-white cursor-pointer transition-colors">Inicio</span>
            <span onClick={() => { setSelectedProduct(null); setActiveNavTab('Productos'); }} className="hover:text-white cursor-pointer transition-colors">Productos</span>
            <span onClick={() => { setSelectedProduct(null); setActiveNavTab('Historia'); }} className="hover:text-white cursor-pointer transition-colors">Sobre Nosotros</span>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Certificaciones</h4>
          <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
            ISO 22000 • HACCP • Certificación Halal. Máximos estándares de calidad internacional.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Métodos de Pago</h4>
          <div className="flex gap-2.5 flex-wrap items-center">
            <div className="bg-white px-2.5 py-1 rounded flex items-center justify-center h-7 shadow-sm">
              <SiVisa className="h-4.5 w-auto text-[#1A1F71]" style={{ minWidth: '28px' }} />
            </div>
            <div className="bg-white px-2.5 py-1 rounded flex items-center justify-center h-7 shadow-sm">
              <SiMastercard className="h-5 w-auto text-[#EB001B]" style={{ minWidth: '24px' }} />
            </div>
            <div className="bg-emerald-600/90 text-white border border-emerald-500/25 px-2.5 py-1 rounded flex items-center justify-center gap-1.5 h-7 text-[10px] font-bold shadow-sm">
              <Truck className="w-3.5 h-3.5" />
              <span>Contra Entrega</span>
            </div>
          </div>
          
          {socialsShowInCatalog && (
            <div className="space-y-2 pt-2">
              <h4 className="font-extrabold text-[10px] text-white/50 uppercase tracking-wider">Síguenos</h4>
              <div className="flex gap-2.5">
                {aiSettings.socials?.instagram && (
                  <a href={aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="Instagram">
                    <InstagramIcon />
                  </a>
                )}
                {aiSettings.socials?.facebook && (
                  <a href={aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="Facebook">
                    <FacebookIcon />
                  </a>
                )}
                {aiSettings.socials?.twitter && (
                  <a href={aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="Twitter / X">
                    <TwitterIcon />
                  </a>
                )}
                {aiSettings.socials?.tiktok && (
                  <a href={aiSettings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="TikTok">
                    <TikTokIcon />
                  </a>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-zinc-400 font-bold">© {new Date().getFullYear()} {formattedStoreName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
