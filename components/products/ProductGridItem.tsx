'use client'

import {
  Package,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Minus,
  Plus,
  Sparkles,
  Images,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from './types'
import { parseProductOptions } from './useProductManagerState'

interface ProductGridItemProps {
  product: Product
  storeSlug: string
  isSelected?: boolean
  isUpdatingStock?: boolean
  onEdit: (product: Product) => void
  onDuplicate?: (product: Product) => void
  onToggleActive: (id: string, active: boolean) => void
  onQuickAdjustStock?: (id: string, nextStock: number) => void
  onDelete: (id: string) => void
}

export function ProductGridItem({
  product,
  isSelected = false,
  isUpdatingStock = false,
  onEdit,
  onDuplicate,
  onToggleActive,
  onQuickAdjustStock,
  onDelete,
}: ProductGridItemProps) {
  const images = product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : []
  const parsedOptions = parseProductOptions(product.options)
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <div
      onClick={() => onEdit(product)}
      className={cn(
        'group rounded-xl border bg-white overflow-hidden transition-all flex flex-col cursor-pointer',
        isSelected
          ? 'border-zinc-950 ring-2 ring-zinc-950/10 shadow-sm'
          : 'border-zinc-200 hover:border-zinc-300 shadow-2xs',
        !product.active && 'bg-zinc-50/70'
      )}
    >
      {/* Top Media Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 border-b border-zinc-200/80">
        {images[0] ? (
          <img
            src={images[0]}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
              !product.active && 'opacity-60 grayscale'
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-1">
            <Package className="w-7 h-7" />
            <span className="text-[10px] font-medium text-zinc-400">Sin foto</span>
          </div>
        )}

        {/* Top Left Status + AI Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border shadow-2xs',
              product.active
                ? 'bg-white/95 text-zinc-900 border-zinc-200'
                : 'bg-zinc-900/90 text-white border-zinc-800'
            )}
          >
            {product.active ? 'Publicado' : 'Oculto'}
          </span>

          {product.aiRecommendation !== false && (
            <span
              className="px-1.5 py-0.5 rounded-md bg-zinc-950/85 text-white text-[9px] font-bold inline-flex items-center gap-1 shadow-2xs"
              title="Recomendado activamente por el Agente WhatsApp IA"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>IA</span>
            </span>
          )}
        </div>

        {/* Multi-image indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-zinc-950/75 text-white text-[9px] font-mono font-bold inline-flex items-center gap-1">
            <Images className="w-2.5 h-2.5" />
            <span>{images.length}</span>
          </div>
        )}

        {/* Stock Alert Badge on bottom-left */}
        {(isOutOfStock || isLowStock) && (
          <div className="absolute bottom-2 left-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-2xs',
                isOutOfStock
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500 text-white'
              )}
            >
              {isOutOfStock ? 'Agotado (0)' : `Stock bajo (${product.stock})`}
            </span>
          </div>
        )}

        {/* Quick Top-Right Action Buttons */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onToggleActive(product.id, product.active)}
            className="w-7 h-7 rounded-md bg-white/95 hover:bg-zinc-950 text-zinc-700 hover:text-white border border-zinc-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            title={product.active ? 'Ocultar de la tienda' : 'Publicar en tienda'}
          >
            {product.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(product)}
              className="w-7 h-7 rounded-md bg-white/95 hover:bg-zinc-950 text-zinc-700 hover:text-white border border-zinc-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Duplicar producto"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="w-7 h-7 rounded-md bg-white/95 hover:bg-rose-600 text-rose-600 hover:text-white border border-zinc-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            title="Eliminar producto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {product.category || 'General'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              #{product.id.slice(-4).toUpperCase()}
            </span>
          </div>

          <h4 className="text-xs font-bold text-zinc-950 leading-snug line-clamp-2">
            {product.name}
          </h4>

          {/* Variants preview pills */}
          {parsedOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {parsedOptions.slice(0, 2).map((opt, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-medium text-zinc-600 truncate max-w-full"
                >
                  <strong className="text-zinc-800">{opt.name}:</strong>{' '}
                  {opt.values.slice(0, 4).join(', ')}
                  {opt.values.length > 4 ? ` +${opt.values.length - 4}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Price & Quick Stock Stepper */}
        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium text-zinc-400 leading-none">Precio</p>
            <p className="text-sm font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
              ${product.price.toLocaleString('es-CO')}
            </p>
          </div>

          {/* Inline Stock Adjuster */}
          <div
            className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg p-0.5"
            onClick={e => e.stopPropagation()}
          >
            {onQuickAdjustStock && (
              <button
                type="button"
                disabled={isUpdatingStock || product.stock <= 0}
                onClick={() => onQuickAdjustStock(product.id, product.stock - 1)}
                className="w-6 h-6 rounded-md hover:bg-white text-zinc-600 hover:text-zinc-950 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                title="Restar 1 unidad"
              >
                <Minus className="w-3 h-3" />
              </button>
            )}
            <span
              className={cn(
                'px-1.5 text-[11px] font-mono font-bold tabular-nums',
                isOutOfStock
                  ? 'text-rose-600'
                  : isLowStock
                    ? 'text-amber-600'
                    : 'text-zinc-800'
              )}
            >
              {product.stock} un.
            </span>
            {onQuickAdjustStock && (
              <button
                type="button"
                disabled={isUpdatingStock}
                onClick={() => onQuickAdjustStock(product.id, product.stock + 1)}
                className="w-6 h-6 rounded-md hover:bg-white text-zinc-600 hover:text-zinc-950 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                title="Sumar 1 unidad"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
