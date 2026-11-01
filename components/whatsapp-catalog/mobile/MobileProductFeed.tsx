'use client'

import React from 'react'
import { Truck, Award, Tag, Search, Sliders, LayoutGrid, List, ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Product, IconMap, CatalogIconName, parseCartKey } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'

export interface MobileProductFeedProps {
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
  setViewMode,
  filteredProducts,
  cart,
  changeQtyByKey,
  setSelectedProduct
}: MobileProductFeedProps) {
  const {
    colors,
    freeShipping,
    sections,
    benefits,
    visualCategories,
    bentoHighlights,
    radiusCard,
    radiusImage,
    radiusButton,
    cardBgStyle,
    shadowCard,
    cardAspectRatio,
    getBadgeStyle
  } = settings

  return (
    <>
      {/* Barra de Envío Gratis Dinámica (Mobile) */}
      {activeNavTab === 'Inicio' && freeShipping?.enabled && (
        <div className={cn(
          "p-3 rounded-xl border text-left transition-all",
          total >= (freeShipping.threshold || 100000)
            ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
            : "bg-white border-zinc-200/90 text-zinc-800 shadow-2xs"
        )}>
          <div className="flex justify-between items-center text-[10px] font-black mb-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {total >= (freeShipping.threshold || 100000)
                  ? "🎉 ¡Envío gratis desbloqueado!"
                  : `¡Faltan $${((freeShipping.threshold || 100000) - total).toLocaleString('es-CO')} para Envío Gratis!`
                }
              </span>
            </div>
            <span className="text-[9px] font-extrabold tabular-nums ml-1">
              {Math.min(100, Math.round((total / (freeShipping.threshold || 100000)) * 100))}%
            </span>
          </div>
          <div className={cn("w-full h-1.5 rounded-full overflow-hidden", total >= (freeShipping.threshold || 100000) ? "bg-white/30" : "bg-zinc-100")}>
            <div 
              className={cn("h-full rounded-full transition-all duration-500", total >= (freeShipping.threshold || 100000) ? "bg-white" : "bg-emerald-500")}
              style={{ width: `${Math.min(100, (total / (freeShipping.threshold || 100000)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Barra de Beneficios (Mobile) */}
      {activeNavTab === 'Inicio' && sections.beneficios && benefits?.items && benefits.items.length > 0 && (
        <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-3 border border-zinc-150 shrink-0">
          {benefits.items.map((item: { icon: CatalogIconName; label: string; desc: string }, idx: number) => {
            const ItemIcon = IconMap[item.icon] || Award
            return (
              <div key={idx} className="flex items-center gap-1.5 p-1 text-left min-w-0">
                <div 
                  className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors.secundario}12`, color: colors.secundario, borderColor: `${colors.secundario}22` }}
                >
                  <ItemIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 leading-none">
                  <span className="text-[9px] font-bold text-zinc-900 block truncate">{item.label}</span>
                  <span className="text-[8px] font-semibold text-zinc-400 mt-0.5 block truncate">{item.desc}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Categorías Visuales (Mobile) */}
      {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && sections.visualCategories && visualCategories && visualCategories.length > 0 && (
        <div className="space-y-2.5 shrink-0 text-left">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categorías</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
            {visualCategories.map((catItem: { category: string; imageUrl: string }, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedCategory(catItem.category)}
                className={cn(
                  "bg-white border rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer shrink-0 transition-all",
                  selectedCategory === catItem.category ? "border-emerald-600 ring-2 ring-emerald-500/10" : "border-zinc-150"
                )}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                  {catItem.imageUrl ? (
                    <img src={catItem.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <span className="text-[10px] font-extrabold text-zinc-800 tracking-tight leading-tight pr-1.5">{catItem.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bento Grid Highlights (Mobile) */}
      {activeNavTab === 'Inicio' && sections.bentoHighlights && bentoHighlights?.items && bentoHighlights.items.length > 0 && (
        <div className="space-y-2.5 shrink-0 text-left">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{bentoHighlights.title}</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {bentoHighlights.items.map((item: { emoji: string; title: string; desc: string }, idx: number) => (
              <div key={idx} className="bg-white border border-zinc-150 rounded-xl p-3 flex items-center gap-3 shadow-none">
                <span className="text-xl shrink-0 select-none">{item.emoji || '✨'}</span>
                <div>
                  <h4 className="font-extrabold text-[11px] text-zinc-900 leading-none">{item.title}</h4>
                  <p className="text-[9px] font-semibold text-zinc-500 mt-1 leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Barra de Búsqueda Móvil con botón Sliders */}
      {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 transition-all"
            />
          </div>
          <button 
            type="button"
            onClick={() => setIsFilterOpen(true)} 
            className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toggles Cuadrícula / Lista en Móvil */}
      {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 w-full max-w-[280px]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none",
                viewMode === 'grid' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 bg-transparent"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none",
                viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 bg-transparent"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>
        </div>
      )}

      {/* Sección Más Productos (Cuadrícula vertical) */}
      {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
        <div className="space-y-3.5 pb-12">
          <h3 className="text-sm font-black text-zinc-900 tracking-tight text-left">
            {activeNavTab === 'Inicio' ? 'Nuestros Lanzamientos' : 'Productos Encontrados'}
          </h3>
          
          <div className={cn(
            "gap-3.5",
            viewMode === 'grid' ? "grid grid-cols-2" : "grid grid-cols-1"
          )}>
            {filteredProducts.map(product => {
              const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
                const { productId } = parseCartKey(k)
                return sum + (productId === product.id ? q : 0)
              }, 0)
              const isItemInCart = productCartQty > 0
              const badgeInfo = getBadgeStyle(product.category || 'General')
              return (
                <div 
                  key={product.id}
                  className={cn(
                    "group overflow-hidden p-3 flex flex-col justify-between h-full select-none transition-all duration-300 cursor-pointer",
                    radiusCard,
                    cardBgStyle,
                    shadowCard,
                    viewMode === 'list' && "flex-row gap-3.5 items-center"
                  )}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className={cn("flex flex-col h-full justify-between w-full", viewMode === 'list' && "flex-row gap-3.5 items-center flex-1")}>
                    
                    {/* Image Container with Dynamic Aspect Ratio */}
                    <div 
                      className={cn(
                        "relative overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100 transition-all",
                        radiusImage,
                        viewMode === 'grid' 
                          ? (cardAspectRatio === 'portrait' ? "aspect-[4/5] w-full mb-2.5" : "aspect-square w-full mb-2.5") 
                          : "w-20 h-20"
                      )}
                    >
                      {/* Categoría Badge Overlay & Urgencia */}
                      <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between pointer-events-none">
                        <span 
                          className={cn("select-none shadow-xs text-[8px] pointer-events-auto", badgeInfo.className)}
                          style={badgeInfo.style}
                        >
                          {product.category || 'General'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider bg-white/90 text-emerald-700 backdrop-blur-md shadow-xs border border-white/60">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{product.stock <= 5 ? 'Últimas' : 'En stock'}</span>
                        </span>
                      </div>

                      {product.imageUrl ? (
                        <img src={product.imageUrl.split(',')[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-200"><ShoppingBag className="w-6 h-6" /></div>
                      )}
                    </div>

                    {/* Title and price row */}
                    <div className="flex-1 flex flex-col justify-between mt-1 select-none text-left">
                      <div className="space-y-0.5">
                        {/* Mobile Star ratings */}
                        <div className="flex items-center gap-1 text-[9px] font-bold">
                          <span className="text-amber-400 text-xs leading-none">★★★★★</span>
                          <span className="text-[8.5px] text-zinc-400">4.9</span>
                        </div>

                        <h4 
                          className="font-bold text-[11px] leading-snug line-clamp-2 transition-colors"
                          style={{ color: colors.texto }}
                        >
                          {product.name}
                        </h4>
                      </div>
                      
                      <div className="mt-2 pt-1.5 border-t border-zinc-150/70">
                        <div className="flex items-baseline gap-1.5">
                          <span 
                            className="font-black text-xs leading-none select-none" 
                            style={{ color: colors.texto }}
                            suppressHydrationWarning={true}
                          >
                            ${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 line-through">
                            ${(Math.round(product.price * 1.25 / 1000) * 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </span>
                        </div>
                        
                        {isItemInCart ? (
                          <div 
                            className={cn("w-full mt-2 p-0.5 flex items-center justify-between border bg-zinc-50 shadow-2xs", radiusButton)}
                            style={{ borderColor: `${colors.primario}40` }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => changeQtyByKey(product.id, -1)}
                              className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 cursor-pointer active:scale-95 border-none"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-black tabular-nums" style={{ color: colors.primario }}>
                              {productCartQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQtyByKey(product.id, 1)}
                              disabled={productCartQty >= product.stock}
                              className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 cursor-pointer active:scale-95 border-none"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const parsedOpts = product.options
                                ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options)
                                : []
                              if (Array.isArray(parsedOpts) && parsedOpts.length > 0) {
                                setSelectedProduct(product)
                              } else {
                                changeQtyByKey(product.id, 1)
                              }
                            }}
                            disabled={product.stock <= 0}
                            className={cn(
                              "w-full mt-2 py-1.5 px-2 border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-extrabold text-[10px] active:scale-98 shadow-xs",
                              radiusButton
                            )}
                            style={{
                              backgroundColor: colors.primario,
                              borderColor: colors.primario,
                              color: '#FFFFFF'
                            }}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
