'use client'

import {
  Package,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product, ProductViewMode } from './types'
import { ProductGridItem } from './ProductGridItem'
import { parseProductOptions } from './useProductManagerState'

interface ProductCatalogGridProps {
  products: Product[]
  totalProductsCount?: number
  storeSlug: string
  viewMode?: ProductViewMode
  selectedId?: string | null
  updatingStockId?: string | null
  onEdit: (product: Product) => void
  onDuplicate?: (product: Product) => void
  onToggleActive: (id: string, active: boolean) => void
  onQuickAdjustStock?: (id: string, nextStock: number) => void
  onDelete: (id: string) => void
  onResetFilters?: () => void
  onCreateNew?: () => void
}

export function ProductCatalogGrid({
  products,
  totalProductsCount = 0,
  storeSlug,
  viewMode = 'grid',
  selectedId,
  updatingStockId,
  onEdit,
  onDuplicate,
  onToggleActive,
  onQuickAdjustStock,
  onDelete,
  onResetFilters,
  onCreateNew,
}: ProductCatalogGridProps) {
  if (products.length === 0) {
    const isFilteredEmpty = totalProductsCount > 0
    return (
      <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center my-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-bold text-zinc-950">
          {isFilteredEmpty
            ? 'Ningún producto coincide con este filtro'
            : 'Tu catálogo está vacío'}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          {isFilteredEmpty
            ? 'Prueba cambiando la categoría, el estado de stock o el término de búsqueda.'
            : 'Publica tu primer producto en el panel derecho para empezar a vender en tu Tienda Web y por WhatsApp IA.'}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {isFilteredEmpty && onResetFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mostrar todos los productos</span>
            </button>
          ) : (
            onCreateNew && (
              <button
                type="button"
                onClick={onCreateNew}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Primer Producto</span>
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  if (viewMode === 'table') {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-2.5 px-4">Producto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Variantes</th>
                <th className="py-2.5 px-3">Stock Bodega</th>
                <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                <th className="py-2.5 px-3 text-right">Valor Stock</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {products.map(product => {
                const images = product.imageUrl
                  ? product.imageUrl.split(',').filter(Boolean)
                  : []
                const parsedOptions = parseProductOptions(product.options)
                const isSelected = selectedId === product.id
                const isOutOfStock = product.stock <= 0
                const isLowStock = product.stock > 0 && product.stock <= 5
                const stockValue = product.price * Math.max(0, product.stock)

                return (
                  <tr
                    key={product.id}
                    onClick={() => onEdit(product)}
                    className={cn(
                      'transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-zinc-100/90'
                        : 'hover:bg-zinc-50/80',
                      !product.active && 'opacity-65'
                    )}
                  >
                    {/* Producto */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {images[0] ? (
                            <img
                              src={images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-zinc-950 truncate max-w-[220px]">
                              {product.name}
                            </p>
                            {product.aiRecommendation !== false && (
                              <span
                                className="px-1 py-0.2 rounded bg-zinc-950 text-white text-[9px] font-bold inline-flex items-center gap-0.5 shrink-0"
                                title="Recomendado por Agente IA"
                              >
                                <Sparkles className="w-2 h-2 text-amber-400" />
                                IA
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            #{product.id.slice(-6).toUpperCase()}
                            {images.length > 0 ? ` · ${images.length} foto(s)` : ' · Sin fotos'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-zinc-700">
                        {product.category || 'General'}
                      </span>
                    </td>

                    {/* Variantes */}
                    <td className="py-2.5 px-3">
                      {parsedOptions.length === 0 ? (
                        <span className="text-[11px] text-zinc-400">Simple</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {parsedOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-[10px] font-medium text-zinc-700 truncate"
                            >
                              <strong>{opt.name}:</strong> {opt.values.length}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Stock Stepper */}
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg p-0.5">
                        {onQuickAdjustStock && (
                          <button
                            type="button"
                            disabled={updatingStockId === product.id || product.stock <= 0}
                            onClick={() => onQuickAdjustStock(product.id, product.stock - 1)}
                            className="w-6 h-6 rounded hover:bg-white text-zinc-600 hover:text-zinc-950 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        )}
                        <span
                          className={cn(
                            'px-2 font-mono font-bold text-xs tabular-nums',
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                                ? 'text-amber-600'
                                : 'text-zinc-900'
                          )}
                        >
                          {product.stock} un.
                        </span>
                        {onQuickAdjustStock && (
                          <button
                            type="button"
                            disabled={updatingStockId === product.id}
                            onClick={() => onQuickAdjustStock(product.id, product.stock + 1)}
                            className="w-6 h-6 rounded hover:bg-white text-zinc-600 hover:text-zinc-950 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Precio Unitario */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-950 tabular-nums">
                      ${product.price.toLocaleString('es-CO')}
                    </td>

                    {/* Valor Stock */}
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-600 tabular-nums">
                      ${stockValue.toLocaleString('es-CO')}
                    </td>

                    {/* Estado */}
                    <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onToggleActive(product.id, product.active)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border transition-colors cursor-pointer',
                          product.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        )}
                      >
                        {product.active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Oculto</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-2.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1">
                        {onDuplicate && (
                          <button
                            type="button"
                            onClick={() => onDuplicate(product)}
                            className="w-7 h-7 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                            title="Duplicar producto"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDelete(product.id)}
                          className="w-7 h-7 rounded-md border border-zinc-200 bg-white hover:bg-rose-50 text-zinc-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
      {products.map(product => (
        <ProductGridItem
          key={product.id}
          product={product}
          storeSlug={storeSlug}
          isSelected={selectedId === product.id}
          isUpdatingStock={updatingStockId === product.id}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onToggleActive={onToggleActive}
          onQuickAdjustStock={onQuickAdjustStock}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
