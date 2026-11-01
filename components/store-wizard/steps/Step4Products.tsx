'use client'

import React from 'react'
import {
  Upload,
  Loader2,
  Plus,
  Image as ImageIcon,
  Trash2
} from 'lucide-react'
import { StoreWizardState } from '../useStoreWizardState'

interface Step4ProductsProps {
  wizard: StoreWizardState
}

export function Step4Products({ wizard }: Step4ProductsProps) {
  const {
    productForm,
    setProductForm,
    uploadingImage,
    handleImageUpload,
    handleAddProduct,
    loading,
    addedProducts,
    handleDeleteProduct
  } = wizard

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Catálogo de productos
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Añade al menos un producto para que Nova empiece a recomendarlo en tus chats.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Product Form Card */}
        <div className="border border-zinc-200/90 rounded-2xl p-5 bg-white space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor="prodName" className="text-xs font-bold text-zinc-700 block">
              Nombre del producto <span className="text-red-500">*</span>
            </label>
            <input
              id="prodName"
              type="text"
              placeholder="Ej. Vestido Floral Rojo (Talla M)"
              className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all"
              value={productForm.name}
              onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="prodPrice" className="text-xs font-bold text-zinc-700 block">
                Precio en COP <span className="text-red-500">*</span>
              </label>
              <input
                id="prodPrice"
                type="number"
                placeholder="25000"
                className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all tabular-nums"
                value={productForm.price}
                onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prodStock" className="text-xs font-bold text-zinc-700 block">
                Stock inicial
              </label>
              <input
                id="prodStock"
                type="number"
                placeholder="10"
                className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all tabular-nums"
                value={productForm.stock}
                onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prodDesc" className="text-xs font-bold text-zinc-700 block">
              Descripción o detalles (Opcional)
            </label>
            <textarea
              id="prodDesc"
              rows={2}
              placeholder="Color, talla, materiales o información de entrega..."
              className="w-full bg-white border border-zinc-200/90 rounded-xl p-3 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all resize-none leading-relaxed"
              value={productForm.description}
              onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Image Upload Area */}
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 border border-zinc-200/90 rounded-xl px-3.5 py-2 cursor-pointer text-xs font-bold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-all shrink-0">
              <Upload className="w-3.5 h-3.5 text-zinc-500" />
              <span>{productForm.imageUrl ? 'Cambiar imagen' : 'Subir foto'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {uploadingImage && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                <span>Subiendo imagen...</span>
              </div>
            )}

            {productForm.imageUrl && !uploadingImage && (
              <div className="flex items-center gap-2">
                <img src={productForm.imageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border" />
                <span className="text-[11px] font-bold text-emerald-600">✓ Foto lista</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddProduct}
            disabled={loading || !productForm.name || !productForm.price}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir al Catálogo
          </button>
        </div>

        {/* Added Products Pill List */}
        {addedProducts.length > 0 && (
          <div className="border border-zinc-200/80 rounded-2xl p-4 bg-zinc-50/50 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-800 pb-1">
              <span>Productos registrados ({addedProducts.length})</span>
              <span className="text-emerald-600 text-[11px]">✓ Catálogo activo</span>
            </div>
            
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
              {addedProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-white border border-zinc-200/80 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate leading-tight">{p.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-semibold">Stock: {p.stock} uds</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-zinc-950 tabular-nums">
                      ${p.price?.toLocaleString('es-CO')} COP
                    </span>
                    <button
                      onClick={() => p.id && handleDeleteProduct(p.id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
