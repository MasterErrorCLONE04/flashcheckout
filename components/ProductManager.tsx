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
  active: boolean
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
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

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
      image: null,
    })
    setImagePreview(product.imageUrl)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', price: '', stock: '', category: 'General', image: null })
    setImagePreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl: string | null | undefined = undefined

      if (form.image) {
        const formData = new FormData()
        formData.append('file', form.image)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) throw new Error('Falló al subir la imagen')
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      } else if (imagePreview === null) {
        imageUrl = null
      }

      const method = editingId ? 'PUT' : 'POST'
      const payload: any = {
        id: editingId,
        name: form.name,
        price: parseInt(form.price),
        stock: Math.min(parseInt(form.stock) || 0, 99),
        category: form.category,
      }
      
      if (imageUrl !== undefined) payload.imageUrl = imageUrl

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setForm(prev => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
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
    <div className="space-y-10 pb-20 animate-in">
      {/* Unified Reactive Header */}
      {!showForm && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 font-display">Suministros y Activos</h1>
              <div className="text-[15px] font-medium text-zinc-500 mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Inventario Operativo — <span className="text-zinc-950 font-bold">{products.length} MÓDULOS ACTIVOS</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              {!isPro && (
                <div className="bg-primary/10 border border-primary/20 text-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 whitespace-nowrap">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {products.length} / 10 Espacios Usados
                </div>
              )}
              
              {canAddProduct ? (
                <button
                  onClick={() => {
                    setEditingId(null)
                    setForm({ name: '', price: '', stock: '', category: 'General', image: null })
                    setImagePreview(null)
                    setShowForm(true)
                  }}
                  className="btn-premium h-14 flex items-center gap-3 w-full sm:w-auto px-8"
                >
                  <Plus className="w-5 h-5 truncate" />
                  Añadir Producto
                </button>
              ) : (
                <div className="premium-card p-5 flex items-center gap-5 bg-amber-50/50 border-amber-200/60 group hover:bg-amber-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col pr-4">
                    <p className="text-[10px] font-black text-amber-800 tracking-[0.12em] uppercase leading-none mb-1.5">Límite alcanzado</p>
                    <Link 
                      href="/configuracion"
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4 decoration-amber-200"
                    >
                      Eleva tu cuenta a Pro
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-px w-full bg-zinc-100" />
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
                <p className="text-[12px] font-bold tracking-[0.05em] uppercase text-emerald-600 mb-1">Editor de inventario</p>
                <h3 className="text-2xl font-semibold text-zinc-950 tracking-tight font-display">
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
                      <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all"
                        placeholder="Ej: AirPods Max"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Field: Category */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Categoría</label>
                    <div className="relative group">
                      <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <select
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-semibold text-black appearance-none focus:outline-none focus:border-primary/30 transition-all"
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      >
                        <option value="General">General</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Moda">Moda</option>
                        <option value="Hogar">Hogar</option>
                        <option value="Mascotas">Mascotas</option>
                        <option value="Salud">Salud</option>
                        <option value="Deportes">Deportes</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Field: Price */}
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Precio unitario</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all tabular-nums"
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
                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all tabular-nums"
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
                </div>

                {/* Visual System */}
                <div className="space-y-4">
                  <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Imagen del producto</label>
                  <div className="flex h-full gap-4 max-h-[160px]">
                    <label className="flex-1 border-2 border-dashed border-gray-200 hover:border-primary/30 hover:bg-primary/[0.02] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handleImageSelect} 
                      />
                      <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors uppercase">Subir Imagen</span>
                    </label>

                    {imagePreview && (
                      <div className="relative w-40 h-full rounded-lg overflow-hidden border border-gray-200 group animate-in">
                        <img src={imagePreview} alt="Vista" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => { setForm(prev => ({...prev, image: null})); setImagePreview(null) }}
                            className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
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
                    src={product.imageUrl}
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
