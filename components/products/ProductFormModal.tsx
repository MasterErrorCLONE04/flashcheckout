'use client'

import { createPortal } from 'react-dom'
import {
  X,
  Type,
  Package,
  DollarSign,
  Hash,
  Loader2,
  Zap,
} from 'lucide-react'
import { ProductFormData, ProductImageItem, ProductOption } from './types'
import { ProductOptionsField } from './ProductOptionsField'
import { ProductImageGalleryField } from './ProductImageGalleryField'

interface ProductFormModalProps {
  showForm: boolean
  mounted: boolean
  editingId: string | null
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
}

export function ProductFormModal({
  showForm,
  mounted,
  editingId,
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
}: ProductFormModalProps) {
  if (!showForm || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Backdrop with premium global obsidian blur (Softer version) */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl transition-all duration-500"
        onClick={onClose}
      />
      
      <div className="premium-card p-6 md:p-10 relative overflow-hidden bg-white border-zinc-200/60 max-w-5xl w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -mr-40 -mt-20 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.08em] text-zinc-400 uppercase mb-1">Editor de inventario</p>
            <h3 className="text-2xl font-semibold text-zinc-950 tracking-tight font-display">
              {editingId ? 'Modificar producto' : 'Nuevo registro'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-zinc-50 border border-gray-200 flex items-center justify-center text-zinc-400 hover:text-black hover:border-black/10 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              {/* Field: Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Nombre del producto</label>
                <div className="relative group">
                  <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                  <input
                    type="text"
                    className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
                    placeholder="Ej: AirPods Max"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Field: Description */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Descripción y Características</label>
                <div className="relative group">
                  <textarea
                    className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-5 py-3 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all min-h-[120px] resize-y"
                    placeholder="Describe tu producto detalladamente. Puedes añadir características usando viñetas o guiones."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Field: Category */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Categoría</label>
                <div className="relative group">
                  <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                  <select
                    className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-semibold text-black appearance-none focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="General">General</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Moda">Moda</option>
                    <option value="Calzado">Calzado</option>
                    <option value="Accesorios y Joyas">Accesorios y Joyas</option>
                    <option value="Belleza y Cuidado Personal">Belleza y Cuidado Personal</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                    <option value="Juguetes y Bebés">Juguetes y Bebés</option>
                    <option value="Mascotas">Mascotas</option>
                    <option value="Salud">Salud</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Libros y Papelería">Libros y Papelería</option>
                    <option value="Herramientas y Ferretería">Herramientas y Ferretería</option>
                    <option value="Regalos y Detalles">Regalos y Detalles</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Field: Price */}
                <div className="space-y-2">
                  <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Precio unitario</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                    <input
                      type="number"
                      className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all tabular-nums"
                      placeholder="0"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Field: Stock */}
                <div className="space-y-2">
                  <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Stock disponible</label>
                  <div className="relative group">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                    <input
                      type="number"
                      className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all tabular-nums"
                      placeholder="0"
                      value={form.stock}
                      onChange={e => {
                        const val = e.target.value
                        if (val === "" || (parseInt(val) <= 99 && parseInt(val) >= 0)) {
                          setForm(f => ({ ...f, stock: val }))
                        }
                      }}
                      min="0"
                      max="99"
                    />
                  </div>
                </div>
              </div>

              {/* Variantes / Clasificación */}
              <ProductOptionsField options={options} setOptions={setOptions} />
            </div>

            {/* Visual System */}
            <ProductImageGalleryField
              productImages={productImages}
              handleImageSelect={handleImageSelect}
              removeImage={removeImage}
              moveImage={moveImage}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium h-12 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold tracking-tight">
                  {editingId ? 'Guardar cambios' : 'Añadir al catálogo'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}
