'use client'

import React, { useState, useEffect } from 'react'
import { X, ShoppingBag, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  changeQtyByKey,
}: ProductDetailDrawerProps) {
  const [localImgIdx, setLocalImgIdx] = useState(0)

  useEffect(() => {
    setLocalImgIdx(0)
  }, [selectedProduct?.id])

  if (!selectedProduct) return null

  const images = (selectedProduct.imageUrl || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const displayImg = images[localImgIdx] || currentDetailImg || null

  const hasDiscount =
    typeof selectedProduct.compareAtPrice === 'number' &&
    selectedProduct.compareAtPrice > selectedProduct.price

  return (
    <div
      className={cn(
        'lg:hidden inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-200',
        device ? 'absolute' : 'fixed'
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full bg-white rounded-t-[12px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="px-5 py-3.5 flex justify-between items-center border-b border-[#EAEAE8] shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717A] truncate pr-2">
            {selectedProduct.category || 'Colección'} · {productSku}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full hover:bg-[#F6F6F4] flex items-center justify-center text-[#111111] cursor-pointer border-0 bg-transparent shrink-0"
          >
            <X className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto">
          {/* Studio Plinth Image */}
          <div className="relative w-full aspect-[4/5] max-h-[320px] bg-[#F6F6F4] flex items-center justify-center p-6">
            {displayImg ? (
              <img
                src={displayImg}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <ShoppingBag className="w-10 h-10 text-zinc-300" />
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/5">
                {images.slice(0, 5).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLocalImgIdx(i)}
                    className={cn(
                      'w-5 h-5 rounded-full overflow-hidden border p-0 cursor-pointer bg-white transition-all',
                      localImgIdx === i
                        ? 'border-[#111111] scale-110'
                        : 'border-zinc-300 opacity-65'
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 space-y-4 text-left">
            <div className="space-y-1">
              <h3 className="text-[19px] font-extrabold text-[#111111] tracking-[-0.02em] leading-snug">
                {selectedProduct.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-[18px] font-bold tabular-nums',
                    hasDiscount ? 'text-[#C81E1E]' : 'text-[#111111]'
                  )}
                >
                  ${selectedProduct.price.toLocaleString('es-CO')}
                </span>
                {hasDiscount && (
                  <span className="text-[13px] text-[#A1A1AA] line-through tabular-nums">
                    ${selectedProduct.compareAtPrice!.toLocaleString('es-CO')}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Product Options Selectors */}
            {(() => {
              const parsedOpts = normalizeProductOptions(selectedProduct.options)
              if (parsedOpts.length === 0) return null
              return (
                <div className="space-y-3.5 pt-2 border-t border-[#EAEAE8]">
                  {parsedOpts.map(opt => {
                    const currentVal = selectedOptions[opt.name] || opt.values[0]
                    return (
                      <div key={opt.name} className="space-y-1.5 text-left">
                        <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#71717A] block">
                          {opt.name}: <span className="text-[#111111]">{currentVal}</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {opt.values.map((val: string) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))
                              }
                              className={cn(
                                'px-3.5 py-1.5 rounded-full border text-[11.5px] font-semibold transition-all cursor-pointer',
                                currentVal === val
                                  ? 'bg-[#111111] border-[#111111] text-white'
                                  : 'bg-[#F6F6F4] border-transparent text-[#111111]'
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

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#52525B]">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  selectedProduct.stock > 0 ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                )}
              />
              <span>
                {selectedProduct.stock > 0
                  ? `${selectedProduct.stock} unidades disponibles`
                  : 'Agotado'}
              </span>
            </div>

            {selectedProduct.description && (
              <div className="space-y-1 pt-3 border-t border-[#EAEAE8]">
                <h4 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#71717A]">
                  Descripción
                </h4>
                <p className="text-[#52525B] text-[12.5px] leading-relaxed whitespace-pre-wrap">
                  {selectedProduct.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="px-5 py-4 bg-white border-t border-[#EAEAE8] flex items-center gap-3 shrink-0">
          {qtyInCart > 0 ? (
            <div className="flex items-center gap-4 bg-[#F6F6F4] border border-[#E5E5E3] rounded-full px-3 py-1.5 w-full justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => changeQtyByKey(selectedCartKey, -1)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111111] border border-[#E5E5E3] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm tabular-nums text-[#111111]">
                  {qtyInCart}
                </span>
                <button
                  type="button"
                  onClick={() => changeQtyByKey(selectedCartKey, 1)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111111] border border-[#E5E5E3] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[13px] font-bold text-[#111111] pr-2 tabular-nums">
                ${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => changeQtyByKey(selectedCartKey, 1)}
              disabled={selectedProduct.stock <= 0}
              className="w-full h-11.5 rounded-full bg-[#111111] disabled:bg-zinc-300 text-white text-[11.5px] font-bold uppercase tracking-[0.08em] cursor-pointer border-0"
            >
              {selectedProduct.stock > 0 ? 'Añadir a la bolsa' : 'Agotado'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
