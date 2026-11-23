'use client'

import React from 'react'
import {
  X,
  Plus,
  Loader2,
  Bot,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Tag,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Product, ProductFormData, ProductImageItem, ProductOption } from './types'
import { ProductOptionsField } from './ProductOptionsField'
import { ProductImageGalleryField } from './ProductImageGalleryField'

export interface ProductFormModalProps {
  showForm: boolean
  mounted: boolean
  editingId: string | null
  activeProduct?: Product | null
  storeSlug?: string
  canAddProduct?: boolean
  loading: boolean
  form: ProductFormData
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>
  options: ProductOption[]
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>
  productImages: ProductImageItem[]
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  moveImage: (index: number, direction: 'left' | 'right') => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  onNewProduct?: () => void
  onDuplicate?: (product: Product) => void
  onDelete?: (id: string) => void
}

const STANDARD_CATEGORIES = [
  'General',
  'Tecnología',
  'Moda',
  'Calzado',
  'Accesorios y Joyas',
  'Belleza y Cuidado Personal',
  'Hogar',
  'Alimentos y Bebidas',
  'Juguetes y Bebés',
  'Mascotas',
  'Salud',
  'Deportes',
  'Libros y Papelería',
  'Herramientas y Ferretería',
  'Regalos y Detalles',
  'Otros',
]

export function ProductFormModal({
  showForm,
  editingId,
  activeProduct,
  storeSlug,
  canAddProduct = true,
  loading,
  form,
  setForm,
  options,
  setOptions,
  productImages,
  handleImageSelect,
  removeImage,
  moveImage,
  onSubmit,
  onClose,
  onNewProduct,
  onDuplicate,
  onDelete,
}: ProductFormModalProps) {
  const numericPrice = Math.max(0, parseInt(form.price) || 0)
  const numericStock = Math.max(0, parseInt(form.stock) || 0)
  const inventoryVal = numericPrice * numericStock

  const copyWhatsAppFicha = () => {
    const optsText = options
      .filter(o => o.name.trim() && o.values.trim())
      .map(o => `• ${o.name.trim()}: ${o.values.trim()}`)
      .join('\n')
    const storeUrl =
      typeof window !== 'undefined' && storeSlug
        ? `${window.location.origin}/tienda/${storeSlug}`
        : ''
    const text = [
      `*${form.name || 'Producto'}*`,
      `💰 Precio: *$${numericPrice.toLocaleString('es-CO')} COP*`,
      form.description ? `\n${form.description.trim()}` : '',
      optsText ? `\n${optsText}` : '',
      storeUrl ? `\n🛒 Pedir aquí: ${storeUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(text)
    toast.success('Ficha comercial copiada para WhatsApp')
  }

  return (
    <aside
      className={cn(
        'w-full lg:w-[430px] xl:w-[470px] shrink-0 bg-white flex flex-col h-full overflow-hidden',
        showForm
          ? 'fixed inset-0 z-50 lg:static lg:z-auto'
          : 'hidden lg:flex'
      )}
    >
      {/* Top Studio Inspector Bar */}
      <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-2 bg-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
              editingId
                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                : 'bg-zinc-950 text-white'
            )}
          >
            {editingId ? 'Editando Producto' : 'Nuevo Producto'}
          </span>
          {editingId && (
            <span className="text-[11px] font-mono text-zinc-400 truncate">
              #{editingId.slice(-6).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {editingId && activeProduct && onDuplicate && canAddProduct && (
            <button
              type="button"
              onClick={() => onDuplicate(activeProduct)}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Duplicar producto"
            >
              <Copy className="w-3 h-3" />
              <span>Duplicar</span>
            </button>
          )}
          {editingId && onNewProduct && canAddProduct && (
            <button
              type="button"
              onClick={onNewProduct}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Nuevo</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Preview Mini Card + Quick Share */}
      <div className="px-5 py-3 bg-[#FAFAFA] border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg border border-zinc-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
            {productImages[0]?.preview ? (
              <img
                src={productImages[0].preview}
                alt={form.name || 'Preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-5 h-5 text-zinc-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-zinc-950 truncate">
                {form.name.trim() || 'Nombre del producto...'}
              </p>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase',
                  form.active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-200 text-zinc-700'
                )}
              >
                {form.active ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px]">
              <span className="font-mono font-bold text-zinc-950">
                ${numericPrice.toLocaleString('es-CO')}
              </span>
              <span className="text-zinc-300">·</span>
              <span
                className={cn(
                  'font-semibold',
                  numericStock === 0
                    ? 'text-rose-600'
                    : numericStock <= 5
                      ? 'text-amber-600'
                      : 'text-zinc-600'
                )}
              >
                {numericStock} un.
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-500 font-mono text-[10px]">
                Valor: ${inventoryVal.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={copyWhatsAppFicha}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
          title="Copiar ficha formateada para enviar por WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-500" />
          <span>Ficha WA</span>
        </button>
      </div>

      {/* Scrollable Editor Form */}
      <form
        onSubmit={onSubmit}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
          {/* 1. Multimedia Gallery */}
          <ProductImageGalleryField
            productImages={productImages}
            handleImageSelect={handleImageSelect}
            removeImage={removeImage}
            moveImage={moveImage}
          />

          {/* 2. Core Identity & Visibility */}
          <div className="space-y-3.5 pt-3 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                Información Comercial
              </label>

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer',
                  form.active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                )}
              >
                {form.active ? (
                  <>
                    <Eye className="w-3 h-3 text-emerald-600" />
                    <span>Publicado en Tienda</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-zinc-500" />
                    <span>Oculto al Público</span>
                  </>
                )}
              </button>
            </div>

            {/* Nombre */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">
                Nombre del producto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-3 text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                placeholder="Ej: Camiseta Oversize Heavyweight 300g"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            {/* Categoría con selector + entrada libre */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700">
                  Categoría
                </label>
                <span className="text-[10px] text-zinc-400">
                  Agrupa tu catálogo web
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                  value={
                    STANDARD_CATEGORIES.includes(form.category)
                      ? form.category
                      : '__custom__'
                  }
                  onChange={e => {
                    if (e.target.value !== '__custom__') {
                      setForm(f => ({ ...f, category: e.target.value }))
                    }
                  }}
                >
                  {STANDARD_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {!STANDARD_CATEGORIES.includes(form.category) && (
                    <option value="__custom__">Personalizada: {form.category}</option>
                  )}
                </select>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-2.5 text-xs font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                    placeholder="O escribe categoría..."
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Precio & Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">
                  Precio unitario (COP) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400">
                    $
                  </span>
                  <input
                    type="number"
                    className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg pl-7 pr-3 text-xs font-mono font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all tabular-nums"
                    placeholder="45000"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">
                    Stock disponible
                  </label>
                  <div className="flex items-center gap-1">
                    {[0, 10, 25, 50].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, stock: String(preset) }))}
                        className="px-1.5 py-0.2 rounded bg-zinc-100 hover:bg-zinc-200 text-[9px] font-mono font-bold text-zinc-700 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-3 text-xs font-mono font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all tabular-nums"
                  placeholder="10"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  min="0"
                  max="99999"
                />
              </div>
            </div>

            {/* Descripción Comercial */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">
                Descripción y beneficios
              </label>
              <textarea
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all resize-y"
                placeholder="Materiales, medidas, garantía o detalles clave que verá el comprador en tu tienda..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* 3. Variantes / Opciones */}
          <ProductOptionsField options={options} setOptions={setOptions} />

          {/* 4. Inteligencia Artificial para Ventas por WhatsApp */}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-zinc-900" />
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">
                  Agente Vendedor WhatsApp IA
                </label>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm(f => ({ ...f, aiRecommendation: !f.aiRecommendation }))
                }
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer',
                  form.aiRecommendation
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                )}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{form.aiRecommendation ? 'Recomendación IA Activa' : 'IA No Sugerir'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-500">
                Argumento de cierre / instrucciones para el Agente IA (opcional)
              </label>
              <textarea
                rows={2}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all resize-y"
                placeholder="Ej: Resaltar que incluye envío gratis hoy, horma normal y garantía de 6 meses..."
                value={form.aiDescription}
                onChange={e => setForm(f => ({ ...f, aiDescription: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Sticky Studio Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-200 bg-white flex items-center gap-2 shrink-0">
          {editingId && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(editingId)}
              className="h-10 px-3 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Eliminar producto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || (!editingId && !canAddProduct)}
            className="flex-1 h-10 rounded-lg bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando en catálogo...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {editingId ? 'Guardar Cambios del Producto' : 'Publicar Producto en Catálogo'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </aside>
  )
}
