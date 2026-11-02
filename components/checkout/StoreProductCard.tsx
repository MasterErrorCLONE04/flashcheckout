'use client'

import { ShoppingBag, Minus, Plus, ShoppingCart } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CheckoutProduct } from './types'

interface StoreProductCardProps {
  product: CheckoutProduct
  qty: number
  onChangeQty: (id: string, delta: number) => void
}

export function StoreProductCard({ product: p, qty, onChangeQty }: StoreProductCardProps) {
  const isOutOfStock = p.stock <= 0
  const isLowStock = p.stock > 0 && p.stock <= 5

  return (
    <ProductCard
      layout="vertical"
      size="md"
      className="group bg-white border border-zinc-200/90 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full hover:border-zinc-300 hover:shadow-sm"
    >
      {/* Imagen del producto */}
      <div className="bg-zinc-100/70 aspect-square relative flex items-center justify-center overflow-hidden shrink-0">
        {isOutOfStock ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="neutral">Agotado</Badge>
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="warning">Últimas {p.stock} uds</Badge>
          </div>
        ) : null}

        {p.imageUrl ? (
          <img
            src={p.imageUrl.split(',')[0]}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <ShoppingBag className="w-10 h-10 text-zinc-300" />
        )}
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-zinc-500">
            {isOutOfStock ? 'Sin stock' : 'Disponible'}
          </p>
          <h3 className="text-sm md:text-base font-semibold text-zinc-950 leading-snug line-clamp-2">
            {p.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-lg font-bold text-zinc-950 leading-none tabular-nums truncate tracking-tight">
            ${p.price.toLocaleString('es-CO')}
          </span>

          <div className="shrink-0 flex items-center">
            {qty > 0 ? (
              <div className="flex items-center gap-1 bg-zinc-950 text-white p-1 rounded-xl h-9">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 rounded-lg hover:bg-white/15 text-white hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChangeQty(p.id, -1)
                  }}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-semibold w-4 text-center tabular-nums">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 rounded-lg hover:bg-white/15 text-white hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChangeQty(p.id, +1)
                  }}
                  disabled={qty >= p.stock}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                className="rounded-xl"
                onClick={() => onChangeQty(p.id, +1)}
                disabled={isOutOfStock}
                aria-label={`Agregar ${p.name} al carrito`}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProductCard>
  )
}
