'use client'

import React from 'react'
import { ShoppingBag, Check, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product, Store, CatalogSort } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogProductCard } from '../common/CatalogProductCard'

export interface CatalogDesktopShopProps {
  store: Store
  settings: CatalogResolvedSettings
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  categoryCounts: Record<string, number>
  onlyInStock: boolean
  setOnlyInStock: React.Dispatch<React.SetStateAction<boolean>>
  sortBy: CatalogSort
  setSortBy: (sort: CatalogSort) => void
  filteredProducts: Product[]
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
}

export function CatalogDesktopShop({
  store,
  settings,
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  onlyInStock,
  setOnlyInStock,
  sortBy,
  setSortBy,
  filteredProducts,
  viewMode,
  setViewMode,
  cart,
  changeQtyByKey,
  setSelectedProduct,
}: CatalogDesktopShopProps) {
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
  } = settings

  return (
    <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-10 flex-1 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Minimalist Waterdrop Left Filter Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-[#EAEAE8] rounded-[4px] p-5 space-y-6 text-left select-none sticky top-24">
          <div className="space-y-1 pb-3 border-b border-[#EAEAE8]">
            <h3 className="text-[14px] font-extrabold text-[#111111] tracking-tight leading-none">
              Filtrar colección
            </h3>
            <p className="text-[11px] text-[#71717A] font-normal">
              Explora nuestras líneas oficiales
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
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
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'w-full flex items-center justify-between py-2 px-2.5 rounded-[4px] text-xs transition-all text-left cursor-pointer border-none bg-transparent',
                      isActive
                        ? 'text-[#111111] bg-[#F6F6F4] font-bold'
                        : 'text-[#71717A] hover:text-[#111111] hover:bg-[#F6F6F4]/60 font-medium'
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

          <div className="space-y-2.5 pt-4 border-t border-[#EAEAE8]">
            <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
              Disponibilidad
            </h4>
            <button
              type="button"
              onClick={() => setOnlyInStock(prev => !prev)}
              className={cn(
                'w-full flex items-center justify-between py-2 px-2.5 rounded-[4px] border text-xs cursor-pointer transition-all bg-transparent',
                onlyInStock
                  ? 'border-[#111111] bg-[#F6F6F4] text-[#111111] font-bold'
                  : 'border-[#E5E5E3] bg-white text-[#52525B] font-medium'
              )}
            >
              <span>Solo disponibles hoy</span>
              <div
                className={cn(
                  'w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all',
                  onlyInStock
                    ? 'bg-[#111111] border-[#111111] text-white'
                    : 'border-zinc-300 bg-white'
                )}
              >
                {onlyInStock && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#EAEAE8]">
            <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.1em]">
              Ordenar por
            </h4>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as CatalogSort)}
              className="w-full bg-white border border-[#E5E5E3] rounded-[4px] px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="default">Más populares</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A - Z</option>
            </select>
          </div>
        </aside>

        {/* Right Main Product Grid */}
        <div id="catalog-products" className="lg:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EAEAE8]">
            <div className="text-left">
              <h2 className="text-[22px] font-extrabold text-[#111111] tracking-[-0.02em]">
                {selectedCategory === 'Todos'
                  ? 'Toda la colección'
                  : selectedCategory}
              </h2>
              <p className="text-xs text-[#71717A] font-normal mt-0.5">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1
                  ? 'producto disponible'
                  : 'productos disponibles'}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#F6F6F4] p-1 rounded-[4px] border border-[#EAEAE8] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-[11px] font-bold transition-all cursor-pointer border-0',
                  viewMode === 'grid'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#71717A] hover:text-[#111111] bg-transparent'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-[11px] font-bold transition-all cursor-pointer border-0',
                  viewMode === 'list'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#71717A] hover:text-[#111111] bg-transparent'
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-[#F6F6F4] rounded-[4px]">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto stroke-[1.4]" />
              <p className="text-sm font-semibold text-[#71717A]">
                No encontramos productos con estos filtros
              </p>
            </div>
          ) : (
            <div
              className={cn(
                'gap-5',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid grid-cols-1'
              )}
            >
              {filteredProducts.map((product, idx) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
