'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
  initialPhone,
  initialCart = {},
  initialName = '',
  initialAddress = ''
}: { 
  store: Store, 
  initialPhone?: string,
  initialCart?: Record<string, number>,
  initialName?: string,
  initialAddress?: string
}) {
  const [cart, setCart] = useState<Record<string, number>>(initialCart)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Checkout Form State - Load from session
  const [form, setForm] = useState({
    customerName: initialName,
    address: initialAddress,
    city: 'Colombia',
    lat: null as number | null,
    lng: null as number | null
  })
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [hasChanged, setHasChanged] = useState(false)
  const [loadingAction, setLoadingAction] = useState<null | 'whatsapp' | 'card'>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!initialPhone || !hasChanged) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/whatsapp/sync-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phoneNumber: initialPhone, 
            cartData: { items: cart },
            storeId: store.id,
            customerName: form.customerName,
            address: form.address
          })
        })
      } catch (e) { console.error('Sync failed') }
    }, 2000)
    return () => clearTimeout(timer)
  }, [cart, initialPhone, store.id, hasChanged])

  // Handle native back buttons / WebView back events
  useEffect(() => {
    window.history.pushState({ page: 'catalog' }, '')

    const handlePopState = (e: PopStateEvent) => {
      if (isCartOpen) {
        setIsCartOpen(false)
        window.history.pushState({ page: 'catalog' }, '')
      } else {
        window.location.href = "whatsapp://"
        setTimeout(() => {
          window.close()
        }, 100)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isCartOpen])

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
    setHasChanged(true)
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
        <div className="w-24 h-24 bg-green-50 rounded-lg flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#25D366] rounded-lg flex items-center justify-center animate-bounce">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">¡Pedido Recibido!</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed text-lg">
          Hemos enviado un mensaje de confirmation a tu WhatsApp. <br/>
          <span className="font-bold text-zinc-800">Cierra esta ventana y vuelve al chat</span> para continuar.
        </p>
        <button 
          onClick={() => {
            window.location.href = "whatsapp://"
            setTimeout(() => {
              window.close()
            }, 300)
          }}
          className="w-full h-15 bg-zinc-900 text-white rounded-lg font-bold text-lg shadow-xl shadow-zinc-200 active:scale-95 transition-all"
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
      <header className="sticky top-0 z-50 glass-premium border-b border-white/20 px-4 h-[70px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="w-10 h-10 small flex items-center justify-center text-zinc-900 active:bg-zinc-100 rounded-lg transition-colors" 
            onClick={() => {
              if (isCartOpen) {
                setIsCartOpen(false)
              } else {
                window.location.href = "whatsapp://"
                setTimeout(() => {
                  window.close()
                }, 100)
              }
            }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[17px] font-black tracking-tight uppercase">{store.name}</h1>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Catálogo oficial</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="w-10 h-10 flex items-center justify-center bg-zinc-50 rounded-lg text-zinc-600 active:bg-zinc-200 transition-colors"
          >
            {viewMode === 'grid' ? <LayoutGrid className="w-5 h-5" /> : <Settings2 className="w-5 h-5 rotate-90" />} 
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center bg-zinc-950 rounded-lg relative active:scale-90 transition-all" 
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {itemsInCart > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-lg border-2 border-white shadow-sm animate-in zoom-in">
                {itemsInCart}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 pb-32">
        {/* Premium Search Bar */}
        <div className="px-4 py-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-950 transition-colors" />
            <input 
              type="text"
              placeholder="¿Qué buscas hoy?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100/80 border border-zinc-200/50 rounded-lg py-4 pl-14 pr-6 text-[16px] font-medium outline-none focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all"
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
                "whitespace-nowrap px-6 py-2.5 rounded-lg text-[14px] font-black transition-all border uppercase tracking-wider",
                selectedCategory === cat 
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-xl"
                  : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300 bg-white/50 backdrop-blur-md"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid/List */}
        <div className={cn(
          "px-4 pb-32",
          viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"
        )}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={cn(
                "group relative bg-white border border-black/5 rounded-lg overflow-hidden transition-all duration-500",
                viewMode === 'grid' ? "flex flex-col glass-premium p-2" : "flex gap-4 p-4 border-zinc-100"
              )}
            >
              {/* Image Container */}
              <div 
                className={cn(
                  "relative rounded-lg overflow-hidden shrink-0 cursor-pointer",
                  viewMode === 'grid' ? "aspect-square w-full mb-3" : "w-32 h-32"
                )}
                onClick={() => setSelectedProduct(product)}
              >
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    width={400} 
                    height={400} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-200 bg-zinc-50">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                )}

                {/* Grid Overlay Controls */}
                {cart[product.id] && viewMode === 'grid' && (
                  <div className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                     <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl rounded-lg p-1.5 shadow-2xl border border-white">
                        <button onClick={(e) => { e.stopPropagation(); changeQty(product.id, -1); }} className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center active:scale-75 transition-transform"><Minus className="w-4 h-4" /></button>
                        <span className="font-black text-lg w-5 text-center">{cart[product.id]}</span>
                        <button onClick={(e) => { e.stopPropagation(); changeQty(product.id, 1); }} className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center active:scale-75 transition-transform"><Plus className="w-4 h-4" /></button>
                     </div>
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                  <h3 className={cn(
                    "font-black text-zinc-900 leading-[1.1] uppercase tracking-tighter",
                    viewMode === 'grid' ? "text-[15px] line-clamp-2 px-2" : "text-[18px] mb-1"
                  )}>
                    {product.name}
                  </h3>
                  {viewMode === 'list' && (
                    <p className="text-[13px] text-zinc-500 line-clamp-2 mb-2 leading-tight font-medium">
                      Calidad premium garantizada. Disponible ahora en catálogo.
                    </p>
                  )}
                  <p className={cn(
                    "font-black text-zinc-950",
                    viewMode === 'grid' ? "text-[17px] px-2 mt-1" : "text-xl"
                  )}>
                    ${product.price.toLocaleString('es-CO')}
                  </p>
                </div>

                <div className={cn(
                  "flex items-center justify-between",
                  viewMode === 'grid' ? "px-2 pb-1" : "mt-3"
                )}>
                  {cart[product.id] && viewMode === 'list' ? (
                    <div className="flex items-center gap-4 bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                      <button onClick={() => changeQty(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-zinc-200"><Minus className="w-4 h-4" /></button>
                      <span className="font-black text-sm">{cart[product.id]}</span>
                      <button onClick={() => changeQty(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-zinc-200"><Plus className="w-4 h-4" /></button>
                    </div>
                  ) : !cart[product.id] ? (
                    <button 
                      onClick={() => changeQty(product.id, 1)}
                      className={cn(
                        "rounded-lg bg-zinc-900 text-white shadow-lg active:scale-90 transition-all flex items-center justify-center",
                        viewMode === 'grid' ? "w-10 h-10 mt-2" : "px-6 h-10 text-[13px] font-black uppercase tracking-widest"
                      )}
                    >
                      {viewMode === 'list' && <span className="mr-2">Agregar</span>}
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Premium Obsidian Footer */}
      {itemsInCart > 0 && !isCartOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40 animate-in slide-in-from-bottom-10 duration-700">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-zinc-950 text-white rounded-lg h-20 flex items-center justify-between px-10 shadow-2xl shadow-black/40 active:scale-95 transition-all group border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center text-[14px] font-black border border-white/5">
                {itemsInCart}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-black text-[16px] uppercase tracking-tighter leading-none group-hover:translate-x-1 transition-transform">Revisar orden</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Listo para finalizar</span>
              </div>
            </div>
            <span className="font-black text-2xl tracking-tighter text-white/90">${total.toLocaleString('es-CO')}</span>
          </button>
        </div>
      )}

      {/* Simplified Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="p-8 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Tu Pedido</h2>
                <p className="text-sm font-bold text-zinc-400">Total: {itemsInCart} items</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 small bg-zinc-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-zinc-900" />
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
                      className="w-full bg-zinc-100/50 border-none rounded-lg p-4 text-[15px] outline-none focus:bg-zinc-100 transition-all" 
                      value={form.customerName}
                      onChange={e => {
                        setForm(f => ({ ...f, customerName: e.target.value }))
                        setHasChanged(true)
                      }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="Ciudad" 
                        className="w-full bg-zinc-100/50 border-none rounded-lg p-4 text-[15px] outline-none focus:bg-zinc-100 transition-all" 
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      />
                      <input 
                        placeholder="Dirección" 
                        className="w-full bg-zinc-100/50 border-none rounded-lg p-4 text-[15px] outline-none focus:bg-zinc-100 transition-all" 
                        value={form.address}
                        onChange={e => {
                          setForm(f => ({ ...f, address: e.target.value }))
                          setHasChanged(true)
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 px-1 italic">* También puedes seleccionar en el mapa debajo.</p>
                 </div>
                 
                 <div className="rounded-lg overflow-hidden border border-zinc-100 h-44 shadow-sm">
                   <MapPicker 
                      onLocationSelectAction={(lat, lng, addr) => {
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
                  "w-full h-15 bg-[#25D366] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition-all",
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
                    "w-full h-15 bg-zinc-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all",
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
