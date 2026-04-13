'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  ShoppingCart,
  Settings2,
  LayoutGrid,
  Search,
  Plus,
  Minus,
  X,
  MapPin,
  User,
  Globe,
  Trash2,
  ChevronRight,
  MessageCircle,
  CreditCard,
  ShoppingBag
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category?: string
}

type Store = {
  id: string
  name: string
  whatsapp: string
  products: Product[]
  logoUrl: string | null
  cardPaymentsEnabled: boolean
}

export default function WhatsAppCatalog({ 
  store, 
  initialPhone 
}: { 
  store: Store, 
  initialPhone?: string 
}) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Checkout Form State
  const [form, setForm] = useState({
    customerName: '',
    address: '',
    city: '',
    lat: null as number | null,
    lng: null as number | null
  })
  const [loadingAction, setLoadingAction] = useState<null | 'whatsapp' | 'card'>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Sync effect
  useEffect(() => {
    if (!initialPhone || itemsInCart === 0) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/whatsapp/sync-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phoneNumber: initialPhone, 
            cartData: { items: cart },
            storeId: store.id
          })
        })
      } catch (e) { console.error('Sync failed') }
    }, 2000)
    return () => clearTimeout(timer)
  }, [cart, initialPhone, store.id])

  const itemsInCart = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = store.products.reduce((s, p) => s + p.price * (cart[p.id] ?? 0), 0)
  const cartProducts = store.products.filter(p => (cart[p.id] ?? 0) > 0)

  const categories = ['Todos', ...Array.from(new Set(store.products.map(p => p.category || 'Varios')))]

  const filteredProducts = store.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || (p.category || 'Varios') === selectedCategory
    return matchesSearch && matchesCategory
  })

  function changeQty(id: string, delta: number) {
    const product = store.products.find(p => p.id === id)!
    setCart(prev => {
      const currentQty = prev[id] ?? 0
      const newQty = Math.max(0, Math.min(currentQty + delta, product.stock))
      const next = { ...prev, [id]: newQty }
      if (newQty === 0) delete next[id]
      return next
    })
  }

  function validateForm() {
    if (!form.customerName.trim()) {
      toast.error("Ingresa tu nombre para el pedido")
      return false
    }
    if (!form.address.trim()) {
      toast.error("La dirección de entrega es obligatoria")
      return false
    }
    if (!form.city.trim()) {
      toast.error("Ingresa la ciudad de entrega")
      return false
    }
    return true
  }

  async function handleWhatsAppOrder() {
    if (!validateForm()) return
    setLoadingAction('whatsapp')
    const items = cartProducts.map(p => ({ productId: p.id, name: p.name, qty: cart[p.id], price: p.price }))
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: store.id, 
          customerPhone: initialPhone,
          ...form, 
          items 
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsSuccess(true)
        toast.success("¡Pedido enviado!")
      }
      else {
        toast.error(data.error || 'Error al crear pedido')
        setPayError(data.error)
      }
    } catch {
      toast.error('Error de conexión con el bot')
      setPayError('Error de red')
    } finally {
      setLoadingAction(null)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center animate-bounce">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">¡Pedido Recibido!</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed text-lg">
          Hemos enviado un mensaje de confirmación a tu WhatsApp. <br/>
          <span className="font-bold text-zinc-800">Cierra esta ventana y vuelve al chat</span> para continuar.
        </p>
        <button 
          onClick={() => window.close()}
          className="w-full h-15 bg-zinc-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-zinc-200 active:scale-95 transition-all"
        >
          Regresar a WhatsApp
        </button>
      </div>
    )
  }

  async function handleCardPayment() {
    if (!validateForm()) return
    setLoadingAction('card')
    const items = cartProducts.map(p => ({ productId: p.id, qty: cart[p.id]! }))
    try {
      const res = await fetch('/api/checkout/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: store.id, 
          customerPhone: initialPhone,
          customerName: form.customerName.trim(), 
          address: form.address.trim(), 
          city: form.city.trim(), 
          items 
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else {
        toast.error(data.error || 'Error al iniciar pago')
        setPayError(data.error)
      }
    } catch {
      toast.error('Error al conectar con la pasarela de pagos')
      setPayError('Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
      {/* Native Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-1 -ml-1 text-zinc-600 active:bg-zinc-100 rounded-full transition-colors" onClick={() => window.history.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight">Catálogo</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart 
              className={cn("w-6 h-6 text-zinc-600 cursor-pointer", itemsInCart > 0 && "text-zinc-900")} 
              onClick={() => setIsCartOpen(true)}
            />
            {itemsInCart > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemsInCart}
              </span>
            )}
          </div>
          <Settings2 className="w-6 h-6 text-zinc-400" />
          <LayoutGrid className="w-6 h-6 text-zinc-400" />
        </div>
      </header>

      <main className="flex-1 pb-32">
        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600" />
            <input 
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100/70 border-none rounded-xl py-2.5 pl-11 pr-4 text-[15px] outline-none focus:bg-zinc-100 transition-all"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 pb-2 -mt-1 overflow-x-auto no-scrollbar flex items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border",
                selectedCategory === cat 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="mt-2 divide-y divide-zinc-50">
          {filteredProducts.map(product => (
            <div key={product.id} className="flex items-center gap-4 px-4 py-4 active:bg-zinc-50 transition-colors">
              {/* Image Container */}
              <div 
                className="w-24 h-24 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border border-zinc-100/50 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div 
                className="flex-1 min-w-0 pr-2 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <h3 className="text-[15px] font-bold text-zinc-900 truncate mb-0.5">
                  {product.name}
                </h3>
                <p className="text-[13px] text-zinc-500 line-clamp-2 leading-snug mb-2 font-medium">
                  {product.category || 'Varios'} • Click para ver detalle
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-bold text-zinc-900">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                {cart[product.id] ? (
                  <div className="flex items-center gap-3 bg-zinc-100 rounded-full px-1 py-1">
                    <button 
                      onClick={() => changeQty(product.id, -1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-600 active:scale-90 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{cart[product.id]}</span>
                    <button 
                      onClick={() => changeQty(product.id, 1)}
                      className="w-8 h-8 rounded-full bg-zinc-900 text-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => changeQty(product.id, 1)}
                    className="w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 active:bg-zinc-900 active:text-white transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Checkout Bar */}
      {itemsInCart > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full h-14 bg-zinc-900 text-white rounded-2xl px-6 flex items-center justify-between shadow-xl active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                {itemsInCart}
              </div>
              <span className="text-sm font-bold tracking-tight uppercase">Ver Carrito</span>
            </div>
            <span className="text-lg font-bold">${total.toLocaleString('es-CO')}</span>
          </button>
        </div>
      )}

      {/* Simplified Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-6 flex justify-between items-center border-b border-zinc-100">
              <h2 className="text-xl font-bold">Tu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-zinc-100 rounded-full">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Items */}
              <div className="space-y-4">
                {cartProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center">
                    <div className="min-w-0">
                      <p className="font-bold text-[15px] truncate">{p.name}</p>
                      <p className="text-xs text-zinc-500">${p.price.toLocaleString('es-CO')} x {cart[p.id]}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-50 rounded-lg p-1">
                      <button onClick={() => changeQty(p.id, -1)} className="p-1"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-sm font-bold w-4 text-center">{cart[p.id]}</span>
                      <button onClick={() => changeQty(p.id, 1)} className="p-1"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simple Form */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Datos de entrega</label>
                    <input 
                      placeholder="¿A nombre de quién?" 
                      className="w-full bg-zinc-100/50 border-none rounded-xl p-4 text-[15px] outline-none focus:bg-zinc-100 transition-all" 
                      value={form.customerName}
                      onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="Ciudad" 
                        className="w-full bg-zinc-100/50 border-none rounded-xl p-4 text-[15px] outline-none focus:bg-zinc-100 transition-all" 
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      />
                      <input 
                        placeholder="Dirección" 
                        className="w-full bg-zinc-100/50 border-none rounded-xl p-4 text-[15px] outline-none focus:bg-zinc-100 transition-all" 
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 px-1 italic">* También puedes seleccionar en el mapa debajo.</p>
                 </div>
                 
                 <div className="rounded-2xl overflow-hidden border border-zinc-100 h-44 shadow-sm">
                   <MapPicker 
                      onLocationSelectAction={(lat, lng, addr) => {
                        // Intentamos extraer ciudad si el MapPicker lo ofrece, sino mantenemos lo que haya
                        setForm(f => ({ ...f, lat, lng, address: addr || f.address, city: f.city || 'Bogotá' }))
                      }}
                   />
                 </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-500 font-medium">Total a pagar</span>
                <span className="text-2xl font-black">${total.toLocaleString('es-CO')}</span>
              </div>
              
              <button 
                onClick={handleWhatsAppOrder}
                disabled={loadingAction !== null}
                className={cn(
                  "w-full h-15 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition-all",
                  loadingAction === 'whatsapp' && "opacity-70 animate-pulse"
                )}
              >
                <MessageCircle className="w-5 h-5" />
                {loadingAction === 'whatsapp' ? 'Procesando...' : 'Pedir por WhatsApp'}
              </button>

              {store.cardPaymentsEnabled && (
                <button 
                  onClick={handleCardPayment}
                  disabled={loadingAction !== null}
                  className={cn(
                    "w-full h-15 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all",
                    loadingAction === 'card' && "opacity-70 animate-pulse"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  {loadingAction === 'card' ? 'Iniciando Pago...' : 'Pagar con Tarjeta'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
