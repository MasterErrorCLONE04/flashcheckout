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

export default function CheckoutForm({ store }: { store: Store }) {
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
        body: JSON.stringify({ storeId: store.id, ...form, items, latitude: form.lat, longitude: form.lng }),
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
        body: JSON.stringify({ storeId: store.id, customerName: form.customerName.trim(), address: form.address.trim(), city: form.city.trim(), items }),
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
            Catálogo
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-[0.15em] uppercase mt-2.5 mb-0">
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
    <header className="sticky top-0 z-40 border-b border-border bg-card px-6 md:px-12 py-4 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] overflow-hidden bg-primary flex items-center justify-center shrink-0 border border-border/10">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl italic skew-x-[-10deg]">
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
            <span className="text-[9px] text-success font-bold tracking-[0.12em] uppercase">
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
  // Datos calculados para la estética de la imagen
  const originalPrice = Math.floor(p.price * 1.15)
  
  return (
    <ProductCard 
      layout="vertical" 
      size="md" 
      className="group bg-transparent border border-transparent rounded-none transition-all duration-500 flex flex-col h-full hover:bg-white hover:border-zinc-100/80 hover:shadow-2xl hover:shadow-black/5"
    >
      {/* Contenedor de Imagen con cobertura total */}
      <div className="bg-zinc-100/50 aspect-square relative flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-[#FF5000] text-white text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider">
            New
          </span>
        </div>
        
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
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
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
            Electronics
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
              <div className="flex items-center gap-1 bg-[#FF5000] text-white p-1 rounded-none shadow-sm h-9">
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
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-48px)] max-w-[560px]">
      <button
        onClick={onOpen}
        className="w-full bg-primary border-none rounded-full h-14 flex items-center justify-between px-5 cursor-pointer shadow-2xl"
      >
        <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-3.5 py-1.5">
          <ShoppingBag className="w-[15px] h-[15px] text-primary-foreground" />
          <span className="text-primary-foreground font-bold text-sm">{itemsInCart}</span>
        </div>
        <span className="text-primary-foreground/80 text-[11px] font-bold tracking-[0.12em] uppercase flex items-center gap-1">
          Ver pedido <ChevronRight className="w-3.5 h-3.5" />
        </span>
        <span className="text-primary-foreground font-black text-xl tracking-tight tabular-nums">
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
  const formValid = form.customerName.trim() && form.address.trim() && form.city.trim()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const fields = [
    { key: 'customerName', label: 'Nombre de recibo', placeholder: 'Nombre de quién recibe', Icon: User },
    { key: 'address', label: 'Dirección de entrega', placeholder: 'Calle, carrera, número...', Icon: MapPin },
    { key: 'city', label: 'Ciudad / municipio', placeholder: 'Ciudad o municipio', Icon: Globe },
  ] as const

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      <div onClick={onClose} className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-[540px] bg-card rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-7 pb-5 border-b border-border">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight text-card-foreground m-0">Tu pedido</h2>
            <p className="text-[9px] text-muted-foreground font-bold tracking-[0.15em] uppercase mt-1.5 mb-0">
              Revisión final de compra
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-border bg-secondary cursor-pointer flex items-center justify-center text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto p-7 pt-6">
          {/* Items */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Resumen de ítems</span>
              <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-[3px] rounded-full uppercase tracking-wide">
                {itemsInCart} unidades
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {cartProducts.map(p => (
                <div key={p.id} className="bg-secondary/60 rounded-[14px] border border-border p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-[52px] h-[52px] rounded-[10px] bg-card border border-border overflow-hidden shrink-0">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <ShoppingBag className="w-5 h-5 m-4 text-muted-foreground/40" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-card-foreground mb-1 truncate max-w-[200px] m-0">{p.name}</p>
                      
                      <div className="flex items-center gap-3 mt-1">
                        {/* Compact Qty Selector */}
                        <div className="flex items-center border border-[#e5e5e5] rounded-lg h-7 bg-white shrink-0">
                          <button
                            onClick={() => onChangeQty(p.id, -1)}
                            className="w-7 h-full flex items-center justify-center text-[#aeaeb2] disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-[12px] font-medium text-[#1d1d1f] tabular-nums">
                            {cart[p.id]}
                          </span>
                          <button
                            onClick={() => onChangeQty(p.id, +1)}
                            disabled={cart[p.id] >= p.stock}
                            className="w-7 h-full flex items-center justify-center text-blue-500 disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[13px] font-black text-blue-500 m-0">
                          ${(p.price * (cart[p.id] ?? 0)).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="w-8 h-8 rounded-lg border border-border bg-card cursor-pointer flex items-center justify-center text-muted-foreground shrink-0 ml-2"
                  >
                    <Trash2 className="w-[13px] h-[13px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5 mb-4">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Información de envío</span>
            </div>
            <div className="flex flex-col gap-3">
              {fields.map(({ key, label, placeholder, Icon }) => (
                <div key={key}>
                  <label className="block text-[9px] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                    <input
                      className="w-full bg-secondary border border-border rounded-xl pl-10 pr-3.5 py-3 text-sm font-medium text-card-foreground outline-none focus:ring-2 focus:ring-accent/30"
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                  {key === 'address' && (
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-7 pt-5 pb-7 bg-card">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-1 m-0">Valor total a pagar</p>
              <h3 className="text-4xl font-black text-card-foreground tracking-tight m-0 tabular-nums">
                ${total.toLocaleString('es-CO')}
              </h3>
            </div>
            {itemsInCart > 0 && (
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-3.5 py-1.5 rounded-full uppercase tracking-wide">
                Confirmado
              </span>
            )}
          </div>

          {payError && (
            <div className="bg-destructive/5 border border-destructive/20 text-destructive text-[11px] font-bold text-center px-4 py-2.5 rounded-[10px] mb-3 flex items-center justify-center gap-1.5">
              <X className="w-3 h-3" /> {payError}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {cardPaymentsEnabled && (
              <button
                onClick={handlePayWithCard}
                disabled={loading || !formValid}
                className="w-full h-[52px] bg-primary text-primary-foreground border-none rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard className="w-[17px] h-[17px]" />
                {loadingAction === 'card' ? 'Procesando...' : 'Pagar con Tarjeta'}
                <ArrowRight className="w-[15px] h-[15px]" />
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !formValid}
              className="w-full h-[52px] bg-[#25D366] text-white border-none rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#25D366]/25"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[17px] h-[17px]"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.604 6.04L0 24l6.105-1.602a11.832 11.832 0 005.942 1.6h.005c6.634 0 12.032-5.396 12.035-12.03a11.782 11.782 0 00-3.417-8.467z" />
              </svg>
              {loadingAction === 'whatsapp' ? 'Iniciando...' : 'Confirmar por WhatsApp'}
              <ArrowRight className="w-[15px] h-[15px]" />
            </button>
          </div>

          <p className="text-[9px] text-muted-foreground/50 font-bold tracking-[0.1em] text-center uppercase mt-3.5 mb-0">
            Protocolo de seguridad activo • FlashCheckout 2026
          </p>
        </div>
      </div>
    </div>
  )
}