'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  Minus, 
  Plus, 
  MessageCircle, 
  Package, 
  X, 
  Trash2, 
  Search, 
  CreditCard,
  Zap,
  ChevronRight,
  ArrowRight,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="min-h-screen bg-secondary text-foreground selection:bg-primary/20 font-sans animate-in">
      {/* Soft Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/[0.02] blur-[120px]" />
      </div>

      {/* Apple-Style Navigation */}
      <header className="sticky top-0 z-40 glass border-b border-black/[0.05] py-4">
        <div className="max-w-lg mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tighter text-black leading-none font-display">
                {store.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Tienda verificada</p>
              </div>
            </div>
          </div>
          
          {itemsInCart > 0 && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn-premium !px-6 !py-2.5 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemsInCart}
            </button>
          )}
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-lg mx-auto px-6 pb-40 relative z-10">
        <section className="pt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-black tracking-tighter font-display">Catálogo</h2>
              <p className="text-xs font-bold text-zinc-400 tracking-widest mt-2 uppercase">Suministros seleccionados</p>
            </div>
          </div>

          {/* Clean Search */}
          {store.products.length > 4 && (
            <div className="relative mb-10 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Buscar productos..."
                className="w-full bg-white border border-black/[0.05] rounded-2xl pl-16 pr-6 py-5 text-sm font-semibold placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 focus:shadow-[0_0_20px_rgba(0,102,204,0.05)] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          <div className="grid gap-5">
            {displayProducts.length === 0 ? (
              <div className="text-center py-20 premium-card rounded-[3rem] border-dashed bg-white/50 px-8">
                <Search className="w-10 h-10 text-zinc-200 mx-auto mb-6" />
                <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase">No se encontraron productos</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 text-primary text-xs font-bold tracking-widest border border-primary/20 px-8 py-3 rounded-full hover:bg-primary/5 transition-all uppercase"
                >
                  Ver todo
                </button>
              </div>
            ) : (
              displayProducts.map(p => (
                <div
                  key={p.id}
                  className="premium-card rounded-[2rem] p-4 flex gap-5 bg-white border-black/[0.03] group active:scale-[0.98]"
                >
                  <div className="w-28 h-28 rounded-2xl flex-shrink-0 bg-zinc-50 overflow-hidden relative border border-black/[0.02]">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                    )}
                    {p.stock <= 3 && p.stock > 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white text-xs font-bold text-center py-1.5 uppercase">
                        Últimas unidades
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-semibold text-base text-zinc-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-black font-bold text-lg mt-3 tabular-nums">
                        ${p.price.toLocaleString('es-CO')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-zinc-50 border border-black/[0.03] rounded-xl p-1">
                        <button
                          onClick={() => changeQty(p.id, -1)}
                          disabled={(cart[p.id] ?? 0) === 0}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-black hover:bg-black/[0.05] transition-all disabled:opacity-0"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums text-zinc-800">
                          {cart[p.id] ?? 0}
                        </span>
                        <button
                          onClick={() => changeQty(p.id, +1)}
                          disabled={(cart[p.id] ?? 0) >= p.stock}
                          className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all shadow-sm active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Floating Cart Trigger */}
      {!isCartOpen && total > 0 && (
        <div className="fixed bottom-8 inset-x-6 z-40 animate-in flex justify-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-lg btn-premium h-16 flex items-center justify-between px-10"
          >
            <div className="flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-full border border-white/5">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="tabular-nums text-base font-bold text-white">{itemsInCart}</span>
            </div>
            <span className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-white/90">
              Ver pedido <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="tabular-nums font-bold text-xl text-white">
              ${total.toLocaleString('es-CO')}
            </span>
          </button>
        </div>
      )}

      {/* Premium Checkout Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          <div 
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
            onClick={() => setIsCartOpen(false)}
          />
          
          <div className="absolute bottom-0 w-full max-w-lg bg-white border-t border-black/[0.1] rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col h-[90vh] animate-in overflow-hidden relative">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-black/[0.05] bg-zinc-50/50">
              <div>
                <h2 className="text-3xl font-bold text-black tracking-tighter font-display">
                  Tu <span className="text-primary underline underline-offset-8 decoration-primary/20">pedido</span>
                </h2>
                <p className="text-xs font-bold text-zinc-400 tracking-widest mt-2 uppercase">Revisión final de compra</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-12 h-12 bg-white border border-black/[0.05] rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:border-black/10 transition-all active:scale-90 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar">
              
              {/* Manifest */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-400 tracking-widest ml-1 uppercase">Resumen de ítems</h3>
                  <span className="text-xs font-bold text-zinc-500 px-3 py-1 bg-zinc-50 rounded-full border border-black/[0.03] uppercase">{itemsInCart} unidades</span>
                </div>
                <div className="space-y-3">
                  {cartProducts.map(p => (
                    <div key={p.id} className="premium-card p-4 rounded-2xl flex justify-between items-center group bg-white border-black/[0.03]">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-xl bg-zinc-50 overflow-hidden flex-shrink-0 border border-black/[0.02]">
                           {p.imageUrl ? (
                             <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                           ) : (
                             <ShoppingBag className="w-6 h-6 text-zinc-200 m-5" />
                           )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-800 text-[15px] leading-tight truncate">{p.name}</p>
                          <p className="text-primary font-bold text-sm mt-2 tabular-nums">
                            <span className="text-zinc-400 font-medium mr-2">x{cart[p.id]}</span>
                            ${(p.price * cart[p.id]).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(p.id)}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-50 border border-black/[0.03] rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Form */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Información de envío</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Field: Name */}
                  <div className="group space-y-3">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1 group-focus-within:text-primary transition-colors uppercase">Nombre de recibo</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl pl-14 pr-6 py-4.5 text-sm font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all"
                        placeholder="Nombre de quién recibe"
                        value={form.customerName}
                        onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Field: Address */}
                  <div className="group space-y-3">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1 group-focus-within:text-primary transition-colors uppercase">Dirección de entrega</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl pl-14 pr-6 py-4.5 text-sm font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all"
                        placeholder="Calle, carrera, número..."
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Field: City */}
                  <div className="group space-y-3">
                    <label className="text-xs font-bold tracking-widest text-zinc-400 ml-1 group-focus-within:text-primary transition-colors uppercase">Ciudad / municipio</label>
                    <div className="relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl pl-14 pr-6 py-4.5 text-sm font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all"
                        placeholder="Ciudad o municipio"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Checkout */}
            <div className="w-full bg-white/80 backdrop-blur-xl border-t border-black/[0.05] p-8 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
              <div className="flex items-end justify-between mb-8 px-2">
                <div>
                  <p className="text-xs font-bold text-zinc-400 tracking-widest mb-2 uppercase">Valor total a pagar</p>
                  <h3 className="text-4xl font-bold text-black tracking-tighter leading-none tabular-nums font-display">
                    ${total.toLocaleString('es-CO')}
                  </h3>
                </div>
                {itemsInCart > 0 && <span className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full uppercase">Confirmado</span>}
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center py-4 rounded-xl mb-6 flex items-center justify-center gap-2 uppercase">
                   <X className="w-4 h-4" />
                   {payError}
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                 {store.cardPaymentsEnabled && (
                  <button
                    onClick={handlePayWithCard}
                    disabled={loading || !form.customerName.trim() || !form.address.trim() || !form.city.trim()}
                    className="w-full btn-premium h-14 flex items-center justify-center gap-4 group"
                  >
                    <CreditCard className="w-5 h-5" />
                    {loadingAction === 'card' ? 'Procesando...' : 'Pagar con Tarjeta'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.customerName.trim() || !form.address.trim() || !form.city.trim()}
                  className="w-full h-14 bg-[#25D366] text-white rounded-full font-bold text-sm tracking-widest flex items-center justify-center gap-4 disabled:opacity-20 transition-all hover:brightness-110 active:scale-95 group shadow-xl shadow-green-500/10 uppercase"
                >
                  <MessageCircle className="w-6 h-6 fill-current" />
                  {loadingAction === 'whatsapp' ? 'Iniciando...' : 'Confirmar por WhatsApp'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-xs text-zinc-300 font-bold tracking-widest text-center mt-8 uppercase">Protocolo de seguridad activo • FlashCheckout 2026</p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
