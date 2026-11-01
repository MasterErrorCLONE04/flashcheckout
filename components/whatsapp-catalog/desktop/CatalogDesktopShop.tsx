'use client'

import React from 'react'
import { ShoppingBag, Check, LayoutGrid, List } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Product, Store, CatalogSort, parseCartKey } from '../types'

export interface CatalogDesktopShopProps {
  store: Store
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
  setSelectedProduct: (p: Product) => void
}

export function CatalogDesktopShop({
  store,
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
  setSelectedProduct
}: CatalogDesktopShopProps) {
  return (
    <main className="max-w-[1300px] mx-auto w-full px-6 py-8 flex-1 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR: FILTERS (3/12 width) */}
        <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-5 space-y-6 text-left select-none sticky top-24">
          <div className="space-y-1 pb-3 border-b border-zinc-100">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Filtrar Productos</h3>
            <p className="text-[10px] text-zinc-400 font-bold">Refina tu búsqueda gourmet</p>
          </div>

          {/* Categories checklist */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categorías</h4>
            <div className="space-y-1.5">
              {categories.map(cat => {
                const isActive = selectedCategory === cat
                const count = cat === 'Todos' ? store.products.length : categoryCounts[cat] || 0
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer border-none bg-transparent",
                      isActive 
                        ? "text-emerald-700 bg-emerald-50/50 font-bold" 
                        : "text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50/50"
                    )}
                  >
                    <span>{cat === 'Todos' ? 'Todos los productos' : cat}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                      isActive ? "bg-emerald-100 text-emerald-800" : "text-zinc-400 bg-zinc-100"
                    )}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Disponibilidad</h4>
            <button
              onClick={() => setOnlyInStock(prev => !prev)}
              className={cn(
                "w-full flex items-center justify-between py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all bg-transparent",
                onlyInStock ? "border-emerald-600 bg-emerald-50/50 text-emerald-700 font-bold" : "border-zinc-200 bg-white text-zinc-600"
              )}
            >
              <span>Solo en stock</span>
              <div className={cn(
                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all",
                onlyInStock ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-300 bg-white"
              )}>
                {onlyInStock && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Ordenar por</h4>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as CatalogSort)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            >
              <option value="default">Recomendados</option>
              <option value="price-asc">Precio: de Menor a Mayor</option>
              <option value="price-desc">Precio: de Mayor a Menor</option>
              <option value="name-asc">Nombre: A - Z</option>
            </select>
          </div>
        </div>

        {/* RIGHT MAIN PANEL: PRODUCT GRID (9/12 width) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-150">
            <div className="text-left">
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                Catálogo Gourmet / {selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
            </div>
            
            {/* Grid/List View switcher */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
              <button
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

          {/* Product Grid Render */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white border border-zinc-150 rounded-2xl">
              <ShoppingBag className="w-12 h-12 text-zinc-350 mx-auto" />
              <p className="text-sm font-black text-zinc-400">No encontramos productos con estos filtros</p>
            </div>
          ) : (
            <div className={cn(
              "gap-6",
              viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid grid-cols-1"
            )}>
              {filteredProducts.map(product => {
                const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
                  const { productId } = parseCartKey(k)
                  return sum + (productId === product.id ? q : 0)
                }, 0)
                const isItemInCart = productCartQty > 0
                return (
                  <div 
                    key={product.id}
                    className={cn(
                      "group relative bg-white border border-zinc-150 rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:border-zinc-350 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full select-none text-left",
                      viewMode === 'list' && "flex-row gap-4 items-center"
                    )}
                  >
                    <div className={cn("flex flex-col h-full justify-between w-full", viewMode === 'list' && "flex-row gap-4 items-center flex-1")}>
                      
                      {/* Image container */}
                      <div 
                        className={cn("relative rounded-xl overflow-hidden bg-zinc-50 shrink-0 cursor-pointer border border-zinc-100", viewMode === 'grid' ? "aspect-square w-full mb-4" : "w-24 h-24")}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#EEF2F0] rounded text-[8px] font-bold text-emerald-700 uppercase tracking-wide">
                          {product.category || 'General'}
                        </span>
                        {product.imageUrl ? (
                          <img src={product.imageUrl.split(',')[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingBag className="w-8 h-8" /></div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between mt-1 text-left">
                        <div>
                          <h4 
                            className="font-bold text-sm text-zinc-900 leading-snug line-clamp-2 cursor-pointer hover:text-zinc-950 transition-colors" 
                            onClick={() => setSelectedProduct(product)}
                          >
                            {product.name}
                          </h4>
                          {product.description && (
                            <p className="text-[11px] text-zinc-400 mt-1.5 leading-normal line-clamp-2">{product.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-zinc-100">
                          <span className="font-extrabold text-sm text-[#4A2E1B] leading-none" suppressHydrationWarning={true}>
                            ${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 border-none text-white",
                              isItemInCart ? "bg-emerald-600" : "bg-[#4A2E1B] hover:bg-[#3D2515]"
                            )}
                          >
                            {isItemInCart ? 'Configurado' : 'Ver Detalles'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
