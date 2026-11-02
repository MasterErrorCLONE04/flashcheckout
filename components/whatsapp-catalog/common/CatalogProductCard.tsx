'use client'

import React, { useMemo, useState } from 'react'
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product, getCartKey, normalizeProductOptions, parseCartKey } from '../types'

const NAMED_SWATCH_COLORS: Record<string, string> = {
  negro: '#141414',
  black: '#141414',
  blanco: '#FAFAFA',
  white: '#FAFAFA',
  gris: '#A1A1AA',
  titanio: '#8E8E93',
  plata: '#D4D4D8',
  silver: '#D4D4D8',
  beige: '#E6DFD3',
  arena: '#E6DFD3',
  crema: '#FAF0CA',
  amarillo: '#FACC15',
  limon: '#FDE047',
  dorado: '#D4AF37',
  oro: '#D4AF37',
  durazno: '#FDBA74',
  peach: '#FDBA74',
  naranja: '#FB923C',
  coral: '#FB7185',
  rojo: '#DC2626',
  cereza: '#9F1239',
  rosa: '#F472B6',
  rosado: '#F9A8D4',
  fucsia: '#DB2777',
  morado: '#9333EA',
  lila: '#C4B5FD',
  azul: '#38BDF8',
  marino: '#1E3A8A',
  verde: '#4ADE80',
  menta: '#8CE5A7',
  oliva: '#65A30D',
  esmeralda: '#10B981',
  cafe: '#6F4E37',
  café: '#6F4E37',
  chocolate: '#4A2C2A',
  marron: '#6F4E37',
  marrón: '#6F4E37',
  terracota: '#C2410C',
}

function resolveColorHex(val: string): string | null {
  const clean = val.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) return clean
  const lower = clean.toLowerCase()
  for (const [k, hex] of Object.entries(NAMED_SWATCH_COLORS)) {
    if (lower.includes(k)) return hex
  }
  return null
}

export interface CatalogProductCardProps {
  product: Product
  index?: number
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
  colors: {
    primario: string
    texto: string
    fondo: string
    secundario: string
    acento: string
  }
  cardStyle?: string
  variant?: 'default' | 'plinth'
  showVariantSwatches?: boolean
  radiusCard: string
  radiusImage: string
  radiusButton: string
  cardBgStyle: string
  shadowCard: string
  cardAspectRatio: string
  getBadgeStyle: (category: string) => { className: string; style: React.CSSProperties }
  viewMode?: 'grid' | 'list'
}

export function CatalogProductCard({
  product,
  index = 0,
  cart,
  changeQtyByKey,
  setSelectedProduct,
  colors,
  cardStyle = 'waterdrop-studio',
  variant = 'default',
  showVariantSwatches = true,
  radiusCard,
  radiusImage,
  radiusButton,
  cardBgStyle,
  shadowCard,
  cardAspectRatio,
  getBadgeStyle,
  viewMode = 'grid',
}: CatalogProductCardProps) {
  const options = useMemo(() => normalizeProductOptions(product.options), [product.options])
  const primaryOption = options[0] || null

  const images = useMemo(
    () =>
      product.imageUrl
        ? product.imageUrl
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    [product.imageUrl]
  )

  const [selectedVal, setSelectedVal] = useState<string>(primaryOption?.values?.[0] || '')
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0)

  const defaultSelectedMap = useMemo(() => {
    const map: Record<string, string> = {}
    options.forEach((opt, i) => {
      if (opt.values.length > 0) {
        map[opt.name] = i === 0 && selectedVal ? selectedVal : opt.values[0]
      }
    })
    return map
  }, [options, selectedVal])

  const activeCartKey = getCartKey(product.id, defaultSelectedMap)

  const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
    const { productId } = parseCartKey(k)
    return sum + (productId === product.id ? q : 0)
  }, 0)

  const isStudio = cardStyle === 'waterdrop-studio'
  const isDarkCanvas =
    colors.fondo.toLowerCase() === '#0b0f19' || colors.fondo.toLowerCase() === '#09090b'

  const hasDiscount =
    typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  // Subtle Waterdrop badge discipline: show explicit badge, low stock, or NEW on initial featured items
  const topTag =
    product.badge ||
    (product.stock > 0 && product.stock <= 5
      ? 'ÚLTIMAS'
      : index < 3
        ? 'NEW'
        : '')

  const badgeInfo = getBadgeStyle(product.category || 'NEW')
  const mainImage = images[activePhotoIdx] || images[0] || null
  const hoverImage =
    activePhotoIdx === 0 && images.length > 1 ? images[1] : null

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.stock <= 0) return
    changeQtyByKey(activeCartKey, 1)
  }

  // SPECIAL MODE: Self-Contained Architectural Plinth Tile for Waterdrop 4x2 Mixed Editorial Grids
  // Ensures Product Tiles & Full-Bleed Lifestyle Photo Tiles have the EXACT same aspect-[3/4] height!
  if (variant === 'plinth' && viewMode === 'grid') {
    return (
      <div
        onClick={() => setSelectedProduct(product)}
        className={cn(
          'group relative aspect-[3/4] w-full overflow-hidden rounded-[4px] p-5 sm:p-6 flex flex-col justify-between cursor-pointer select-none transition-colors duration-300',
          isDarkCanvas ? 'bg-zinc-900 hover:bg-zinc-800/90' : 'bg-[#F6F6F4] hover:bg-[#EFEFED]'
        )}
      >
        {/* Top Row: Minimal Tag + Quick Add Button */}
        <div className="relative z-10 flex items-start justify-between">
          {topTag ? (
            <span
              className="px-2 py-0.5 rounded-[3px] text-[9.5px] font-extrabold uppercase tracking-[0.07em] leading-tight"
              style={{ backgroundColor: colors.acento || '#8CE5A7', color: '#111111' }}
            >
              {topTag}
            </span>
          ) : (
            <span />
          )}

          <div onClick={e => e.stopPropagation()}>
            {productCartQty > 0 ? (
              <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-zinc-950 text-white text-[10px] font-black tabular-nums">
                {productCartQty}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={product.stock <= 0}
                className="w-8 h-8 rounded-full bg-white/95 hover:bg-zinc-950 text-zinc-950 hover:text-white shadow-xs border border-zinc-200/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                aria-label={`Agregar ${product.name}`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>

        {/* Center Studio Product Visual */}
        <div className="relative flex-1 my-2 flex items-center justify-center overflow-hidden rounded-[3px]">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <ShoppingBag className="w-8 h-8 text-zinc-300" />
          )}
        </div>

        {/* Bottom Flush Editorial Caption inside Plinth */}
        <div className="relative z-10 pt-2 text-left space-y-0.5">
          <h4
            className="font-bold text-[13px] leading-snug line-clamp-1 tracking-[-0.015em]"
            style={{ color: colors.texto }}
          >
            {product.name}
          </h4>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-[12.5px] font-semibold tabular-nums',
                hasDiscount ? 'text-rose-600 font-bold' : 'opacity-80'
              )}
              style={!hasDiscount ? { color: colors.texto } : undefined}
              suppressHydrationWarning
            >
              ${product.price.toLocaleString('es-CO')}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-zinc-400 line-through tabular-nums" suppressHydrationWarning>
                ${product.compareAtPrice!.toLocaleString('es-CO')}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between h-full select-none cursor-pointer transition-all duration-300',
        isStudio ? 'p-0' : cn('p-3.5 overflow-hidden', radiusCard, cardBgStyle, shadowCard),
        viewMode === 'list' &&
          'flex-row gap-5 items-center p-4 border border-zinc-200/80 rounded-[6px] bg-white'
      )}
      onClick={() => setSelectedProduct(product)}
    >
      {/* Studio Gallery Plinth */}
      <div
        className={cn(
          'relative overflow-hidden shrink-0 transition-colors duration-300',
          isStudio
            ? isDarkCanvas
              ? 'bg-zinc-900 group-hover:bg-zinc-800/90 rounded-[4px]'
              : 'bg-[#F6F6F4] group-hover:bg-[#EFEFED] rounded-[4px]'
            : cn('bg-zinc-50 border border-zinc-100/80', radiusImage),
          viewMode === 'grid'
            ? cardAspectRatio === 'square'
              ? 'aspect-square w-full'
              : 'aspect-[4/5] w-full'
            : 'w-28 h-28 rounded-[4px]'
        )}
      >
        {/* Top Badges (Waterdrop Crisp Mint Micro-Pill + Scallop Circle Seal) */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between pointer-events-none">
          {topTag ? (
            <span
              className={cn(
                'px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.07em] leading-tight',
                isStudio ? 'rounded-[3px]' : badgeInfo.className
              )}
              style={
                isStudio
                  ? { backgroundColor: colors.acento || '#8CE5A7', color: '#111111' }
                  : badgeInfo.style
              }
            >
              {topTag}
            </span>
          ) : (
            <span />
          )}

          {hasDiscount && discountPct > 0 && (
            <span
              className="w-10 h-10 rounded-full -rotate-6 flex items-center justify-center text-[10.5px] font-black tracking-tight shadow-2xs"
              style={{ backgroundColor: colors.acento || '#8CE5A7', color: '#111111' }}
            >
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Product Image with Smooth Hover Crossfade & Subtle Scale */}
        {mainImage ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              className={cn(
                'w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]',
                hoverImage && 'group-hover:opacity-0'
              )}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700 ease-out"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <ShoppingBag className="w-8 h-8 stroke-[1.4]" />
          </div>
        )}

        {/* Tactile Floating Quick-Add Action inside Studio Tile */}
        {viewMode === 'grid' && (
          <div
            className="absolute bottom-3 right-3 z-10"
            onClick={e => e.stopPropagation()}
          >
            {productCartQty > 0 ? (
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-zinc-950 rounded-full px-2 py-1 shadow-[0_6px_20px_rgba(0,0,0,0.10)] border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => changeQtyByKey(activeCartKey, -1)}
                  className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-900 cursor-pointer border-0 bg-transparent"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-black tabular-nums px-0.5">
                  {productCartQty}
                </span>
                <button
                  type="button"
                  onClick={() => changeQtyByKey(activeCartKey, 1)}
                  disabled={productCartQty >= product.stock}
                  className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-900 cursor-pointer border-0 bg-transparent"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={product.stock <= 0}
                className={cn(
                  'h-9 px-3.5 rounded-full bg-white/95 hover:bg-zinc-950 text-zinc-950 hover:text-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-zinc-200/80 flex items-center gap-1 text-[11px] font-extrabold tracking-tight transition-all duration-200 cursor-pointer',
                  'opacity-95 sm:opacity-0 sm:translate-y-1.5 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 active:scale-95'
                )}
                title="Agregar rápido a la bolsa"
                aria-label={`Agregar ${product.name}`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
                <span className="hidden xl:inline">Añadir</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editorial Product Metadata Below Plinth */}
      <div
        className={cn(
          'pt-3.5 flex-1 flex flex-col justify-between text-left',
          viewMode === 'list' && 'pt-0'
        )}
      >
        <div className="space-y-2">
          {/* 1. Interactive Variant/Color Swatches OR Multi-Image Gallery Swatches */}
          {showVariantSwatches &&
            primaryOption &&
            primaryOption.values.length > 0 && (
              <div
                className="flex items-center gap-2 flex-wrap"
                onClick={e => e.stopPropagation()}
              >
                {primaryOption.values.slice(0, 5).map((val, vIdx) => {
                  const hex = resolveColorHex(val)
                  const isSelected = selectedVal === val
                  if (hex) {
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setSelectedVal(val)
                          if (images[vIdx]) setActivePhotoIdx(vIdx)
                        }}
                        title={`${primaryOption.name}: ${val}`}
                        className={cn(
                          'w-[20px] h-[20px] rounded-full p-[2px] cursor-pointer transition-all bg-transparent border',
                          isSelected
                            ? 'border-zinc-950 scale-105'
                            : 'border-zinc-300/80 hover:border-zinc-500'
                        )}
                      >
                        <span
                          className="block w-full h-full rounded-full shadow-inner"
                          style={{
                            background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.45), transparent 55%), ${hex}`,
                          }}
                        />
                      </button>
                    )
                  }
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedVal(val)}
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer border',
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-transparent text-zinc-600 border-zinc-300 hover:border-zinc-900'
                      )}
                    >
                      {val}
                    </button>
                  )
                })}
                {primaryOption.values.length > 5 && (
                  <span className="text-[10px] font-semibold text-zinc-400">
                    +{primaryOption.values.length - 5}
                  </span>
                )}
              </div>
            )}

          {/* Fallback: If product has multiple photos & no options, show circular Waterdrop photo swatches! */}
          {showVariantSwatches &&
            (!primaryOption || primaryOption.values.length === 0) &&
            images.length > 1 && (
              <div
                className="flex items-center gap-1.5"
                onClick={e => e.stopPropagation()}
              >
                {images.slice(0, 4).map((imgUrl, idx) => {
                  const active = activePhotoIdx === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setActivePhotoIdx(idx)}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={cn(
                        'w-[20px] h-[20px] rounded-full p-[1.5px] overflow-hidden cursor-pointer bg-white transition-all border',
                        active
                          ? 'border-zinc-950 scale-105'
                          : 'border-zinc-300 hover:border-zinc-600 opacity-80 hover:opacity-100'
                      )}
                      aria-label={`Vista ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}

          {/* Product Title */}
          <h4
            className="font-bold text-[14px] leading-[1.3] line-clamp-2 tracking-[-0.015em] group-hover:underline decoration-zinc-900/50 underline-offset-3"
            style={{ color: colors.texto }}
          >
            {product.name}
          </h4>
        </div>

        {/* Clean Real Price Row */}
        <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span
            className={cn(
              'text-[13.5px] tabular-nums tracking-[-0.01em]',
              hasDiscount ? 'font-extrabold text-[#C8102E]' : 'font-medium opacity-85'
            )}
            style={!hasDiscount ? { color: colors.texto } : undefined}
            suppressHydrationWarning
          >
            ${product.price.toLocaleString('es-CO')}
          </span>

          {hasDiscount && (
            <>
              <span
                className="text-[12px] font-normal text-zinc-400 line-through tabular-nums"
                suppressHydrationWarning
              >
                ${product.compareAtPrice!.toLocaleString('es-CO')}
              </span>
              <span className="text-[9.5px] font-extrabold text-white bg-[#C8102E] px-1.5 py-0.5 rounded-[3px] leading-none">
                -{discountPct}%
              </span>
            </>
          )}
        </div>

        {/* Optional Button for Non-Studio Classic Cards */}
        {!isStudio && (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={cn(
              'w-full mt-3 py-2 px-3 border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold text-xs active:scale-98',
              radiusButton
            )}
            style={{
              backgroundColor: colors.primario,
              borderColor: colors.primario,
              color: '#FFFFFF',
            }}
          >
            {productCartQty > 0 ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>{productCartQty > 0 ? `${productCartQty} en bolsa` : 'Agregar'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
