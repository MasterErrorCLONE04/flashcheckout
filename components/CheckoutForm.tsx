'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })
import {
  ShoppingBag,
  MapPin,
  User,
  Minus,
  Plus,
  MessageCircle,
  X,
  Trash2,
  Search,
  CreditCard,
  Zap,
  ChevronRight,
  ArrowRight,
  Globe,
  ShoppingCart,
  PlusCircle,
  Star,
  Flame,
  Timer,
  Play,
  Percent,
  HelpCircle,
  Eye,
  Heart,
} from 'lucide-react'
import { cn } from "@/lib/utils"

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
  logoUrl: string | null
  cardPaymentsEnabled: boolean
}

export default function CheckoutForm({ 
  store, 
  initialPhone 
}: { 
  store: Store, 
  initialPhone?: string 
}) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [form, setForm] = useState({
    customerName: '',
    address: '',
    city: '',
    lat: null as number | null,
    lng: null as number | null
  })
  const [loadingAction, setLoadingAction] = useState<null | 'whatsapp' | 'card'>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const loading = loadingAction !== null
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const itemsInCart = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = store.products.reduce((s, p) => s + p.price * (cart[p.id] ?? 0), 0)
  const cartProducts = store.products.filter(p => (cart[p.id] ?? 0) > 0)

  const displayProducts = store.products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isCartOpen])

  useEffect(() => {
    if (isCartOpen && itemsInCart === 0) setIsCartOpen(false)
  }, [itemsInCart, isCartOpen])

  function changeQty(id: string, delta: number) {
    const product = store.products.find(p => p.id === id)!
    setCart(prev => {
      const newQty = Math.max(0, Math.min((prev[id] ?? 0) + delta, product.stock))
      const next = { ...prev, [id]: newQty }
      if (newQty === 0) delete next[id]
      return next
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function handleSubmit() {
    if (!form.customerName.trim() || !form.address.trim() || !form.city.trim()) return
    setLoadingAction('whatsapp')
    setPayError(null)
    const items = cartProducts.map(p => ({ productId: p.id, name: p.name, qty: cart[p.id], price: p.price }))
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: store.id, 
          customerPhone: initialPhone,
          ...form, 
          items, 
          latitude: form.lat, 
          longitude: form.lng 
        }),
      })
      const data = await res.json()
      if (!res.ok) { setPayError(data.error || 'No se pudo crear el pedido'); setLoadingAction(null); return }
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
      if (!res.ok) { setPayError(data.error || 'No se pudo iniciar el pago'); setLoadingAction(null); return }
      if (data.url) window.location.href = data.url
    } catch {
      setPayError('Error de red. Intenta de nuevo.')
      setLoadingAction(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F7] font-sans text-foreground">
      <StoreHeader storeName={store.name} itemsInCart={itemsInCart} logoUrl={store.logoUrl} onCartOpen={() => setIsCartOpen(true)} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 pb-40">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold tracking-tighter text-foreground leading-none m-0">
            CatÃƒÂ¡logo
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-[0.1em] mt-2.5 mb-0">
            Suministros seleccionados de alta gama
          </p>
        </div>

        {/* Search */}
        {store.products.length > 4 && (
          <div className="relative max-w-[560px] mb-10">
            <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-[18px] text-[15px] font-medium text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        )}

        {/* Grid: 5 Columnas de alta densidad */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {displayProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            displayProducts.map(p => (
              <StoreProductCard key={p.id} product={p} qty={cart[p.id] ?? 0} onChangeQty={changeQty} />
            ))
          )}
        </div>
      </main>

      {!isCartOpen && (
        <FloatingCartBar itemsInCart={itemsInCart} total={total} onOpen={() => setIsCartOpen(true)} />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartProducts={cartProducts}
        cart={cart}
        itemsInCart={itemsInCart}
        total={total}
        cardPaymentsEnabled={store.cardPaymentsEnabled}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
        form={form}
        setForm={setForm}
        loadingAction={loadingAction}
        payError={payError}
        handleSubmit={handleSubmit}
        handlePayWithCard={handlePayWithCard}
      />
    </div>
  )
}

interface StoreHeaderProps {
  storeName: string
  itemsInCart: number
  logoUrl: string | null
  onCartOpen: () => void
}

function StoreHeader({ storeName, itemsInCart, logoUrl, onCartOpen }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-premium px-6 md:px-12 py-5 flex items-center justify-center shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] overflow-hidden bg-primary flex items-center justify-center shrink-0 border border-border/10">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="font-bold text-[17px] tracking-tight text-foreground leading-none">
            {storeName}
          </div>
          <div className="flex items-center gap-[5px] mt-[3px]">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[9px] text-success font-bold tracking-[0.05em]">
              Tienda verificada
            </span>
          </div>
        </div>
      </div>

      {itemsInCart > 0 && (
        <button
          onClick={onCartOpen}
          className="absolute right-6 md:right-12 bg-primary text-primary-foreground border-none rounded-full cursor-pointer px-[18px] py-[9px] font-bold text-[13px] flex items-center gap-2 tracking-tight"
        >
          <ShoppingBag className="w-[15px] h-[15px]" />
          {itemsInCart}
        </button>
      )}
    </header>
  )
}

import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardContent,
  ProductCardCategory,
  ProductCardTitle,
  ProductCardDescription,
  ProductCardRating,
  ProductCardPrice,
  ProductCardPriceAmount,
  ProductCardPriceOriginal,
  ProductCardActions,
} from "@/components/product-card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
  qty: number
  onChangeQty: (id: string, delta: number) => void
}

function StoreProductCard({ product: p, qty, onChangeQty }: ProductCardProps) {
  // Datos calculados para la estÃƒÂ©tica de la imagen
  const originalPrice = Math.floor(p.price * 1.15)
  
  return (
    <ProductCard 
      layout="vertical" 
      size="md" 
      className="group bg-transparent border border-transparent rounded-none transition-all duration-500 flex flex-col h-full hover:bg-white hover:border-zinc-100/80"
    >
      {/* Contenedor de Imagen con cobertura total */}
      <div className="bg-zinc-100/50 aspect-square relative flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-[#FF5000] text-white text-[9px] font-black px-2 py-0.5 rounded-none tracking-tight">
            New
          </span>
        </div>
        
        {p.imageUrl ? (
          <img
            src={p.imageUrl.split(',')[0]}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <ShoppingBag className="w-12 h-12 text-zinc-300" />
        )}
      </div>

      <div className="p-4 flex flex-col space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400">
            ElectrÃƒÂ³nica
          </p>
          
          <h3 className="text-base font-bold text-[#111111] leading-tight line-clamp-2">
            {p.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-black text-[#FF5000] leading-none tabular-nums truncate tracking-tighter">
              ${p.price.toLocaleString('en-US')}
            </span>
            <span className="text-[11px] text-zinc-400 font-bold line-through mt-1 tracking-tight">
              ${originalPrice.toLocaleString('en-US')}
            </span>
          </div>

          <div className="shrink-0 flex items-center">
            {qty > 0 ? (
              <div className="flex items-center gap-1 bg-[#FF5000] text-white p-1 rounded-none h-9">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none hover:bg-white/20 text-white"
                  onClick={(e) => { e.stopPropagation(); onChangeQty(p.id, -1); }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-bold w-3 text-center tabular-nums">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none hover:bg-white/20 text-white"
                  onClick={(e) => { e.stopPropagation(); onChangeQty(p.id, +1); }}
                  disabled={qty >= p.stock}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button 
                size="icon"
                className="bg-[#FF5000] hover:bg-[#E64500] text-white rounded-none transition-all active:scale-95"
                onClick={() => onChangeQty(p.id, +1)}
                disabled={p.stock <= 0}
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProductCard>
  )
}













interface FloatingCartBarProps {
  itemsInCart: number
  total: number
  onOpen: () => void
}

function FloatingCartBar({ itemsInCart, total, onOpen }: FloatingCartBarProps) {
  if (total <= 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-40px)] max-w-[500px] animate-in">
      <button
        onClick={onOpen}
        className="w-full bg-zinc-900 border-none rounded-2xl h-16 flex items-center justify-between px-6 cursor-pointer shadow-2xl transition-transform active:scale-95"
      >
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-1.5">
          <ShoppingBag className="w-[18px] h-[18px] text-white" />
          <span className="text-white font-black text-base">{itemsInCart}</span>
        </div>
        <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
          Finalizar Pedido <ChevronRight className="w-3.5 h-3.5" />
        </span>
        <span className="text-white font-black text-2xl tracking-tighter tabular-nums">
          ${total.toLocaleString('es-CO')}
        </span>
      </button>
    </div>
  )
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cartProducts: Product[]
  cart: Record<string, number>
  itemsInCart: number
  total: number
  cardPaymentsEnabled: boolean
  onRemove: (id: string) => void
  onChangeQty: (id: string, delta: number) => void
  form: { customerName: string; address: string; city: string; lat: number | null; lng: number | null }
  setForm: React.Dispatch<React.SetStateAction<{ customerName: string; address: string; city: string; lat: number | null; lng: number | null }>>
  loadingAction: null | 'whatsapp' | 'card'
  payError: string | null
  handleSubmit: () => void
  handlePayWithCard: () => void
}
function CartModal({
  isOpen, onClose, cartProducts, cart, itemsInCart, total,
  cardPaymentsEnabled, onRemove, onChangeQty, form, setForm, loadingAction, payError,
  handleSubmit, handlePayWithCard
}: CartModalProps) {
  const loading = loadingAction !== null
  const formValid = Boolean(form.customerName.trim() && form.address.trim() && form.city.trim())

  if (!isOpen) return null

  const fields = [
    { key: 'customerName', label: 'Nombre de recibo', placeholder: 'Nombre de quiÃƒÂ©n recibe', Icon: User },
    { key: 'address', label: 'DirecciÃƒÂ³n de entrega', placeholder: 'Calle, carrera, nÃƒÂºmero...', Icon: MapPin },
    { key: 'city', label: 'Ciudad / municipio', placeholder: 'Ciudad o municipio', Icon: Globe },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4">
      {/* Overlay con blur profundo */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-md transition-opacity duration-500" 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[540px] glass-premium rounded-t-[32px] sm:rounded-[32px] flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/40 shadow-2xl animate-in">
        
        {/* Header: MÃƒÂ¡s limpio y aireado */}
        <div className="flex justify-between items-start p-8 pb-6 border-b border-white/20">
          <div>
            <h2 className="text-[32px] font-black tracking-tighter text-zinc-900 m-0 leading-tight">Tu pedido</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase m-0">
                RevisiÃƒÂ³n final de compra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/50 hover:bg-white border border-white/40 cursor-pointer flex items-center justify-center text-zinc-500 transition-all active:scale-95 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-8 scroll-smooth">
          
          {/* Items Section */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black tracking-[0.15em] text-zinc-400">Resumen de ÃƒÂ­tems</span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tight">
                {itemsInCart} {itemsInCart === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {cartProducts.map(p => (
                <div key={p.id} className="bg-white/40 hover:bg-white/60 transition-colors rounded-[20px] border border-white/40 p-4 flex justify-between items-center group">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Product Image Capsule */}
                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-500">
                      {p.imageUrl
                        ? <img src={p.imageUrl.split(',')[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <ShoppingBag className="w-6 h-6 m-5 text-zinc-200" />
                      }
                    </div>
                    
                    <div className="min-w-0">
                      <p className="font-bold text-[15px] text-zinc-900 mb-1.5 truncate max-w-[180px] tracking-tight">{p.name}</p>
                      
                      <div className="flex items-center gap-4">
                        {/* Apple-style Qty Selector */}
                        <div className="flex items-center bg-white/80 rounded-full h-8 border border-zinc-200/50 px-1 shadow-sm">
                          <button
                            onClick={() => onChangeQty(p.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-20 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-[13px] font-bold text-zinc-900 tabular-nums">
                            {cart[p.id]}
                          </span>
                          <button
                            onClick={() => onChangeQty(p.id, +1)}
                            disabled={cart[p.id] >= p.stock}
                            className="w-7 h-7 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-20 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[15px] font-black text-blue-600 tabular-nums">
                          ${(p.price * (cart[p.id] ?? 0)).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRemove(p.id)}
                    className="w-9 h-9 rounded-xl bg-white/50 hover:bg-red-50 hover:text-red-500 text-zinc-300 border border-white/20 transition-all flex items-center justify-center shrink-0 active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Form Section */}
          <section className="border-t border-white/20 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-black tracking-[0.15em] text-zinc-400">Detalles de entrega</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {fields.map(({ key, label, placeholder, Icon }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 ml-1">{label}</label>
                  <div className="relative group">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input
                      className="w-full bg-white/50 border border-white/60 rounded-[18px] pl-11 pr-4 py-3.5 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm"
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                  {key === 'address' && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-white/60 shadow-inner bg-white/30">
                      <MapPicker 
                        onLocationSelectAction={(lat, lng, address, city) => setForm(f => ({ 
                          ...f, 
                          lat, 
                          lng,
                          address: address || f.address,
                          city: city || f.city
                        }))} 
                        initialLat={form.lat || undefined} 
                        initialLng={form.lng || undefined} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer: Bottom Bar con glass fuerte */}
        <div className="border-t border-white/20 p-8 pt-6 bg-white/40 backdrop-blur-xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[11px] font-bold text-zinc-500 tracking-widest mb-1">Total del pedido</p>
              <h3 className="text-[44px] font-black text-zinc-900 tracking-tighter leading-none m-0 tabular-nums">
                ${total.toLocaleString('es-CO')}
              </h3>
            </div>
            {itemsInCart > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-white bg-blue-600 px-4 py-1.5 rounded-full tracking-widest shadow-lg shadow-blue-500/20">
                  Confirmado
                </span>
              </div>
            )}
          </div>

          {payError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold text-center px-4 py-3 rounded-2xl mb-4 animate-in">
              {payError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {cardPaymentsEnabled && (
              <button
                onClick={handlePayWithCard}
                disabled={loading || !formValid}
                className="group relative w-full h-14 bg-zinc-900 text-white rounded-[20px] font-black text-[15px] tracking-tight flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-zinc-800 active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loadingAction === 'card' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Segurizando sesiÃƒÂ³n...</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>Pagar con Tarjeta</span>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-all" />
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={loading || !formValid}
              className="w-full h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-[20px] font-black text-[15px] tracking-tight flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-green-500/10"
            >
              {loadingAction === 'whatsapp' ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar vÃƒÂ­a WhatsApp</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 opacity-30">
            <Zap className="w-3 h-3 text-zinc-900" />
            <p className="text-[10px] text-zinc-900 font-extrabold tracking-[0.2em] m-0">
              Protocolo Seguro v2.0 Ã¢â‚¬Â¢ Flashcheckouts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}