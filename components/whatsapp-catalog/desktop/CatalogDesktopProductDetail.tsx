'use client'

import React from 'react'
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Minus, Plus, ShoppingCart } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Product, Store, normalizeProductOptions } from '../types'

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
  store: Store
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
  store
}: CatalogDesktopProductDetailProps) {
  return (
    <main className="max-w-[1300px] mx-auto w-full px-6 py-8 flex-1">
      {/* Back to catalog button */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-6 select-none">
        <button 
          onClick={() => {
            setSelectedProduct(null)
            setActiveNavTab('Productos')
          }}
          className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors border-none bg-transparent cursor-pointer font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Catálogo</span>
        </button>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[200px]">{selectedProduct.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* LEFT COLUMN: Image Gallery */}
        <div className="space-y-4 text-left select-none">
          <div className="relative aspect-square w-full rounded-2xl bg-white border border-zinc-150 overflow-hidden flex items-center justify-center">
            {currentDetailImg ? (
              <img src={currentDetailImg} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-16 h-16 text-zinc-200" />
            )}
            {productImages.length > 1 && (
              <>
                <button onClick={() => setActiveImageIdx(p => p === 0 ? productImages.length - 1 : p - 1)} className="absolute left-3 w-8 h-8 rounded-full bg-white/90 shadow text-zinc-700 flex items-center justify-center border-none cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setActiveImageIdx(p => p === productImages.length - 1 ? 0 : p + 1)} className="absolute right-3 w-8 h-8 rounded-full bg-white/90 shadow text-zinc-700 flex items-center justify-center border-none cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
              </>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto py-1 scrollbar-none">
              {productImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImageIdx(idx)} 
                  className={cn(
                    "w-14 h-14 rounded-xl overflow-hidden border bg-white shrink-0 cursor-pointer transition-all border-none", 
                    activeImageIdx === idx ? "ring-2 ring-[#C5A880] scale-102" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Metadata & Actions */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6 text-left select-none">
          <div className="space-y-1.5 pb-4 border-b border-zinc-100">
            <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase block">{selectedProduct.category || 'Gourmet Series'} • SKU: {productSku}</span>
            <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-snug">{selectedProduct.name}</h3>
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <span className="text-[10px] font-bold text-zinc-500">4.9 (48 valoraciones)</span>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-3xl font-black text-[#4A2E1B] block" suppressHydrationWarning={true}>
              ${selectedProduct.price.toLocaleString('es-CO')}
            </span>

            {/* Dynamic Product Options Selectors */}
            {(() => {
              const parsedOpts = normalizeProductOptions(selectedProduct.options)
              if (parsedOpts.length === 0) return null
              return (
                <div className="space-y-4 pt-1">
                  {parsedOpts.map((opt) => {
                    const currentVal = selectedOptions[opt.name] || opt.values[0]
                    return (
                      <div key={opt.name} className="space-y-1.5 text-left">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block">{opt.name}: {currentVal}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {opt.values.map((val: string) => (
                            <button
                              key={val}
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                              className={cn(
                                "px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-10 border-none",
                                currentVal === val
                                  ? "bg-[#C5A880] text-white font-black"
                                  : "bg-zinc-50 text-zinc-655 hover:bg-zinc-100"
                              )}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            <div className="text-xs font-bold text-[#C5A880] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
              <span>Stock disponible: {selectedProduct.stock} unidades</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-zinc-700"><Truck className="w-3.5 h-3.5 text-[#C5A880]" /><span className="text-[10px] font-bold uppercase tracking-wider">Envío Seguro</span></div>
              <p className="text-[9px] font-bold text-zinc-400 leading-normal">Cajas protegidas térmicamente. Envío en 24h-48h.</p>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-zinc-700"><ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" /><span className="text-[10px] font-bold uppercase tracking-wider">Calidad Premium</span></div>
              <p className="text-[9px] font-bold text-zinc-400 leading-normal">Garantía total del chocolate y frescura del dátil.</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2 text-left">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Descripción del Producto</h4>
            <p className="text-zinc-600 text-xs leading-relaxed font-semibold whitespace-pre-wrap">{selectedProduct.description || 'Deliciosos dátiles gourmet rellenos y bañados en chocolate belga.'}</p>
          </div>

          {/* Checkout actions */}
          <div className="pt-4 border-t border-zinc-100">
            {qtyInCart > 0 ? (
              <div className="flex items-center justify-between gap-4 p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <button onClick={() => changeQtyByKey(selectedCartKey, -1)} className="w-8.5 h-8.5 rounded-xl bg-white border border-zinc-250 flex items-center justify-center cursor-pointer active:scale-95 border-none shadow-sm"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="font-extrabold text-sm w-4 text-center tabular-nums">{qtyInCart}</span>
                  <button onClick={() => changeQtyByKey(selectedCartKey, 1)} disabled={qtyInCart >= selectedProduct.stock} className="w-8.5 h-8.5 rounded-xl bg-white border border-zinc-250 flex items-center justify-center cursor-pointer active:scale-95 border-none shadow-sm"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-sm font-black text-[#4A2E1B] pr-3">${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}</span>
              </div>
            ) : (
              <button 
                onClick={() => changeQtyByKey(selectedCartKey, 1)} 
                disabled={selectedProduct.stock <= 0} 
                className="w-full flex items-center justify-center gap-2.5 h-12.5 bg-[#4A2E1B] hover:bg-[#3D2515] text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-[0.98] border-none"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Agregar al carrito</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related products (Chocodate Style) */}
      <div className="mt-16 pt-10 border-t border-zinc-150 select-none text-left">
        <h3 className="text-sm font-black text-zinc-900 tracking-tight mb-6">Productos Recomendados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {store.products
            .filter(p => p.id !== selectedProduct.id)
            .slice(0, 4)
            .map(p => (
              <div 
                key={p.id} 
                onClick={() => {
                  setSelectedProduct(p)
                  setActiveImageIdx(0)
                }}
                className="group bg-white border border-zinc-150 hover:border-zinc-350 hover:shadow-sm rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 mb-3 shrink-0">
                  {p.imageUrl ? <img src={p.imageUrl.split(',')[0]} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-zinc-300" />}
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-xs text-zinc-905 leading-snug line-clamp-1 group-hover:text-zinc-950">{p.name}</h4>
                  <span className="font-black text-xs text-[#4A2E1B] block">${p.price.toLocaleString('es-CO')}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  )
}
