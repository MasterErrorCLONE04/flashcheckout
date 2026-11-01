'use client'

import React from 'react'
import { ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Product, parseCartKey } from '../types'

export interface CatalogProductCardProps {
  product: Product
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
  cart,
  changeQtyByKey,
  setSelectedProduct,
  colors,
  radiusCard,
  radiusImage,
  radiusButton,
  cardBgStyle,
  shadowCard,
  cardAspectRatio,
  getBadgeStyle,
  viewMode = 'grid'
}: CatalogProductCardProps) {
  const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
    const { productId } = parseCartKey(k)
    return sum + (productId === product.id ? q : 0)
  }, 0)
  const isItemInCart = productCartQty > 0
  const badgeInfo = getBadgeStyle(product.category || 'General')

  return (
    <div 
      className={cn(
        "group relative overflow-hidden p-3.5 transition-all duration-300 flex flex-col justify-between h-full select-none cursor-pointer",
        radiusCard,
        cardBgStyle,
        shadowCard,
        viewMode === 'list' && "flex-row gap-4 items-center"
      )}
      onClick={() => setSelectedProduct(product)}
    >
      <div className={cn("flex flex-col h-full justify-between w-full", viewMode === 'list' && "flex-row gap-4 items-center flex-1")}>
        
        {/* Image Container with Dynamic Aspect Ratio */}
        <div 
          className={cn(
            "relative overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100/80 transition-all",
            radiusImage,
            viewMode === 'grid' 
              ? (cardAspectRatio === 'portrait' ? "aspect-[4/5] w-full mb-3" : "aspect-square w-full mb-3") 
              : "w-24 h-24"
          )}
        >
          {/* Categoría Badge Overlay & Urgencia */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
            <span 
              className={cn("select-none shadow-xs pointer-events-auto", badgeInfo.className)}
              style={badgeInfo.style}
            >
              {product.category || 'General'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-white/90 text-emerald-700 backdrop-blur-md shadow-xs border border-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{product.stock <= 5 ? 'Últimas uds' : 'Despacho hoy'}</span>
            </span>
          </div>

          {product.imageUrl ? (
            <img 
              src={product.imageUrl.split(',')[0]} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title and price row */}
        <div className="flex-1 flex flex-col justify-between mt-1 select-none text-left">
          <div className="space-y-1">
            {/* Star ratings */}
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <div className="flex text-amber-400 text-xs leading-none">
                ★★★★★
              </div>
              <span className="text-[9.5px] text-zinc-400 font-bold ml-0.5">4.9</span>
            </div>

            <h4 
              className="font-bold text-xs leading-snug line-clamp-2 transition-colors"
              style={{ color: colors.texto }}
            >
              {product.name}
            </h4>
          </div>
          
          {/* Price & Reference */}
          <div className="mt-3 pt-2.5 border-t border-zinc-150/70">
            <div className="flex items-baseline gap-2">
              <span 
                className="font-black text-base leading-none select-none" 
                style={{ color: colors.texto }}
                suppressHydrationWarning={true}
              >
                ${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 line-through">
                ${(Math.round(product.price * 1.25 / 1000) * 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </span>
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                -20%
              </span>
            </div>
            
            {/* High-Converting Action Button */}
            {isItemInCart ? (
              <div 
                className={cn("w-full mt-3 p-1 flex items-center justify-between border bg-zinc-50/80 shadow-xs", radiusButton)}
                style={{ borderColor: `${colors.primario}40` }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => changeQtyByKey(product.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black tabular-nums" style={{ color: colors.primario }}>
                  {productCartQty} en carrito
                </span>
                <button
                  type="button"
                  onClick={() => changeQtyByKey(product.id, 1)}
                  disabled={productCartQty >= product.stock}
                  className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
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
                  "w-full mt-3 py-2 px-3 border flex items-center justify-center gap-2 transition-all cursor-pointer font-extrabold text-xs active:scale-98 shadow-xs",
                  radiusButton
                )}
                style={{
                  backgroundColor: colors.primario,
                  borderColor: colors.primario,
                  color: '#FFFFFF'
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Agregar al carrito</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
