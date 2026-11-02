'use client'

import React, { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { SiVisa, SiMastercard } from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Store, Product } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon } from '../common/SocialIcons'

export interface CatalogDesktopFooterProps {
  store: Store
  settings: CatalogResolvedSettings
  setSelectedProduct: (p: Product | null) => void
  setActiveNavTab: (tab: string) => void
}

export function CatalogDesktopFooter({
  store,
  settings,
  setSelectedProduct,
  setActiveNavTab,
}: CatalogDesktopFooterProps) {
  const {
    formattedStoreName,
    socialsShowInCatalog,
    aiSettings,
    colors,
    sections,
    newsletterWidget,
    paymentMethods,
    policies,
    schedule,
  } = settings

  const [policyModal, setPolicyModal] = useState<'refunds' | 'terms' | null>(null)
  const [subName, setSubName] = useState('')
  const [subEmail, setSubEmail] = useState('')

  const isDarkCanvas =
    colors.fondo.toLowerCase() === '#0b0f19' || colors.fondo.toLowerCase() === '#09090b'

  const categories = Array.from(
    new Set(store.products.map(p => (p.category || '').trim()).filter(Boolean))
  ).slice(0, 5)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subEmail.trim()) return
    toast.success(
      `¡Gracias por suscribirte${subName ? `, ${subName}` : ''}! Recibirás nuestras novedades.`
    )
    setSubName('')
    setSubEmail('')
  }

  return (
    <>
      <footer
        className={cn(
          'w-full border-t select-none mt-auto',
          isDarkCanvas
            ? 'bg-zinc-950 text-zinc-200 border-zinc-800'
            : 'bg-white text-zinc-900 border-zinc-200/80'
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-16 pb-14">
          {/* Monumental Centered Brand Wordmark + Social Icons (Exact Waterdrop Proportions) */}
          <div className="flex flex-col items-center text-center space-y-5 mb-16">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={formattedStoreName}
                className="h-14 max-w-[240px] object-contain"
              />
            ) : (
              <span
                className="font-black text-[48px] sm:text-[64px] tracking-[-0.055em] lowercase leading-none"
                style={{ color: colors.texto }}
              >
                {store.name.trim().toLowerCase()}
                <sup className="text-base font-bold ml-1 opacity-65">®</sup>
              </span>
            )}

            {socialsShowInCatalog && (
              <div className="flex items-center gap-5 pt-1">
                {aiSettings.socials?.facebook && (
                  <a
                    href={aiSettings.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-60 transition-opacity"
                    style={{ color: colors.texto }}
                    title="Facebook"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {aiSettings.socials?.instagram && (
                  <a
                    href={aiSettings.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-60 transition-opacity"
                    style={{ color: colors.texto }}
                    title="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {aiSettings.socials?.tiktok && (
                  <a
                    href={aiSettings.socials.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-60 transition-opacity"
                    style={{ color: colors.texto }}
                    title="TikTok"
                  >
                    <TikTokIcon />
                  </a>
                )}
                {aiSettings.socials?.twitter && (
                  <a
                    href={aiSettings.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-60 transition-opacity"
                    style={{ color: colors.texto }}
                    title="X / Twitter"
                  >
                    <TwitterIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 4-Column Editorial Footer Grid (3 Nav Columns + 1 Crisp Black-Bordered Newsletter Card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 text-left items-start">
            {/* Col 1: Explorar */}
            <div className="lg:col-span-3 space-y-3.5">
              <h4
                className="font-extrabold text-[13px] tracking-[-0.01em]"
                style={{ color: colors.texto }}
              >
                Explorar {formattedStoreName}
              </h4>
              <ul className="space-y-2.5 text-[12.5px] font-normal text-zinc-600 list-none p-0 m-0">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null)
                      setActiveNavTab('Inicio')
                    }}
                    className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-zinc-600"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null)
                      setActiveNavTab('Productos')
                    }}
                    className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-zinc-600"
                  >
                    Toda la colección
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null)
                        setActiveNavTab('Productos')
                      }}
                      className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-zinc-600"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null)
                      setActiveNavTab('Historia')
                    }}
                    className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-zinc-600"
                  >
                    Nuestra misión
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 2: Atención & Soporte */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4
                className="font-extrabold text-[13px] tracking-[-0.01em]"
                style={{ color: colors.texto }}
              >
                Información
              </h4>
              <ul className="space-y-2.5 text-[12.5px] font-normal text-zinc-600 list-none p-0 m-0">
                {store.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${store.name}, necesito ayuda con un pedido.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors no-underline text-zinc-600"
                    >
                      Centro de ayuda WhatsApp
                    </a>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null)
                      setActiveNavTab('Inicio')
                      setTimeout(() => {
                        document
                          .getElementById('catalog-faqs')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }, 80)
                    }}
                    className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-zinc-600"
                  >
                    Preguntas frecuentes
                  </button>
                </li>
                {schedule?.enabled && (
                  <li className="text-xs text-zinc-500 pt-1">
                    {schedule.alwaysOpen ? 'Atención activa 24/7' : schedule.text}
                  </li>
                )}
                {aiSettings.info?.address && (
                  <li className="text-xs text-zinc-500">{aiSettings.info.address}</li>
                )}
              </ul>
            </div>

            {/* Col 3: Políticas Reales Configuradas */}
            <div className="lg:col-span-3 space-y-3.5">
              <h4
                className="font-extrabold text-[13px] tracking-[-0.01em]"
                style={{ color: colors.texto }}
              >
                Legal & Garantías
              </h4>
              <ul className="space-y-2.5 text-[12.5px] font-normal text-zinc-600 list-none p-0 m-0">
                <li>
                  <button
                    type="button"
                    onClick={() => setPolicyModal('refunds')}
                    className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-left text-zinc-600"
                  >
                    Política de cambios y devoluciones
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setPolicyModal('terms')}
                    className="hover:text-zinc-950 hover:underline underline-offset-3 transition-colors cursor-pointer bg-transparent border-0 p-0 text-left text-zinc-600"
                  >
                    Términos y condiciones del servicio
                  </button>
                </li>
              </ul>
              {store.bio && (
                <p className="text-xs text-zinc-400 leading-relaxed pt-2 max-w-xs">
                  {store.bio}
                </p>
              )}
            </div>

            {/* Col 4: Exact Waterdrop 1px Black-Bordered Architectural Newsletter Card */}
            {sections.newsletterWidget && (
              <div className="lg:col-span-4">
                <div
                  className={cn(
                    'rounded-[4px] border p-7 space-y-4',
                    isDarkCanvas
                      ? 'bg-zinc-900 border-zinc-700'
                      : 'bg-white border-zinc-950'
                  )}
                >
                  <div className="space-y-1.5">
                    <h4
                      className="font-extrabold text-[15px] leading-snug tracking-[-0.02em]"
                      style={{ color: colors.texto }}
                    >
                      {newsletterWidget.title}
                    </h4>
                    <p className="text-xs font-normal text-zinc-600 leading-relaxed">
                      {newsletterWidget.subtitle}
                    </p>
                  </div>

                  <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={subName}
                        onChange={e => setSubName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full bg-white border border-zinc-300 rounded-[4px] px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={subEmail}
                        onChange={e => setSubEmail(e.target.value)}
                        placeholder={newsletterWidget.placeholder || 'tu@correo.com'}
                        className="w-full bg-white border border-zinc-300 rounded-[4px] px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-full font-extrabold text-[11px] uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 cursor-pointer border-0 mt-1"
                      style={{ backgroundColor: colors.primario }}
                    >
                      {newsletterWidget.btnText || 'Suscribirme ahora'}
                    </button>
                    <p className="text-[10px] text-zinc-400 leading-snug pt-0.5">
                      Al suscribirte aceptas recibir novedades exclusivas. Cancela cuando quieras.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Locale Selector & Uniform Fintech Payment Marks Bar */}
        <div
          className={cn(
            'w-full border-t py-5 px-6 lg:px-12',
            isDarkCanvas
              ? 'bg-zinc-900/60 border-zinc-800'
              : 'bg-[#F4F4F3] border-zinc-200/80'
          )}
        >
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center justify-between gap-6 px-3.5 py-2 rounded-[4px] bg-white border border-zinc-300 text-xs font-semibold text-zinc-900 min-w-[210px]">
                <span className="inline-flex items-center gap-2">
                  <span>🇨🇴</span>
                  <span>Colombia (COP $)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <span className="text-[11px] font-normal text-zinc-500">
                © {new Date().getFullYear()} {formattedStoreName}. Todos los derechos reservados.
              </span>
            </div>

            {sections.paymentMethods !== false && paymentMethods.enabled && (
              <div className="flex flex-wrap items-center gap-1.5">
                {paymentMethods.tarjetas && (
                  <>
                    <span className="h-7 px-2.5 bg-white border border-zinc-200/90 rounded-[4px] flex items-center justify-center shadow-2xs">
                      <SiVisa className="h-3.5 w-auto text-[#1A1F71]" />
                    </span>
                    <span className="h-7 px-2.5 bg-white border border-zinc-200/90 rounded-[4px] flex items-center justify-center shadow-2xs">
                      <SiMastercard className="h-3.5 w-auto text-[#EB001B]" />
                    </span>
                  </>
                )}
                {paymentMethods.pse && (
                  <span className="h-7 px-2.5 bg-white border border-zinc-200/90 rounded-[4px] flex items-center justify-center text-[10px] font-black tracking-tight text-[#0F2C67] shadow-2xs">
                    PSE
                  </span>
                )}
                {paymentMethods.nequi && (
                  <span className="h-7 px-2.5 bg-white border border-zinc-200/90 rounded-[4px] flex items-center justify-center text-[10px] font-black tracking-tight text-[#200020] shadow-2xs">
                    Nequi
                  </span>
                )}
                {paymentMethods.bancolombia && (
                  <span className="h-7 px-2.5 bg-white border border-zinc-200/90 rounded-[4px] flex items-center justify-center text-[10px] font-black tracking-tight text-zinc-900 shadow-2xs">
                    Bancolombia
                  </span>
                )}
                {paymentMethods.contraEntrega && (
                  <span className="h-7 px-2.5 bg-white border border-zinc-200/90 rounded-[4px] flex items-center justify-center text-[10px] font-bold tracking-tight text-zinc-800 shadow-2xs">
                    Contra Entrega
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Live Legal Policy Modal */}
      {policyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="bg-white rounded-[6px] max-w-lg w-full p-7 space-y-4 shadow-2xl text-left border border-zinc-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h3 className="text-sm font-extrabold text-zinc-950 tracking-tight">
                {policyModal === 'refunds'
                  ? 'Política de Cambios y Devoluciones'
                  : 'Términos y Condiciones del Servicio'}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer border-0 bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs font-normal text-zinc-600 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {policyModal === 'refunds'
                ? policies.refunds?.trim() ||
                  `En ${formattedStoreName} respaldamos tu compra. Si deseas gestionar un cambio o novedad con tu pedido, escríbenos directamente a nuestro WhatsApp oficial indicando tu número de orden.`
                : policies.terms?.trim() ||
                  `Bienvenido a la tienda oficial de ${formattedStoreName}. Todos los precios están expresados en pesos colombianos (COP) y los despachos se coordinan con guía verificada hasta tu dirección.`}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
