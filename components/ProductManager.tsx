'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Trash2,
  Package,
  Loader2,
  X,
  DollarSign,
  Hash,
  Type,
  Eye,
  EyeOff,
  Pencil,
  Lock,
  Zap,
  Image as ImageIcon,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category?: string | null
  description?: string | null
  options?: any
  active: boolean
}

type ProductImageItem = {
  id: string
  file?: File
  url?: string
  preview: string
}

export default function ProductManager({
  initialProducts,
  storeId,
  storeSlug,
  isPro,
}: {
  initialProducts: Product[]
  storeId: string
  storeSlug: string
  isPro: boolean
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'General',
    description: '',
  })
  const [productImages, setProductImages] = useState<ProductImageItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [options, setOptions] = useState<{ name: string; values: string }[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showForm])

  function openEditForm(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category || 'General',
      description: product.description || '',
    })

    const parsedOptions = product.options
      ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options)
      : []
    const mappedOptions = Array.isArray(parsedOptions)
      ? parsedOptions.map((opt: any) => ({
          name: opt.name || '',
          values: Array.isArray(opt.values) ? opt.values.join(', ') : ''
        }))
      : []
    setOptions(mappedOptions)
    
    // Parse existing image URLs
    const urls = product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : []
    const items: ProductImageItem[] = urls.map((url, index) => ({
      id: `url-${index}-${Date.now()}`,
      url,
      preview: url
    }))
    setProductImages(items)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', price: '', stock: '', category: 'General', description: '' })
    setOptions([])
    productImages.forEach(img => {
      if (img.file && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setProductImages([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const uploadedUrls: string[] = []

      for (const item of productImages) {
        if (item.url) {
          uploadedUrls.push(item.url)
        } else if (item.file) {
          const formData = new FormData()
          formData.append('file', item.file)
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!uploadRes.ok) throw new Error('Falló al subir una de las imágenes')
          const uploadData = await uploadRes.json()
          uploadedUrls.push(uploadData.url)
        }
      }

      const imageUrl = uploadedUrls.length > 0 ? uploadedUrls.join(',') : null

      const method = editingId ? 'PUT' : 'POST'
      const serializedOptions = options
        .map(opt => ({
          name: opt.name.trim(),
          values: opt.values
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
        }))
        .filter(opt => opt.name && opt.values.length > 0)

      const payload: any = {
        id: editingId,
        name: form.name,
        price: parseInt(form.price),
        stock: Math.min(parseInt(form.stock) || 0, 99),
        category: form.category,
        description: form.description,
        options: serializedOptions.length > 0 ? serializedOptions : null,
        imageUrl,
      }

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        if (editingId) {
          setProducts(prev => prev.map(p => p.id === editingId ? data.product : p))
          toast.success("Producto actualizado")
        } else {
          setProducts(prev => [data.product, ...prev])
          toast.success("Producto añadido al catálogo")
        }
        closeForm()
      } else {
        toast.error(data.error || "Datos inválidos", {
          description: "Revisa los campos del producto e intenta de nuevo."
        })
      }
    } catch (err) {
      console.error(err)
      toast.error("Error de guardado", {
        description: "No pudimos procesar el producto. Verifica tu conexión."
      })
    }

    setLoading(false)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const spaceLeft = 5 - productImages.length
      const filesToAdd = files.slice(0, spaceLeft)
      
      if (filesToAdd.length === 0) {
        if (productImages.length >= 5) {
          toast.error("Límite de imágenes alcanzado", {
            description: "Puedes subir un máximo de 5 imágenes."
          })
        }
        return
      }

      const newItems: ProductImageItem[] = filesToAdd.map((file, index) => {
        const preview = URL.createObjectURL(file)
        return {
          id: `file-${index}-${Date.now()}-${Math.random()}`,
          file,
          preview
        }
      })

      setProductImages(prev => [...prev, ...newItems].slice(0, 5))
      
      if (files.length > spaceLeft) {
        toast.warning("Límite excedido", {
          description: `Solo se agregaron las primeras ${spaceLeft} imágenes.`
        })
      }
    }
  }

  function removeImage(index: number) {
    setProductImages(prev => {
      const target = prev[index]
      if (target.file && target.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  function moveImage(index: number, direction: 'left' | 'right') {
    setProductImages(prev => {
      const newImages = [...prev]
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      if (targetIndex >= 0 && targetIndex < newImages.length) {
        const temp = newImages[index]
        newImages[index] = newImages[targetIndex]
        newImages[targetIndex] = temp
      }
      return newImages
    })
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      })

      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, active: !active } : p))
      )
      
      toast(active ? "Producto ocultado" : "Producto visible", {
        icon: active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
      })
    } catch (err) {
      console.error(err)
      toast.error("No se pudo cambiar el estado")
    }
  }

  async function deleteProduct(id: string) {
    toast("¿Eliminar producto?", {
      description: "Esta acción es permanente y no se puede deshacer.",
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
            setProducts(prev => prev.filter(p => p.id !== id))
            toast.success("Producto eliminado permanentemente")
          } catch (err) {
            console.error(err)
            toast.error("Error al eliminar")
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    })
  }

  const canAddProduct = isPro || products.length < 10

  return (
    <div className="space-y-4 pb-20 animate-in">
      {/* Unified Reactive Header */}
      {!showForm && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Suministros y Activos</h1>
              <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Inventario operativo — <span className="text-zinc-900 font-bold">{products.length} módulos activos</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              {!isPro && (
                <div className="bg-zinc-50 border border-zinc-200 text-zinc-600 px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span>{products.length} / 10 espacios usados</span>
                </div>
              )}
              
              {canAddProduct ? (
                <button
                  onClick={() => {
                    setEditingId(null)
                    setForm({ name: '', price: '', stock: '', category: 'General', description: '' })
                    setOptions([])
                    setProductImages([])
                    setShowForm(true)
                  }}
                  className="flex items-center justify-center gap-2 h-9 px-3.5 bg-zinc-950 text-white hover:bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Producto</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5 bg-amber-50/50 border border-amber-200/60 rounded-lg px-3.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-amber-900 leading-none">Límite alcanzado</span>
                    <Link 
                      href="/configuracion"
                      className="text-amber-600 hover:text-amber-700 underline underline-offset-2 text-[10px] font-semibold mt-1"
                    >
                      Actualizar a Pro
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Creation Engine (Modal via Portal) */}
      {showForm && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
          {/* Backdrop with premium global obsidian blur (Softer version) */}
          <div 
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl transition-all duration-500"
            onClick={closeForm}
          />
          
          <div className="premium-card p-6 md:p-10 relative overflow-hidden bg-white border-zinc-200/60 max-w-5xl w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -mr-40 -mt-20 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <p className="text-[11px] font-bold tracking-[0.08em] text-zinc-400 uppercase mb-1">Editor de inventario</p>
                <h3 className="text-2xl font-semibold text-zinc-955 tracking-tight font-display">
                  {editingId ? 'Modificar producto' : 'Nuevo registro'}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="w-10 h-10 rounded-lg bg-zinc-50 border border-gray-200 flex items-center justify-center text-zinc-400 hover:text-black hover:border-black/10 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  {/* Field: Name */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Nombre del producto</label>
                    <div className="relative group">
                      <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
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
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-5 py-3 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all min-h-[120px] resize-y"
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
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all tabular-nums"
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
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all tabular-nums"
                          placeholder="0"
                          value={form.stock}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === "" || (parseInt(val) <= 99 && parseInt(val) >= 0)) {
                              setForm(f => ({ ...f, stock: val }));
                            }
                          }}
                          min="0"
                          max="99"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variantes / Clasificación */}
                  <div className="space-y-4 pt-4 border-t border-zinc-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[13px] font-bold tracking-tight text-zinc-800">Variantes / Opciones</label>
                        <p className="text-[11px] text-zinc-400">Define variaciones como talla, color, sabor, etc.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOptions(prev => [...prev, { name: '', values: '' }])}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Añadir Opción</span>
                      </button>
                    </div>

                    {options.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 italic bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">Este producto se venderá sin variaciones (sin selectores de talla/color).</p>
                    ) : (
                      <div className="space-y-3.5">
                        {options.map((opt, idx) => (
                          <div key={idx} className="flex gap-3 items-end p-3.5 bg-zinc-50 border border-zinc-100 rounded-xl relative group">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400">Nombre de la opción (Ej: Color)</label>
                                <input
                                  type="text"
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all"
                                  placeholder="Ej: Talla"
                                  value={opt.name}
                                  onChange={e => {
                                    const val = e.target.value
                                    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, name: val } : o))
                                  }}
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400">Valores (separados por comas)</label>
                                <input
                                  type="text"
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-950 placeholder:text-zinc-350 focus:outline-none focus:border-emerald-500/30 transition-all"
                                  placeholder="Ej: S, M, L, XL"
                                  value={opt.values}
                                  onChange={e => {
                                    const val = e.target.value
                                    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, values: val } : o))
                                  }}
                                  required
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOptions(prev => prev.filter((_, i) => i !== idx))}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all cursor-pointer border-none shrink-0 mb-0.5"
                              title="Eliminar opción"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual System */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">
                      Imágenes del producto ({productImages.length}/5)
                    </label>
                    <span className="text-[11px] text-zinc-400">La primera imagen será la principal</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {productImages.map((img, idx) => (
                      <div 
                        key={img.id}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50 shadow-sm transition-all duration-300",
                          idx === 0 && "ring-2 ring-zinc-950 ring-offset-2"
                        )}
                      >
                        <img 
                          src={img.preview} 
                          alt={`Imagen ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        
                        {/* Principal Badge */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-zinc-950 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm tracking-wider z-20">
                            Principal
                          </div>
                        )}

                        {/* Hover Actions Panel */}
                        <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                          {/* Top Row: Delete */}
                          <div className="flex justify-end">
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="w-8 h-8 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                              title="Eliminar imagen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Bottom Row: Reordering controls */}
                          <div className="flex justify-between items-center gap-1.5 w-full mt-auto">
                            {idx > 0 ? (
                              <button 
                                type="button"
                                onClick={() => moveImage(idx, 'left')}
                                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                                title="Mover a la izquierda"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="w-8 h-8" />
                            )}
                            
                            <span className="text-[10px] text-white/80 font-bold bg-black/35 px-2 py-1 rounded">
                              {idx + 1}
                            </span>

                            {idx < productImages.length - 1 ? (
                              <button 
                                type="button"
                                onClick={() => moveImage(idx, 'right')}
                                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                                title="Mover a la derecha"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="w-8 h-8" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Upload Trigger card if images < 5 */}
                    {productImages.length < 5 && (
                      <label className="border-2 border-dashed border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50/50 aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/webp" 
                          multiple
                          onChange={handleImageSelect} 
                        />
                        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-zinc-100 group-hover:text-zinc-805 transition-all shadow-sm">
                          <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-805" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 group-hover:text-zinc-650 transition-colors text-center px-2">
                          Añadir imagen
                        </span>
                      </label>
                    )}
                  </div>
                </div>
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
      )}

      {/* Product Display Grid */}
      {products.length === 0 ? (
        <div className="text-center py-32 premium-card rounded-lg border-dashed border-gray-200 bg-white/50">
          <div className="w-20 h-20 rounded-lg bg-zinc-50 flex items-center justify-center mx-auto mb-8 border border-gray-200">
            <Package className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-black tracking-tight font-display">Sin productos</h3>
          <p className="text-zinc-400 text-xs font-bold tracking-widest mt-2 leading-relaxed uppercase">Comienza añadiendo productos a tu catálogo digital</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.map(product => (
            <div
              key={product.id}
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
                    onClick={() => openEditForm(product)}
                    className="w-10 h-10 rounded-lg bg-white text-black hover:bg-black hover:text-white border border-gray-200 shadow-sm transition-all flex items-center justify-center active:scale-90"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(product.id, product.active)}
                    className="w-10 h-10 rounded-lg bg-white text-black hover:bg-black hover:text-white border border-gray-200 shadow-sm transition-all flex items-center justify-center active:scale-90"
                  >
                    {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="w-10 h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all flex items-center justify-center active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{product.category || 'General'}</span>
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
          ))}
        </div>
      )}
    </div>
  )
}
