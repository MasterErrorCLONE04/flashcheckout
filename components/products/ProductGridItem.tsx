'use client'

import Link from 'next/link'
import {
  Package,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from './types'

interface ProductGridItemProps {
  product: Product
  storeSlug: string
  onEdit: (product: Product) => void
  onToggleActive: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export function ProductGridItem({
  product,
  storeSlug,
  onEdit,
  onToggleActive,
  onDelete,
}: ProductGridItemProps) {
  return (
    <div
      className={cn(
        "group premium-card overflow-hidden transition-all duration-700 flex flex-col bg-white border-gray-200",
        !product.active && "opacity-40 grayscale blur-[1px] scale-[0.98]"
      )}
    >
      <div className="relative h-40 w-full overflow-hidden bg-zinc-50 border-b border-black/[0.03]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl.split(',')[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <Package className="w-8 h-8 text-zinc-400" />
          </div>
        )}
        
        {/* Status Float */}
        <div className="absolute top-3 left-3">
          <div className={cn(
            "px-2 py-1 rounded-md text-[9px] font-bold tracking-widest border transition-all duration-300 uppercase",
            product.active ? "bg-white text-black border-gray-200" : "bg-black text-white border-zinc-800"
          )}>
            {product.active ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        {/* Tactical Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="w-10 h-10 rounded-lg bg-white text-black hover:bg-black hover:text-white border border-gray-200 shadow-sm transition-all flex items-center justify-center active:scale-90"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleActive(product.id, product.active)}
            className="w-10 h-10 rounded-lg bg-white text-black hover:bg-black hover:text-white border border-gray-200 shadow-sm transition-all flex items-center justify-center active:scale-90"
          >
            {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-10 h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all flex items-center justify-center active:scale-90"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
              {product.category || 'General'}
            </span>
          </div>
          <h4 className="text-sm font-bold text-black group-hover:text-primary transition-colors duration-500 tracking-tight leading-snug line-clamp-2">
            {product.name}
          </h4>
          <div className="flex flex-col mt-4">
            <p className="text-[10px] font-medium tracking-tight text-zinc-400 mb-0.5">Valor unitario</p>
            <p className="text-lg font-bold text-zinc-950 tabular-nums tracking-tight">
              ${product.price.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] font-medium tracking-tight text-zinc-400">Stock</p>
            <p className={cn(
              "text-[11px] font-bold tabular-nums tracking-tight mt-0.5",
              product.stock <= 5 ? "text-rose-500" : "text-zinc-500"
            )}>
              {product.stock} un.
            </p>
          </div>
          <Link 
            href={`/tienda/${storeSlug}`} 
            className="w-8 h-8 rounded-lg bg-zinc-50 border border-gray-200 flex items-center justify-center text-zinc-300 hover:text-primary hover:bg-primary/5 transition-all active:scale-90"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
