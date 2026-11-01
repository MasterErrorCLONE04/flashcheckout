'use client'

import { ShoppingBag, Minus, Plus, ShoppingCart } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import type { CheckoutProduct } from './types'

interface StoreProductCardProps {
  product: CheckoutProduct
  qty: number
  onChangeQty: (id: string, delta: number) => void
}

export function StoreProductCard({ product: p, qty, onChangeQty }: StoreProductCardProps) {
  const originalPrice = Math.floor(p.price * 1.15)

  return (
    <ProductCard
      layout="vertical"
      size="md"
      className="group bg-transparent border border-transparent rounded-none transition-all duration-500 flex flex-col h-full hover:bg-white hover:border-zinc-100/80"
    >
      {/* Contenedor de Imagen con cobertura total */}
      <div className="bg-zinc-100/50 aspect-square relative flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-[#FF5000] text-white text-[9px] font-black px-2 py-0.5 rounded-none tracking-tight">
            New
          </span>
        </div>

        {p.imageUrl ? (
          <img
            src={p.imageUrl.split(',')[0]}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <ShoppingBag className="w-12 h-12 text-zinc-300" />
        )}
      </div>

      <div className="p-4 flex flex-col space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400">Electrónica</p>

          <h3 className="text-base font-bold text-[#111111] leading-tight line-clamp-2">
            {p.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-black text-[#FF5000] leading-none tabular-nums truncate tracking-tighter">
              ${p.price.toLocaleString('en-US')}
            </span>
            <span className="text-[11px] text-zinc-400 font-bold line-through mt-1 tracking-tight">
              ${originalPrice.toLocaleString('en-US')}
            </span>
          </div>

          <div className="shrink-0 flex items-center">
            {qty > 0 ? (
              <div className="flex items-center gap-1 bg-[#FF5000] text-white p-1 rounded-none h-9">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none hover:bg-white/20 text-white"
                  onClick={e => {
                    e.stopPropagation()
                    onChangeQty(p.id, -1)
                  }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-bold w-3 text-center tabular-nums">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none hover:bg-white/20 text-white"
                  onClick={e => {
                    e.stopPropagation()
                    onChangeQty(p.id, +1)
                  }}
                  disabled={qty >= p.stock}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                className="bg-[#FF5000] hover:bg-[#E64500] text-white rounded-none transition-all active:scale-95"
                onClick={() => onChangeQty(p.id, +1)}
                disabled={p.stock <= 0}
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProductCard>
  )
}

