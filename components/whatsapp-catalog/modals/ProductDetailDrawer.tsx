'use client'

import React from 'react'
import { X, ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Product, normalizeProductOptions } from '../types'

export interface ProductDetailDrawerProps {
  selectedProduct: Product | null
  onClose: () => void
  device?: string
  productSku: string
  currentDetailImg?: string | null
  selectedOptions: Record<string, string>
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
  qtyInCart: number
  selectedCartKey: string
  changeQtyByKey: (cartKey: string, delta: number) => void
}

export function ProductDetailDrawer({
  selectedProduct,
  onClose,
  device,
  productSku,
  currentDetailImg,
  selectedOptions,
  setSelectedOptions,
  qtyInCart,
  selectedCartKey,
  changeQtyByKey
}: ProductDetailDrawerProps) {
  if (!selectedProduct) return null

  return (
    <div className={cn("lg:hidden inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300", !!device ? "absolute" : "fixed")}>
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full bg-white rounded-t-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-5 pb-3 flex justify-between items-start border-b border-zinc-100">
          <div>
            <p className="text-[9px] font-bold text-zinc-400 tracking-wider">{selectedProduct.category || 'General'} • SKU: {productSku}</p>
            <h3 className="text-sm font-bold text-zinc-900 mt-0.5 leading-snug">{selectedProduct.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-zinc-50 border border-zinc-200/50 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Product Image */}
          <div className="relative w-full aspect-video bg-zinc-50 border-b border-zinc-100 flex items-center justify-center">
            {currentDetailImg ? <img src={currentDetailImg} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-10 h-10 text-zinc-300" />}
          </div>

          <div className="p-5 space-y-4">
            <span className="text-xl font-black text-zinc-950 block">${selectedProduct.price.toLocaleString('es-CO')}</span>

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
                        <span className="text-[10px] font-bold text-zinc-500">{opt.name}: {currentVal}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {opt.values.map((val: string) => (
                            <button
                              key={val}
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-9",
                                currentVal === val
                                  ? "bg-emerald-600 border-emerald-600 text-white font-extrabold"
                                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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

            <div className="text-[10px] font-bold text-emerald-600">Stock disponible: {selectedProduct.stock} unidades</div>
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Descripción</h4>
              <p className="text-zinc-500 text-xs leading-relaxed font-semibold whitespace-pre-wrap">{selectedProduct.description || 'Sin descripción disponible.'}</p>
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-5 bg-zinc-50 border-t border-zinc-100 flex items-center gap-3">
          {qtyInCart > 0 ? (
            <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-1.5 w-full justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => changeQtyByKey(selectedCartKey, -1)} className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-700 border-none bg-transparent"><Minus className="w-3.5 h-3.5" /></button>
                <span className="font-extrabold text-sm tabular-nums">{qtyInCart}</span>
                <button onClick={() => changeQtyByKey(selectedCartKey, 1)} className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-700 border-none bg-transparent"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <span className="text-xs font-black text-zinc-950 pr-2">${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}</span>
            </div>
          ) : (
            <button
              onClick={() => changeQtyByKey(selectedCartKey, 1)}
              className="w-full flex items-center justify-center gap-2 h-11 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer border-none"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar al carrito</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
