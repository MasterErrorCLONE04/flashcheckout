'use client'

import React from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Product } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogProductCard } from '../common/CatalogProductCard'

export interface CatalogDesktopHomeProductsProps {
  filteredProducts: Product[]
  selectedCategory: string
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  settings: CatalogResolvedSettings
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
  selectedProduct: Product | null
}

export function CatalogDesktopHomeProducts({
  filteredProducts,
  selectedCategory,
  viewMode,
  setViewMode,
  settings,
  cart,
  changeQtyByKey,
  setSelectedProduct,
  selectedProduct
}: CatalogDesktopHomeProductsProps) {
  const {
    colors,
    radiusCard,
    radiusImage,
    radiusButton,
    cardBgStyle,
    shadowCard,
    cardAspectRatio,
    catalogColumns,
    getBadgeStyle
  } = settings

  return (
    <main className="max-w-[1300px] mx-auto w-full px-6 py-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Grid/Feed Central (Ancho completo al eliminar el sidebar) */}
        <div 
          id="catalog-products" 
          className={cn(
            "space-y-6 transition-all duration-300",
            selectedProduct ? "lg:col-span-8" : "lg:col-span-12"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                {selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory}
              </h2>
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>

            {/* Switchers Grid/List */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border-0",
                  viewMode === 'grid' ? "bg-white text-zinc-905 shadow-sm" : "text-zinc-500 hover:text-zinc-900 bg-transparent"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border-0",
                  viewMode === 'list' ? "bg-white text-zinc-905 shadow-sm" : "text-zinc-500 hover:text-zinc-900 bg-transparent"
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          {/* Productos */}
          <div className={cn(
            "gap-5 pb-20",
            viewMode === 'grid' 
              ? (selectedProduct 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
                  : catalogColumns === '3' 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
                    : catalogColumns === '5' 
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5" 
                      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4") 
              : "grid grid-cols-1"
          )}>
            {filteredProducts.map(product => (
              <CatalogProductCard
                key={product.id}
                product={product}
                cart={cart}
                changeQtyByKey={changeQtyByKey}
                setSelectedProduct={setSelectedProduct}
                colors={colors}
                radiusCard={radiusCard}
                radiusImage={radiusImage}
                radiusButton={radiusButton}
                cardBgStyle={cardBgStyle}
                shadowCard={shadowCard}
                cardAspectRatio={cardAspectRatio}
                getBadgeStyle={getBadgeStyle}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
