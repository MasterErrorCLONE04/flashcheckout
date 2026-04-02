'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, MapPin, User, Minus, Plus, MessageCircle, Package, X, Trash2, Search, CreditCard } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
}

type Store = {
  id: string
  name: string
  whatsapp: string
  products: Product[]
  cardPaymentsEnabled: boolean
}

export default function CheckoutForm({ store }: { store: Store }) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [form, setForm] = useState({
    customerName: '',
    address: '',
    city: '',
  })
  const [loadingAction, setLoadingAction] = useState<null | 'whatsapp' | 'card'>(
    null
  )
  const [payError, setPayError] = useState<string | null>(null)
  const loading = loadingAction !== null
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const itemsInCart = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = store.products.reduce(
    (s, p) => s + p.price * (cart[p.id] ?? 0),
    0
  )

  const displayProducts = store.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartProducts = store.products.filter(p => (cart[p.id] ?? 0) > 0)

  // Deshabilitar el scroll del body cuando el carrito está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  // Cierra el carrito automáticamente si se queda vacío
  useEffect(() => {
    if (isCartOpen && itemsInCart === 0) {
      setIsCartOpen(false)
    }
  }, [itemsInCart, isCartOpen])

  function changeQty(id: string, delta: number) {
    const product = store.products.find(p => p.id === id)!
    setCart(prev => {
      const newQty = Math.max(0, Math.min((prev[id] ?? 0) + delta, product.stock))
      const newCart = { ...prev, [id]: newQty }
      if (newQty === 0) delete newCart[id]
      return newCart
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[id]
      return newCart
    })
  }

  async function handleSubmit() {
    if (!form.customerName.trim() || !form.address.trim() || !form.city.trim()) return
    setLoadingAction('whatsapp')
    setPayError(null)

    const items = cartProducts.map(p => ({
      productId: p.id,
      name: p.name,
      qty: cart[p.id],
      price: p.price,
    }))

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: store.id, ...form, items }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPayError(data.error || 'No se pudo crear el pedido')
        setLoadingAction(null)
        return
      }
      window.location.href = data.whatsappUrl
    } catch {
      setPayError('Error de red. Intenta de nuevo.')
      setLoadingAction(null)
    }
  }

  async function handlePayWithCard() {
    if (!form.customerName.trim() || !form.address.trim() || !form.city.trim()) return
    setLoadingAction('card')
    setPayError(null)

    const items = cartProducts.map(p => ({
      productId: p.id,
      qty: cart[p.id]!,
    }))

    try {
      const res = await fetch('/api/checkout/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerName: form.customerName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          items,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPayError(data.error || 'No se pudo iniciar el pago')
        setLoadingAction(null)
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setPayError('Error de red. Intenta de nuevo.')
      setLoadingAction(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header Fijo */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              {store.name}
            </h1>
          </div>
          {itemsInCart > 0 && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <Package className="w-3.5 h-3.5" />
              {itemsInCart} items
            </button>
          )}
        </div>
      </header>

      {/* Catálogo */}
      <main className="max-w-lg mx-auto px-4 pb-32">
        <section className="pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Productos Disponibles
            </h2>
          </div>

          {/* Buscador de Productos */}
          {store.products.length > 5 && (
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input 
                type="text"
                placeholder="Buscar en el catálogo..."
                className="w-full bg-white border border-border shadow-sm rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-4">
            {displayProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-border px-4">
                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-medium">No encontramos productos con ese nombre.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-emerald-600 text-sm font-semibold hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              displayProducts.map(p => (
                <div
                  key={p.id}
                  className="flex gap-4 bg-white rounded-2xl p-4 border border-border hover:border-emerald-200 transition-colors shadow-sm"
                >
                {/* Imagen Cuadrada Uniforme */}
                <div className="w-24 h-24 rounded-xl flex-shrink-0 bg-muted overflow-hidden relative border border-border/50">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                  {p.stock <= 3 && p.stock > 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-[10px] font-bold text-center py-0.5">
                      ¡Faltan {p.stock}!
                    </span>
                  )}
                </div>

                {/* Info & Controles */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-emerald-600 font-bold mt-1">
                      ${p.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                  
                  {/* Fila de controles alineada */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => changeQty(p.id, -1)}
                      disabled={(cart[p.id] ?? 0) === 0}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center bg-white text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold block tabular-nums">
                      {cart[p.id] ?? 0}
                    </span>
                    <button
                      onClick={() => changeQty(p.id, +1)}
                      disabled={(cart[p.id] ?? 0) >= p.stock}
                      className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </section>
      </main>

      {/* Botón Flotante de Compra (Activa el Modal) */}
      {!isCartOpen && total > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-border p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] animate-slide-up">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 font-semibold text-sm flex items-center justify-between px-6 transition-all shadow-lg"
            >
              <div className="flex items-center gap-2 bg-emerald-800/20 px-3 py-1 rounded-full">
                <ShoppingBag className="w-4 h-4" />
                <span>{itemsInCart}</span>
              </div>
              <span>Ver Carrito</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal / Drawer del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          {/* Fondo Oscuro / Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Contenedor del Drawer (Pegado abajo) */}
          <div className="absolute bottom-0 w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col h-[85vh] animate-slide-up">
            
            {/* Cabecera del Drawer */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Tu Compra ({itemsInCart})
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                aria-label="Cerrar Carrito"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido scrolleable (Lista & Formulario) */}
            <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-8">
              
              {/* Resumen de Items Comprados */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Resumen del Pedido
                </h3>
                <div className="space-y-3">
                  {cartProducts.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm border border-border rounded-xl p-3 bg-[#F9FAFB]">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold w-5 text-emerald-600">{cart[p.id]}×</span>
                        <div className="w-10 h-10 bg-white rounded overflow-hidden flex-shrink-0 border border-border">
                           {p.imageUrl ? (
                             <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                           ) : (
                             <ShoppingBag className="w-4 h-4 text-muted-foreground m-3" />
                           )}
                        </div>
                        <span className="font-medium line-clamp-1">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-emerald-900">
                          ${(p.price * cart[p.id]).toLocaleString('es-CO')}
                        </span>
                        <button 
                          onClick={() => removeFromCart(p.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulario de Envío (Customer Info) */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Datos de Entrega
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input
                      id="customer-name"
                      className="w-full border border-border rounded-xl pl-10 pr-4 py-3.5 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                      placeholder="Nombre y Apellido"
                      value={form.customerName}
                      onChange={e =>
                        setForm(f => ({ ...f, customerName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input
                      id="address"
                      className="w-full border border-border rounded-xl pl-10 pr-4 py-3.5 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                      placeholder="Dirección del domicilio"
                      value={form.address}
                      onChange={e =>
                        setForm(f => ({ ...f, address: e.target.value }))
                      }
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input
                      id="city"
                      className="w-full border border-border rounded-xl pl-10 pr-4 py-3.5 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                      placeholder="Dpto / Ciudad / Municipio"
                      value={form.city}
                      onChange={e =>
                        setForm(f => ({ ...f, city: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Fijo del Drawer (Boton de Checkout) */}
            <div className="absolute bottom-0 w-full bg-white border-t border-border p-5 pb-8 sm:pb-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-muted-foreground">Total a pagar</span>
                <span className="text-2xl font-black text-foreground">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>
              {payError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                  {payError}
                </p>
              )}
              {store.cardPaymentsEnabled && (
                <button
                  type="button"
                  onClick={handlePayWithCard}
                  disabled={
                    loading ||
                    !form.customerName.trim() ||
                    !form.address.trim() ||
                    !form.city.trim()
                  }
                  className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-4 font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/15 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  {loadingAction === 'card'
                    ? 'Abriendo pago seguro…'
                    : 'Pagar con tarjeta'}
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !form.customerName.trim() ||
                  !form.address.trim() ||
                  !form.city.trim()
                }
                className={`w-full btn-whatsapp rounded-xl py-4 font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.02] ${
                  store.cardPaymentsEnabled ? 'ring-1 ring-border' : ''
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                {loadingAction === 'whatsapp'
                  ? 'Generando pedido...'
                  : 'Pedir por WhatsApp (sin tarjeta)'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
