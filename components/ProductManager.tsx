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
} from 'lucide-react'
import Link from 'next/link'

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
        // User removed the image preview
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
    <div className="space-y-6">
      {/* Botón superior de Añadir o Banner de Bloqueo */}
      {!showForm && (
        <div className="flex justify-end mb-6">
          {canAddProduct ? (
            <button
              onClick={() => {
                setEditingId(null)
                setForm({ name: '', price: '', stock: '', image: null })
                setImagePreview(null)
                setShowForm(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Añadir Producto
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3 text-amber-800">
                <Lock className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Has alcanzado el límite del plan gratuito (10 productos).
                </p>
              </div>
              <Link 
                href="/suscripcion"
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                Mejorar a Pro
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="bg-white border border-border rounded-2xl p-5 mb-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <button
              onClick={closeForm}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                placeholder="Nombre del producto"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  placeholder="Precio (COP)"
                  value={form.price}
                  onChange={e =>
                    setForm(f => ({ ...f, price: e.target.value }))
                  }
                  required
                  min="0"
                />
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={e =>
                    setForm(f => ({ ...f, stock: e.target.value }))
                  }
                  min="0"
                />
              </div>
            </div>

            {/* Subida de Foto Opcional */}
            <div className="flex items-center gap-3">
              <label className="flex-1 w-full border-2 border-dashed border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleImageSelect} 
                />
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-emerald-700">Añadir Foto del Producto (Opcional)</span>
                <span className="text-xs text-emerald-600/60 mt-0.5">JPEG, PNG o WEBP</span>
              </label>

              {imagePreview && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border/70 shadow-sm group">
                  <img src={imagePreview} alt="Vista" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    title="Remover imagen"
                    onClick={() => { setForm(prev => ({...prev, image: null})); setImagePreview(null) }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                editingId ? 'Actualizar producto' : 'Guardar producto'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Sin productos todavía</p>
          <p className="text-xs text-muted-foreground mt-1">
            Agrega tu primer producto para empezar a vender
          </p>
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {products.map(product => (
            <div
              key={product.id}
              className={`flex items-center gap-4 bg-white border rounded-xl px-4 py-3 transition-all ${
                product.active
                  ? 'border-border/60'
                  : 'border-border/40 opacity-60'
              }`}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm text-emerald-600 font-bold">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEditForm(product)}
                  className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(product.id, product.active)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={product.active ? 'Desactivar' : 'Activar'}
                >
                  {product.active ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
