'use client'

import { Package } from 'lucide-react'
import { Product } from './types'
import { ProductGridItem } from './ProductGridItem'

interface ProductCatalogGridProps {
  products: Product[]
  storeSlug: string
  onEdit: (product: Product) => void
  onToggleActive: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export function ProductCatalogGrid({
  products,
  storeSlug,
  onEdit,
  onToggleActive,
  onDelete,
}: ProductCatalogGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-32 premium-card rounded-lg border-dashed border-gray-200 bg-white/50">
        <div className="w-20 h-20 rounded-lg bg-zinc-50 flex items-center justify-center mx-auto mb-8 border border-gray-200">
          <Package className="w-10 h-10 text-zinc-200" />
        </div>
        <h3 className="text-xl font-bold text-black tracking-tight font-display">Sin productos</h3>
        <p className="text-zinc-400 text-xs font-bold tracking-widest mt-2 leading-relaxed uppercase">
          Comienza añadiendo productos a tu catálogo digital
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {products.map(product => (
        <ProductGridItem
          key={product.id}
          product={product}
          storeSlug={storeSlug}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
