'use client'

import React from 'react'
import { Truck, Search, Sliders, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogProductCard } from '../common/CatalogProductCard'

export interface MobileProductFeedProps {
  allProducts: Product[]
  settings: CatalogResolvedSettings
  total: number
  activeNavTab: string
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
  setIsFilterOpen: (open: boolean) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  filteredProducts: Product[]
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
}

export function MobileProductFeed({
  allProducts,
  settings,
  total,
  activeNavTab,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  setIsFilterOpen,
  viewMode,
  filteredProducts,
  cart,
  changeQtyByKey,
  setSelectedProduct,
}: MobileProductFeedProps) {
  const {
    colors,
    freeShipping,
    cardStyle,
    showVariantSwatches,
    radiusCard,
    radiusImage,
    radiusButton,
    cardBgStyle,
    shadowCard,
    cardAspectRatio,
    getBadgeStyle,
  } = settings

  const collectionTabs = React.useMemo(() => {
    const uniqueCats = Array.from(
      new Set(allProducts.map(p => (p.category || '').trim()).filter(Boolean))
    )
    return ['Todos', ...uniqueCats.slice(0, 6)]
  }, [allProducts])

  if (activeNavTab !== 'Inicio' && activeNavTab !== 'Productos') {
    return null
  }

  return (
    <div className="space-y-5">
      {/* Dynamic Free Shipping Progress Bar */}
      {activeNavTab === 'Inicio' && freeShipping?.enabled && total > 0 && (
        <div
          className={cn(
            'p-3 rounded-[4px] border text-left transition-all',
            total >= (freeShipping.threshold || 120000)
              ? 'bg-[#DDF3E4]/70 text-[#0D3B26] border-[#BDE5CA]'
              : 'bg-[#F6F6F4] border-[#EAEAE8] text-[#111111]'
          )}
        >
          <div className="flex justify-between items-center text-[10.5px] font-semibold mb-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <Truck className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
              <span className="truncate">
                {total >= (freeShipping.threshold || 120000)
                  ? '¡Envío gratis desbloqueado!'
                  : `Te faltan $${((freeShipping.threshold || 120000) - total).toLocaleString('es-CO')} para envío gratis`}
              </span>
            </div>
            <span className="text-[9.5px] font-bold tabular-nums ml-1">
              {Math.min(100, Math.round((total / (freeShipping.threshold || 120000)) * 100))}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden bg-black/10">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#111111]"
              style={{
                width: `${Math.min(
                  100,
                  (total / (freeShipping.threshold || 120000)) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Search & Filter Row (when in Productos or searching) */}
      {(activeNavTab === 'Productos' || searchQuery.trim().length > 0) && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar en la colección..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F6F4] border border-transparent rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-[#111111] outline-none focus:bg-white focus:border-[#111111] transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="w-10 h-10 bg-[#F6F6F4] rounded-full flex items-center justify-center text-[#111111] hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer border-0"
            aria-label="Filtrar"
          >
            <Sliders className="w-4 h-4 stroke-[1.7]" />
          </button>
        </div>
      )}

      {/* Waterdrop Horizontal Same-Baseline Underlined Collection Tabs */}
      <div
        id="mobile-categories-row"
        className="flex items-baseline gap-5 overflow-x-auto scrollbar-none border-b border-[#EAEAE8]"
      >
        {collectionTabs.map(tab => {
          const isActive = selectedCategory === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedCategory(tab)}
              className={cn(
                'pb-2.5 text-[14px] tracking-[-0.015em] whitespace-nowrap transition-colors cursor-pointer bg-transparent border-0 border-b-2 -mb-[1px]',
                isActive
                  ? 'font-extrabold text-[#111111] border-[#111111]'
                  : 'font-normal text-[#A1A1AA] border-transparent hover:text-[#111111]'
              )}
            >
              {tab === 'Todos' ? 'Los más vendidos' : tab}
            </button>
          )
        })}
      </div>

      {/* Clean 2-Column Waterdrop Studio Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 text-center bg-[#F6F6F4] rounded-[4px] space-y-2">
          <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto stroke-[1.5]" />
          <p className="text-xs font-semibold text-[#71717A]">
            No encontramos productos en esta colección
          </p>
        </div>
      ) : (
        <div
          id="catalog-products"
          className={cn(
            'gap-3.5',
            viewMode === 'grid' ? 'grid grid-cols-2' : 'grid grid-cols-1'
          )}
        >
          {(activeNavTab === 'Inicio' ? filteredProducts.slice(0, 6) : filteredProducts).map(
            (product, idx) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                index={idx}
                viewMode={viewMode}
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
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
