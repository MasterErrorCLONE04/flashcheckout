'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, Check, Package, DollarSign, Layers, FileText, Sparkles, Sliders } from 'lucide-react'
import { toast } from 'sonner'
import { Product } from './types'
import { uploadStoreImage } from './tiendaPersistence'

interface QuickProductEditModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSaveProduct: (updated: Product) => void
  onOpenCardStyleInspector?: () => void
}

export function QuickProductEditModal({
  product,
  isOpen,
  onClose,
  onSaveProduct,
  onOpenCardStyleInspector,
}: QuickProductEditModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setPrice(String(product.price ?? 0))
      setStock(String(product.stock ?? 0))
      setCategory(product.category || 'General')
      setDescription(product.description || '')
      setImageUrl(product.imageUrl || '')
    }
  }, [product])

  if (!isOpen || !product) return null

  const isDemoProduct = product.id.startsWith('demo-') || product.id.startsWith('preview-')
  const primaryImg = (imageUrl || '').split(',')[0]?.trim() || ''

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await uploadStoreImage(file, 'banner')
      setImageUrl(url)
    } catch {
      // handled by uploadStoreImage
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('El nombre del producto es obligatorio')
      return
    }

    const numericPrice = Math.max(0, Number(price) || 0)
    const numericStock = Math.max(0, Math.round(Number(stock) || 0))

    const updatedLocal: Product = {
      ...product,
      name: name.trim(),
      price: numericPrice,
      stock: numericStock,
      category: category.trim() || 'General',
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
    }

    if (isDemoProduct) {
      onSaveProduct(updatedLocal)
      toast.success('Producto de demostración actualizado en el lienzo')
      onClose()
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          name: updatedLocal.name,
          price: updatedLocal.price,
          stock: updatedLocal.stock,
          category: updatedLocal.category,
          description: updatedLocal.description,
          imageUrl: updatedLocal.imageUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el producto')
      }
      onSaveProduct({ ...updatedLocal, ...(data.product || {}) })
      toast.success(`"${updatedLocal.name}" actualizado en inventario y tienda`)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el producto')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden text-left animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-zinc-900 tracking-tight">
                Edición Rápida de Producto en Lienzo
              </h3>
              <p className="text-[10.5px] text-zinc-500">
                {isDemoProduct
                  ? 'Editando producto de vista previa'
                  : 'Sincronizado en tiempo real con tu inventario y la IA'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenCardStyleInspector && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenCardStyleInspector()
                }}
                className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[10px] font-bold text-zinc-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="Configurar diseño de las tarjetas"
              >
                <Sliders className="w-3 h-3" />
                <span>Estilo de Tarjetas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-zinc-200/60 flex items-center justify-center text-zinc-500 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image + Name Row */}
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 group">
              {primaryImg ? (
                <img src={primaryImg} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Package className="w-6 h-6" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9.5px] font-bold cursor-pointer gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Subiendo...' : 'Cambiar'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 space-y-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Botella Térmica Acero"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 focus:bg-white focus:border-zinc-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-700 focus:bg-white focus:border-zinc-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Price, Stock, Category */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-zinc-400" />
                <span>Precio (COP)</span>
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 focus:bg-white focus:border-zinc-900 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Package className="w-3 h-3 text-zinc-400" />
                <span>Stock Actual</span>
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 focus:bg-white focus:border-zinc-900 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Layers className="w-3 h-3 text-zinc-400" />
                <span>Categoría</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="General"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 focus:bg-white focus:border-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10.5px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-zinc-400" />
              <span>Descripción Corta</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Beneficios clave, materiales, capacidad o garantía del producto..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
            <span className="text-[10.5px] text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>La IA usa estos datos al diseñar</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer border-0 bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border-0 shadow-xs transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

