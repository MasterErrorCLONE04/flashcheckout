'use client'

import React, { useState } from 'react'
import { Home, LayoutGrid, Search, ShoppingBag, Truck, X } from 'lucide-react'
import { SiVisa, SiMastercard } from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from '../common/SocialIcons'

export interface MobileFooterProps {
  activeNavTab: string
  formattedStoreName: string
  settings: CatalogResolvedSettings
  device?: string
  activeMobileTab: string
  handleMobileTabClick: (tab: string) => void
  itemsInCart: number
}

export function MobileFooter({
  activeNavTab,
  formattedStoreName,
  settings,
  device,
  activeMobileTab,
  handleMobileTabClick,
  itemsInCart,
}: MobileFooterProps) {
  const { socialsShowInCatalog, aiSettings, newsletterWidget, sections, policies, paymentMethods } =
    settings

  const [openPolicy, setOpenPolicy] = useState<'refunds' | 'terms' | null>(null)
  const [email, setEmail] = useState('')

  return (
    <>
      {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
        <footer className="pt-8 border-t border-zinc-200 shrink-0 text-left pb-16 select-none space-y-7">
          {/* Centered Giant Wordmark + Socials */}
          <div className="text-center space-y-3">
            <div className="text-3xl font-black text-zinc-950 tracking-[-0.04em] lowercase">
              {formattedStoreName.toLowerCase()}
              <sup className="text-xs font-bold ml-0.5">®</sup>
            </div>

            {socialsShowInCatalog && (
              <div className="flex items-center justify-center gap-4 text-zinc-700">
                {aiSettings.socials?.instagram && (
                  <a
                    href={aiSettings.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-950"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {aiSettings.socials?.facebook && (
                  <a
                    href={aiSettings.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-950"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {aiSettings.socials?.tiktok && (
                  <a
                    href={aiSettings.socials.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-950"
                  >
                    <TikTokIcon />
                  </a>
                )}
                {aiSettings.socials?.twitter && (
                  <a
                    href={aiSettings.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-950"
                  >
                    <TwitterIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Bordered Architectural Newsletter Card (Mobile) */}
          {sections.newsletterWidget !== false && (
            <div className="border border-[#111111] rounded-[4px] p-5 space-y-3 bg-white">
              <h4 className="text-[14px] font-extrabold text-[#111111] leading-snug tracking-[-0.015em]">
                {newsletterWidget.title}
              </h4>
              <p className="text-[11.5px] text-[#52525B] leading-relaxed">
                {newsletterWidget.subtitle}
              </p>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  toast.success('¡Suscripción confirmada! Recibirás nuestras novedades.')
                  setEmail('')
                }}
                className="space-y-2.5"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={newsletterWidget.placeholder || 'Correo electrónico'}
                  className="w-full border border-[#D4D4D2] rounded-[4px] px-3.5 py-2.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-full bg-[#111111] text-white font-bold text-[10.5px] uppercase tracking-[0.08em] border-0 cursor-pointer"
                >
                  {newsletterWidget.btnText || 'Suscribirme'}
                </button>
              </form>
            </div>
          )}

          {/* Legal & Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-normal text-[#52525B]">
            <button
              type="button"
              onClick={() => setOpenPolicy('refunds')}
              className="bg-transparent border-0 p-0 text-[#52525B] hover:text-[#111111] underline cursor-pointer"
            >
              Cambios y devoluciones
            </button>
            <button
              type="button"
              onClick={() => setOpenPolicy('terms')}
              className="bg-transparent border-0 p-0 text-[#52525B] hover:text-[#111111] underline cursor-pointer"
            >
              Términos y condiciones
            </button>
          </div>

          {/* Country + Payment Badges */}
          <div className="pt-4 border-t border-[#EAEAE8] flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[#D4D4D2] text-[11px] font-medium text-[#111111]">
              <span>🇨🇴</span>
              <span>Colombia (COP $)</span>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 items-center">
              {paymentMethods.tarjetas && (
                <>
                  <div className="bg-white px-2 rounded-[3px] border border-[#E5E5E3] flex items-center justify-center h-6">
                    <SiVisa className="h-3 w-auto text-[#1A1F71]" />
                  </div>
                  <div className="bg-white px-2 rounded-[3px] border border-[#E5E5E3] flex items-center justify-center h-6">
                    <SiMastercard className="h-3 w-auto text-[#EB001B]" />
                  </div>
                </>
              )}
              {paymentMethods.nequi && (
                <span className="h-6 px-2 rounded-[3px] border border-[#E5E5E3] bg-white inline-flex items-center text-[9px] font-black tracking-tight text-[#210049]">
                  Nequi
                </span>
              )}
              {paymentMethods.pse && (
                <span className="h-6 px-2 rounded-[3px] border border-[#E5E5E3] bg-white inline-flex items-center text-[9px] font-black tracking-wider text-[#0033A0]">
                  PSE
                </span>
              )}
              {paymentMethods.contraEntrega && (
                <span className="bg-white border border-[#E5E5E3] text-[#111111] px-2 rounded-[3px] inline-flex items-center gap-1 h-6 text-[9px] font-bold">
                  <Truck className="w-2.5 h-2.5" />
                  <span>Contra entrega</span>
                </span>
              )}
            </div>

            <p className="text-[10px] text-[#71717A]">
              © {new Date().getFullYear()} {formattedStoreName}
            </p>
          </div>
        </footer>
      )}

      {/* Policy Modal */}
      {openPolicy && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setOpenPolicy(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-5 space-y-3 text-left shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h4 className="font-black text-sm text-zinc-950">
                {openPolicy === 'refunds'
                  ? 'Política de Cambios y Reembolsos'
                  : 'Términos y Condiciones'}
              </h4>
              <button
                type="button"
                onClick={() => setOpenPolicy(null)}
                className="p-1 bg-transparent border-0 text-zinc-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
              {openPolicy === 'refunds' ? policies.refunds : policies.terms}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Mobile App Navigation Bar */}
      <div
        className={cn(
          device === 'tablet' || device === 'movil' ? 'absolute' : 'fixed',
          'bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 h-15 flex items-center justify-around px-4 select-none'
        )}
      >
        <button
          type="button"
          onClick={() => handleMobileTabClick('inicio')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
        >
          <Home
            className={cn(
              'w-4.5 h-4.5',
              activeMobileTab === 'inicio' ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-400'
            )}
          />
          <span
            className={cn(
              'text-[9px]',
              activeMobileTab === 'inicio' ? 'text-zinc-950 font-bold' : 'text-zinc-400 font-medium'
            )}
          >
            Inicio
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleMobileTabClick('categorias')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
        >
          <LayoutGrid
            className={cn(
              'w-4.5 h-4.5',
              activeMobileTab === 'categorias' ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-400'
            )}
          />
          <span
            className={cn(
              'text-[9px]',
              activeMobileTab === 'categorias'
                ? 'text-zinc-950 font-bold'
                : 'text-zinc-400 font-medium'
            )}
          >
            Colecciones
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleMobileTabClick('buscar')}
          className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
        >
          <Search
            className={cn(
              'w-4.5 h-4.5',
              activeMobileTab === 'buscar' ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-400'
            )}
          />
          <span
            className={cn(
              'text-[9px]',
              activeMobileTab === 'buscar' ? 'text-zinc-950 font-bold' : 'text-zinc-400 font-medium'
            )}
          >
            Buscar
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleMobileTabClick('carrito')}
          className="flex flex-col items-center gap-1 cursor-pointer relative bg-transparent border-0 outline-none"
        >
          <div className="relative">
            <ShoppingBag
              className={cn(
                'w-4.5 h-4.5',
                activeMobileTab === 'carrito' ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-400'
              )}
            />
            {itemsInCart > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-zinc-950 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemsInCart}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-[9px]',
              activeMobileTab === 'carrito' ? 'text-zinc-950 font-bold' : 'text-zinc-400 font-medium'
            )}
          >
            Bolsa
          </span>
        </button>
      </div>
    </>
  )
}
