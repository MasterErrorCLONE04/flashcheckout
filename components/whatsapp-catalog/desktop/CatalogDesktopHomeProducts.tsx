'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogProductCard } from '../common/CatalogProductCard'

export interface CatalogDesktopHomeProductsProps {
  allProducts: Product[]
  settings: CatalogResolvedSettings
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
  onViewAllProducts: (category?: string) => void
}

export function CatalogDesktopHomeProducts({
  allProducts,
  settings,
  cart,
  changeQtyByKey,
  setSelectedProduct,
  onViewAllProducts,
}: CatalogDesktopHomeProductsProps) {
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
    catalogColumns,
    getBadgeStyle,
    sections,
  } = settings

  const collectionTabs = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(allProducts.map(p => (p.category || '').trim()).filter(Boolean))
    )
    return ['Más vendidos', ...uniqueCats.slice(0, 4)]
  }, [allProducts])

  const [activeCollection, setActiveCollection] = useState<string>('Más vendidos')
  const [pageOffset, setPageOffset] = useState<number>(0)

  const perRow = catalogColumns === '3' ? 3 : catalogColumns === '5' ? 5 : 4

  const activeItems = useMemo(() => {
    if (activeCollection === 'Más vendidos') return allProducts
    return allProducts.filter(p => (p.category || '').trim() === activeCollection)
  }, [allProducts, activeCollection])

  const maxOffset = Math.max(0, activeItems.length - perRow)
  const clampedOffset = Math.min(pageOffset, maxOffset)
  const visibleSlice =
    activeItems.length > perRow
      ? activeItems.slice(clampedOffset, clampedOffset + perRow)
      : activeItems

  if (sections.destacados === false || allProducts.length === 0) {
    return null
  }

  return (
    <section
      id="catalog-products"
      data-maker-section="bestsellers"
      data-maker-title="Colección Bestsellers & Tarjetas"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-14 pb-6 cursor-pointer"
    >
      {/* Waterdrop Seamless Baseline Collection Tabs */}
      <div className="flex flex-wrap items-baseline gap-x-7 gap-y-2 mb-7 select-none">
        {collectionTabs.map(tab => {
          const isActive = activeCollection === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveCollection(tab)
                setPageOffset(0)
              }}
              className={cn(
                'bg-transparent border-0 p-0 pb-1.5 text-left cursor-pointer transition-all text-[18px] sm:text-[21px] tracking-[-0.025em] border-b-2',
                isActive
                  ? 'font-extrabold opacity-100'
                  : 'font-normal opacity-42 hover:opacity-85 border-transparent'
              )}
              style={{
                color: colors.texto,
                borderColor: isActive ? colors.texto : 'transparent',
              }}
            >
              {tab === 'Más vendidos' ? 'Explora los más vendidos' : tab}
            </button>
          )
        })}
      </div>

      {/* Studio Product Plinth Row */}
      <div
        className={cn(
          'grid gap-4 sm:gap-5',
          catalogColumns === '3'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : catalogColumns === '5'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-4'
        )}
      >
        {visibleSlice.map((product, idx) => (
          <CatalogProductCard
            key={product.id}
            product={product}
            index={clampedOffset + idx}
            cart={cart}
            changeQtyByKey={changeQtyByKey}
            setSelectedProduct={setSelectedProduct}
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
            viewMode="grid"
          />
        ))}
      </div>

      {/* Waterdrop Carousel Controls: < > Circular Buttons Left + "Ver todo →" Right */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={clampedOffset <= 0}
            onClick={() => setPageOffset(prev => Math.max(0, prev - 1))}
            className={cn(
              'w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-transparent',
              clampedOffset <= 0
                ? 'border-zinc-200 text-zinc-300 cursor-default'
                : 'border-zinc-300 hover:border-zinc-950 text-zinc-900 cursor-pointer active:scale-95'
            )}
            aria-label="Productos anteriores"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.7]" />
          </button>
          <button
            type="button"
            disabled={clampedOffset >= maxOffset}
            onClick={() => setPageOffset(prev => Math.min(maxOffset, prev + 1))}
            className={cn(
              'w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-transparent',
              clampedOffset >= maxOffset
                ? 'border-zinc-200 text-zinc-300 cursor-default'
                : 'border-zinc-300 hover:border-zinc-950 text-zinc-900 cursor-pointer active:scale-95'
            )}
            aria-label="Siguientes productos"
          >
            <ChevronRight className="w-4 h-4 stroke-[1.7]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onViewAllProducts(activeCollection === 'Más vendidos' ? 'Todos' : activeCollection)
          }
          className="group inline-flex items-center gap-1.5 text-[13px] font-bold tracking-[-0.01em] hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-0 p-0 underline underline-offset-4"
          style={{ color: colors.texto }}
        >
          <span>Ver todo</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  )
}
