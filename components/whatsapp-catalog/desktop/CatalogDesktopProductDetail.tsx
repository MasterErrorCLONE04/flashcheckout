'use client'

import React from 'react'
import {
  ArrowLeft,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product, Store, normalizeProductOptions } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogProductCard } from '../common/CatalogProductCard'

const SWATCH_COLOR_MAP: Record<string, string> = {
  negro: '#18181B',
  black: '#18181B',
  blanco: '#F8FAFC',
  white: '#F8FAFC',
  rojo: '#EF4444',
  azul: '#3B82F6',
  verde: '#10B981',
  menta: '#6EE7B7',
  amarillo: '#FACC15',
  naranja: '#FB923C',
  rosa: '#F472B6',
  rosado: '#F9A8D4',
  morado: '#A855F7',
  gris: '#9CA3AF',
  plata: '#CBD5E1',
  dorado: '#EAB308',
  oro: '#EAB308',
  beige: '#E7E5E4',
  crema: '#FEF3C7',
  cafe: '#78350F',
  marron: '#78350F',
  coral: '#FB7185',
  celeste: '#38BDF8',
  turquesa: '#2DD4BF',
  lavanda: '#C084FC',
  limon: '#BEF264',
  durazno: '#FDBA74',
}

function resolveColorHex(val: string): string | null {
  const clean = val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (clean.startsWith('#') && (clean.length === 4 || clean.length === 7)) return clean
  for (const [key, hex] of Object.entries(SWATCH_COLOR_MAP)) {
    if (clean.includes(key)) return hex
  }
  return null
}

export interface CatalogDesktopProductDetailProps {
  selectedProduct: Product
  setSelectedProduct: (p: Product | null) => void
  setActiveNavTab: (tab: string) => void
  productSku: string
  productImages: string[]
  currentDetailImg: string | null
  activeImageIdx: number
  setActiveImageIdx: React.Dispatch<React.SetStateAction<number>>
  selectedOptions: Record<string, string>
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
  qtyInCart: number
  selectedCartKey: string
  changeQtyByKey: (key: string, delta: number) => void
  cart: Record<string, number>
  settings: CatalogResolvedSettings
  store: Store
  onOpenCart: () => void
}

export function CatalogDesktopProductDetail({
  selectedProduct,
  setSelectedProduct,
  setActiveNavTab,
  productSku,
  productImages,
  currentDetailImg,
  activeImageIdx,
  setActiveImageIdx,
  selectedOptions,
  setSelectedOptions,
  qtyInCart,
  selectedCartKey,
  changeQtyByKey,
  cart,
  settings,
  store,
  onOpenCart,
}: CatalogDesktopProductDetailProps) {
  const {
    colors,
    cardStyle,
    showVariantSwatches,
    radiusCard,
    radiusImage,
    radiusButton,
    cardBgStyle,
    shadowCard,
    cardAspectRatio,
    getBadgeStyle,
    freeShipping,
  } = settings

  const hasDiscount =
    typeof selectedProduct.compareAtPrice === 'number' &&
    selectedProduct.compareAtPrice > selectedProduct.price
  const discountPct = hasDiscount
    ? Math.round(
        ((selectedProduct.compareAtPrice! - selectedProduct.price) /
          selectedProduct.compareAtPrice!) *
          100
      )
    : 0

  const relatedProducts = store.products
    .filter(p => p.id !== selectedProduct.id)
    .slice(0, 4)

  return (
    <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-8 md:py-12 flex-1 animate-in fade-in duration-300">
      {/* Minimalist Editorial Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] font-medium text-[#71717A] mb-8 select-none">
        <button
          type="button"
          onClick={() => {
            setSelectedProduct(null)
            setActiveNavTab('Inicio')
          }}
          className="inline-flex items-center gap-1.5 text-[#111111] hover:opacity-70 transition-opacity border-0 bg-transparent p-0 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Tienda</span>
        </button>
        {selectedProduct.category && (
          <>
            <span className="text-[#D4D4D8]">/</span>
            <button
              type="button"
              onClick={() => {
                setSelectedProduct(null)
                setActiveNavTab('Productos')
              }}
              className="hover:text-[#111111] transition-colors border-0 bg-transparent p-0 cursor-pointer font-medium text-[#71717A]"
            >
              {selectedProduct.category}
            </button>
          </>
        )}
        <span className="text-[#D4D4D8]">/</span>
        <span className="text-[#111111] font-medium truncate max-w-[260px]">
          {selectedProduct.name}
        </span>
      </nav>

      {/* Main 12-Col Luxury Studio PDP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* LEFT COLUMN (7 Cols): Vertical Thumbnail Rail + Studio Plinth */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3.5 items-start select-none">
          {productImages.length > 1 && (
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[580px] scrollbar-none shrink-0">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={cn(
                    'w-16 h-20 rounded-[4px] overflow-hidden bg-[#F6F6F4] p-1.5 shrink-0 cursor-pointer transition-all border',
                    activeImageIdx === idx
                      ? 'border-[#111111] opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="relative aspect-[4/5] w-full rounded-[4px] bg-[#F6F6F4] overflow-hidden flex items-center justify-center p-8 md:p-14">
            {/* Smart Editorial Pill Badge */}
            {(selectedProduct.badge || hasDiscount) && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                {selectedProduct.badge && (
                  <span className="px-2.5 py-1 rounded-[3px] bg-[#DDF3E4] text-[#0D3B26] text-[10px] font-extrabold uppercase tracking-[0.08em]">
                    {selectedProduct.badge}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-2.5 py-1 rounded-full bg-[#FFE2E0] text-[#9E1C1C] text-[10px] font-black tracking-tight">
                    -{discountPct}%
                  </span>
                )}
              </div>
            )}

            {currentDetailImg ? (
              <img
                src={currentDetailImg}
                alt={selectedProduct.name}
                className="w-full h-full object-contain transition-transform duration-500"
              />
            ) : (
              <ShoppingBag className="w-16 h-16 text-zinc-300 stroke-[1.2]" />
            )}

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIdx(p => (p === 0 ? productImages.length - 1 : p - 1))
                  }
                  aria-label="Imagen anterior"
                  className="absolute left-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E5E5E3] text-[#111111] flex items-center justify-center cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[1.8]" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIdx(p => (p === productImages.length - 1 ? 0 : p + 1))
                  }
                  aria-label="Siguiente imagen"
                  className="absolute right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E5E5E3] text-[#111111] flex items-center justify-center cursor-pointer transition-all"
                >
                  <ChevronRight className="w-4 h-4 stroke-[1.8]" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Sticky Architectural Buy Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 text-left select-none">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#71717A] tracking-[0.1em] uppercase">
                {selectedProduct.category || 'Colección Oficial'} · {productSku}
              </span>
              <span className="text-[12px] font-semibold text-[#111111] tracking-tight">
                ★★★★★ <span className="text-[#71717A] font-normal">(4.9)</span>
              </span>
            </div>

            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111111] tracking-[-0.03em] leading-[1.1]">
              {selectedProduct.name}
            </h1>

            <div className="flex items-baseline gap-2.5 pt-1">
              <span
                className={cn(
                  'text-[22px] font-bold tracking-tight tabular-nums',
                  hasDiscount ? 'text-[#C81E1E]' : 'text-[#111111]'
                )}
                suppressHydrationWarning
              >
                ${selectedProduct.price.toLocaleString('es-CO')}
              </span>
              {hasDiscount && (
                <span
                  className="text-[15px] text-[#A1A1AA] line-through tabular-nums"
                  suppressHydrationWarning
                >
                  ${selectedProduct.compareAtPrice!.toLocaleString('es-CO')}
                </span>
              )}
            </div>
          </div>

          {selectedProduct.description && (
            <p className="text-[14px] text-[#52525B] leading-[1.6] font-normal">
              {selectedProduct.description}
            </p>
          )}

          {/* Dynamic Product Variant / Swatch Selectors */}
          {(() => {
            const parsedOpts = normalizeProductOptions(selectedProduct.options)
            if (parsedOpts.length === 0) return null
            return (
              <div className="space-y-4 pt-1 border-t border-[#EAEAE8]">
                {parsedOpts.map(opt => {
                  const currentVal = selectedOptions[opt.name] || opt.values[0]
                  const isColorOpt = /color|tono|acabado/i.test(opt.name)
                  return (
                    <div key={opt.name} className="space-y-2 pt-3">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-bold text-[#111111] uppercase tracking-[0.06em]">
                          {opt.name}
                        </span>
                        <span className="text-[#71717A] font-medium">{currentVal}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val: string) => {
                          const active = currentVal === val
                          const swatchHex = isColorOpt ? resolveColorHex(val) : null
                          if (swatchHex) {
                            return (
                              <button
                                key={val}
                                type="button"
                                title={val}
                                onClick={() =>
                                  setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))
                                }
                                className={cn(
                                  'w-7 h-7 rounded-full p-[2.5px] transition-all cursor-pointer bg-white border',
                                  active
                                    ? 'border-[#111111] scale-105'
                                    : 'border-[#D4D4D8] hover:border-[#71717A]'
                                )}
                              >
                                <span
                                  className="block w-full h-full rounded-full relative overflow-hidden border border-black/10"
                                  style={{ backgroundColor: swatchHex }}
                                >
                                  <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/55 pointer-events-none" />
                                </span>
                              </button>
                            )
                          }
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))
                              }
                              className={cn(
                                'px-4 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer border',
                                active
                                  ? 'bg-[#111111] border-[#111111] text-white'
                                  : 'bg-[#F6F6F4] border-transparent text-[#111111] hover:border-[#D4D4D8]'
                              )}
                            >
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Availability */}
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#52525B]">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                selectedProduct.stock > 0 ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              )}
            />
            <span>
              {selectedProduct.stock > 0
                ? `Disponible para envío inmediato (${selectedProduct.stock} en stock)`
                : 'Agotado temporalmente'}
            </span>
          </div>

          {/* Primary Pill Buy CTA */}
          <div className="pt-1 space-y-2.5">
            {qtyInCart > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-between h-12 px-2 rounded-full border border-[#111111] bg-white w-36 shrink-0">
                  <button
                    type="button"
                    onClick={() => changeQtyByKey(selectedCartKey, -1)}
                    className="w-8 h-8 rounded-full hover:bg-[#F6F6F4] flex items-center justify-center cursor-pointer border-0 bg-transparent text-[#111111]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-[14px] text-[#111111] tabular-nums">
                    {qtyInCart}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQtyByKey(selectedCartKey, 1)}
                    disabled={qtyInCart >= selectedProduct.stock}
                    className="w-8 h-8 rounded-full hover:bg-[#F6F6F4] flex items-center justify-center cursor-pointer border-0 bg-transparent text-[#111111] disabled:opacity-35"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenCart}
                  className="flex-1 h-12 rounded-full bg-[#111111] hover:bg-[#27272A] text-white text-[12px] font-bold uppercase tracking-[0.08em] cursor-pointer transition-colors border-0"
                >
                  Ver bolsa · ${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => changeQtyByKey(selectedCartKey, 1)}
                disabled={selectedProduct.stock <= 0}
                className="w-full h-12.5 rounded-full bg-[#111111] hover:bg-[#27272A] disabled:bg-zinc-300 text-white text-[12px] font-bold uppercase tracking-[0.08em] cursor-pointer transition-all active:scale-[0.99] border-0"
              >
                {selectedProduct.stock > 0 ? 'Añadir a la bolsa' : 'Agotado'}
              </button>
            )}
          </div>

          {/* Hairline Editorial Service & Accordion Specs */}
          <div className="divide-y divide-[#EAEAE8] border-y border-[#EAEAE8] pt-1">
            <details className="group py-3.5" open>
              <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[13px] font-bold text-[#111111]">
                <span className="inline-flex items-center gap-2">
                  <Truck className="w-4 h-4 stroke-[1.7]" />
                  <span>Envío y entrega</span>
                </span>
                <ChevronDown className="w-4 h-4 text-[#71717A] transition-transform group-open:rotate-180" />
              </summary>
              <p className="pt-2 text-[12.5px] text-[#52525B] leading-relaxed">
                {freeShipping?.enabled
                  ? `Envío estándar rápido a todo el país. Envío gratuito en pedidos superiores a $${(
                      freeShipping.threshold || 120000
                    ).toLocaleString('es-CO')}.`
                  : 'Despacho ágil y seguro con seguimiento directo por WhatsApp.'}
              </p>
            </details>

            <details className="group py-3.5">
              <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[13px] font-bold text-[#111111]">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 stroke-[1.7]" />
                  <span>Compra protegida y garantía</span>
                </span>
                <ChevronDown className="w-4 h-4 text-[#71717A] transition-transform group-open:rotate-180" />
              </summary>
              <p className="pt-2 text-[12.5px] text-[#52525B] leading-relaxed">
                Producto 100% original verificado por {store.name}. Atención personalizada antes y
                después de tu compra.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Related Studio Products Row */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#EAEAE8] select-none text-left">
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="text-[20px] md:text-[22px] font-extrabold text-[#111111] tracking-[-0.02em]">
              También te puede interesar
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedProduct(null)
                setActiveNavTab('Productos')
              }}
              className="text-[13px] font-semibold text-[#111111] hover:opacity-70 bg-transparent border-0 p-0 cursor-pointer"
            >
              Ver todo →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((product, idx) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                index={idx}
                viewMode="grid"
                cart={cart}
                changeQtyByKey={changeQtyByKey}
                setSelectedProduct={p => {
                  setSelectedProduct(p)
                  setActiveImageIdx(0)
                }}
                colors={colors}
                cardStyle={cardStyle}
                showVariantSwatches={showVariantSwatches}
                radiusCard={radiusCard}
                radiusImage={radiusImage}
                radiusButton={radiusButton}
                cardBgStyle={cardBgStyle}
                shadowCard={shadowCard}
                cardAspectRatio={cardAspectRatio}
                getBadgeStyle={getBadgeStyle}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
