'use client'

import { useState } from 'react'
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
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  active: boolean
}

export default function ProductManager({
  initialProducts,
  storeId,
  isPro,
}: {
  initialProducts: Product[]
  storeId: string
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
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  function openEditForm(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      image: null,
    })
    setImagePreview(product.imageUrl)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', price: '', stock: '', image: null })
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
        name: form.name,
        price: parseInt(form.price),
        stock: parseInt(form.stock) || 0,
      }
      
      if (editingId) payload.id = editingId
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
        } else {
          setProducts(prev => [data.product, ...prev])
        }
        closeForm()
      } else {
        alert(data.error || 'Ocurrió un error validando campos.')
      }
    } catch (err) {
      console.error(err)
      alert('Error en el proceso de guardado o de carga de imagen.')
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
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('¿Eliminar este producto?')) return

    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const canAddProduct = isPro || products.length < 10

  return (
    <div className="space-y-10 pb-20 animate-in">
      {/* Dynamic Action Bar */}
      {!showForm && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tighter font-display">Catálogo</h1>
            <p className="text-zinc-400 font-bold mt-2 text-xs tracking-widest">
              Gestionando <span className="text-primary">{products.length} productos</span> en inventario
            </p>
          </div>
          
          {canAddProduct ? (
            <button
              onClick={() => {
                setEditingId(null)
                setForm({ name: '', price: '', stock: '', image: null })
                setImagePreview(null)
                setShowForm(true)
              }}
              className="btn-premium h-14 flex items-center gap-3"
            >
              <Plus className="w-5 h-5 truncate" />
              Añadir Producto
            </button>
          ) : (
            <div className="premium-card p-4 flex items-center gap-4 bg-amber-50 border-amber-100">
              <Lock className="w-5 h-5 text-amber-600" />
              <p className="text-xs font-bold text-amber-700 tracking-widest">Límite gratuito alcanzado (10/10)</p>
              <Link 
                href="/suscripcion"
                className="bg-amber-600 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest hover:brightness-110 transition-all shadow-md uppercase"
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Modern Creation Engine */}
      {showForm && (
        <div className="premium-card rounded-[3rem] p-10 md:p-14 mb-12 animate-in relative overflow-hidden bg-white border-black/[0.05]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -mr-40 -mt-20" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <p className="text-xs font-bold tracking-widest text-primary mb-2">Editor de inventario</p>
              <h3 className="text-3xl font-bold text-black tracking-tight font-display">
                {editingId ? 'Modificar producto' : 'Nuevo registro'}
              </h3>
            </div>
            <button
              onClick={closeForm}
              className="w-12 h-12 rounded-full bg-zinc-50 border border-black/[0.05] flex items-center justify-center text-zinc-400 hover:text-black hover:border-black/10 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                {/* Field: Name */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1">Nombre del producto</label>
                  <div className="relative group">
                    <Type className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl pl-16 pr-8 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all"
                      placeholder="Ej: AirPods Max"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  {/* Field: Price */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1">Precio unitario</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="number"
                        className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl pl-16 pr-8 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all tabular-nums"
                        placeholder="0"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Field: Stock */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1">Stock disponible</label>
                    <div className="relative group">
                      <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="number"
                        className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl pl-16 pr-8 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all tabular-nums"
                        placeholder="0"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual System */}
              <div className="space-y-4">
                <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1">Imagen del producto</label>
                <div className="flex h-full gap-6">
                  <label className="flex-1 border-2 border-dashed border-black/[0.05] hover:border-primary/30 hover:bg-primary/[0.02] rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative min-h-[220px]">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg, image/png, image/webp" 
                      onChange={handleImageSelect} 
                    />
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors">Seleccionar archivo</span>
                  </label>

                  {imagePreview && (
                    <div className="relative w-56 h-full min-h-[220px] rounded-[2.5rem] overflow-hidden border border-black/[0.05] group animate-in shadow-xl">
                      <img src={imagePreview} alt="Vista" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => { setForm(prev => ({...prev, image: null})); setImagePreview(null) }}
                          className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
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
              className="w-full btn-premium h-14 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  {editingId ? 'Guardar cambios' : 'Añadir al catálogo'}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Product Display Grid */}
      {products.length === 0 ? (
        <div className="text-center py-32 premium-card rounded-[3rem] border-dashed border-black/[0.05] bg-white/50">
          <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center mx-auto mb-8 border border-black/[0.02]">
            <Package className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-black tracking-tight font-display">Sin productos</h3>
          <p className="text-zinc-400 text-xs font-bold tracking-widest mt-2 leading-relaxed uppercase">Comienza añadiendo productos a tu catálogo digital</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className={cn(
                "group premium-card rounded-[3rem] overflow-hidden transition-all duration-700 flex flex-col bg-white border-black/[0.02]",
                !product.active && "opacity-40 grayscale blur-[1px] scale-[0.98]"
              )}
            >
              <div className="relative h-64 w-full overflow-hidden bg-zinc-50">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <Package className="w-12 h-12 text-zinc-400" />
                  </div>
                )}
                
                {/* Status Float */}
                <div className="absolute top-6 left-6">
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border transition-all duration-300 shadow-sm uppercase",
                    product.active ? "bg-white text-black border-black/5" : "bg-black text-white border-black/10"
                  )}>
                    {product.active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Tactical Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEditForm(product)}
                    className="w-14 h-14 rounded-2xl bg-white text-black hover:bg-black hover:text-white transition-all shadow-xl flex items-center justify-center active:scale-90"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleActive(product.id, product.active)}
                    className="w-14 h-14 rounded-2xl bg-white text-black hover:bg-black hover:text-white transition-all shadow-xl flex items-center justify-center active:scale-90"
                  >
                    {product.active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="w-14 h-14 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl flex items-center justify-center active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-10 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-black group-hover:text-primary transition-colors duration-500 tracking-tighter font-display">
                    {product.name}
                  </h4>
                  <div className="flex flex-col mt-6">
                    <p className="text-xs font-bold tracking-widest text-zinc-400 mb-2">Valor unitario</p>
                    <p className="text-2xl font-bold text-black tabular-nums tracking-tight">
                      ${product.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-black/[0.03] flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-xs font-bold tracking-widest text-zinc-400">Stock actual</p>
                    <p className={cn(
                      "text-sm font-bold tabular-nums tracking-tight mt-1",
                      product.stock <= 5 ? "text-red-500" : "text-zinc-600"
                    )}>
                      {product.stock} unidades
                    </p>
                  </div>
                  <Link 
                    href={`/dashboard`} 
                    className="w-10 h-10 rounded-full bg-zinc-50 border border-black/[0.03] flex items-center justify-center text-zinc-300 hover:text-primary hover:bg-primary/5 transition-all active:scale-90"
                  >
                    <ArrowUpRight className="w-4 h-4" />
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
