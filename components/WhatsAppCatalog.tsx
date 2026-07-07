'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  ShoppingCart,
  LayoutGrid,
  List,
  Search,
  Plus,
  Minus,
  X,
  MapPin,
  User,
  Globe,
  Trash2,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  CreditCard,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Award,
  Clock,
  Phone,
  Star,
  Check,
  Sprout,
  Tag,
  Sparkles,
  Smartphone,
  Home,
  Shirt,
  Dumbbell,
  Sliders,
  Menu,
  Gift
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
  description?: string
  options?: any
}

type Store = {
  id: string
  name: string
  whatsapp: string
  products: Product[]
  logoUrl: string | null
  cardPaymentsEnabled: boolean
  bio?: string | null
  aiSettings?: any
}

function getCartKey(productId: string, selectedOpts: Record<string, string>) {
  const sortedKeys = Object.keys(selectedOpts).sort()
  if (sortedKeys.length === 0) return productId
  const parts = sortedKeys.map(k => `${k}-${selectedOpts[k]}`)
  return `${productId}:${parts.join('|')}`
}

function parseCartKey(cartKey: string) {
  if (!cartKey.includes(':')) {
    return { productId: cartKey, variations: {} as Record<string, string> }
  }
  const [productId, variationsStr] = cartKey.split(':')
  const variations: Record<string, string> = {}
  variationsStr.split('|').forEach(p => {
    if (p.includes('-')) {
      const [k, v] = p.split('-')
      variations[k] = v
    }
  })
  return { productId, variations }
}

export default function WhatsAppCatalog({ 
  store, 
  initialPhone,
  initialCart = {},
  initialName = '',
  initialAddress = '',
  device
}: { 
  store: Store, 
  initialPhone?: string,
  initialCart?: Record<string, number>,
  initialName?: string,
  initialAddress?: string,
  device?: 'escritorio' | 'tablet' | 'movil'
}) {
  const [cart, setCart] = useState<Record<string, number>>(initialCart)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  
  // Mobile Tab state: 'inicio', 'categorias', 'buscar', 'carrito'
  const [activeMobileTab, setActiveMobileTab] = useState('inicio')
  const [activeNavTab, setActiveNavTab] = useState('Inicio')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default')
  const [onlyInStock, setOnlyInStock] = useState(false)

  // Responsive device view check
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const showMobile = device ? (device === 'movil' || device === 'tablet') : isMobile;

  
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Configuración de apariencia dinámica proveniente del administrador
  const aiSettings = store.aiSettings && typeof store.aiSettings === 'object' ? store.aiSettings : {}
  const colors = {
    primario: aiSettings.colors?.primario || '#059669', // Emerald 600 default
    secundario: aiSettings.colors?.secundario || '#D97706', // Amber 600 default
    acento: aiSettings.colors?.acento || '#10B981', // Emerald 500 default
    fondo: aiSettings.colors?.fondo || '#F8FAFC',
    texto: aiSettings.colors?.texto || '#1F2937'
  }
  const typography = aiSettings.typography || 'Inter'
  const bannerUrl = aiSettings.bannerUrl || ''
  const bannerTitle = aiSettings.bannerTitle || 'El mejor café, directo a tu puerta'
  const bannerSubtitle = aiSettings.bannerSubtitle || 'Descubre nuestros productos de especialidad cultivados con amor y tostados frescos.'
  
  // Announcement Bar config
  const announcement = aiSettings.announcement || {
    enabled: false,
    text: '',
    bgColor: '#059669',
    textColor: '#FFFFFF'
  }

  // Banner Button config
  const bannerButton = aiSettings.bannerButton || {
    text: 'Ver productos',
    action: 'scroll',
    link: ''
  }

  // Benefits config
  const benefits = aiSettings.benefits || {
    items: [
      { icon: 'Truck', label: 'Envíos rápidos', desc: 'A todo el país' },
      { icon: 'ShieldCheck', label: 'Pagos seguros', desc: 'Múltiples métodos' },
      { icon: 'Award', label: 'Café de calidad', desc: 'Granos seleccionados' },
      { icon: 'Clock', label: 'Atención 24/7', desc: 'Siempre disponibles' }
    ]
  }

  // Social config
  const socialsShowInCatalog = aiSettings.socialsShowInCatalog !== false

  // Schedule config
  const schedule = aiSettings.schedule || {
    enabled: false,
    text: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: true
  }

  const IconMap: Record<string, any> = {
    Truck,
    ShieldCheck,
    Award,
    Clock,
    Gift,
    Star
  }

  const handleBannerButtonClick = () => {
    const action = bannerButton.action || 'scroll'
    if (action === 'scroll') {
      const el = document.getElementById('catalog-products')
      el?.scrollIntoView({ behavior: 'smooth' })
    } else if (action === 'whatsapp') {
      window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=Hola! Vengo desde tu banner principal.`, '_blank')
    } else if (action === 'link' && bannerButton.link) {
      window.open(bannerButton.link, '_blank')
    }
  }

  const sections = aiSettings.sections || {
    banner: true,
    destacados: true,
    categorias: true,
    beneficios: true
  }

  const formattedStoreName = store.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  useEffect(() => {
    setActiveImageIdx(0)
    if (selectedProduct) {
      const parsedOpts = selectedProduct.options
        ? (typeof selectedProduct.options === 'string' ? JSON.parse(selectedProduct.options) : selectedProduct.options)
        : []
      const defaults: Record<string, string> = {}
      if (Array.isArray(parsedOpts)) {
        parsedOpts.forEach((opt: any) => {
          if (opt.name && Array.isArray(opt.values) && opt.values.length > 0) {
            defaults[opt.name] = opt.values[0]
          }
        })
      }
      setSelectedOptions(defaults)
    } else {
      setSelectedOptions({})
    }
  }, [selectedProduct])

  // Synchronize cart modal status with active navigation tab in mobile
  useEffect(() => {
    if (isCartOpen) {
      setActiveMobileTab('carrito')
    } else if (activeMobileTab === 'carrito') {
      setActiveMobileTab('inicio')
    }
  }, [isCartOpen])

  
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

  // Sincronizar carrito con la base de datos automáticamente
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

  // Manejar el botón de regresar del navegador
  useEffect(() => {
    window.history.pushState({ page: 'catalog' }, '')

    const handlePopState = (e: PopStateEvent) => {
      if (isCartOpen) {
        setIsCartOpen(false)
        window.history.pushState({ page: 'catalog' }, '')
      } else {
        const link = document.createElement('a')
        link.href = 'whatsapp://'
        link.click()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isCartOpen])

  const itemsInCart = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = Object.entries(cart).reduce((sum, [key, qty]) => {
    const { productId } = parseCartKey(key)
    const product = store.products.find(p => p.id === productId)
    return sum + (product ? product.price * qty : 0)
  }, 0)
  const cartProducts = Object.entries(cart).map(([key, qty]) => {
    const { productId, variations } = parseCartKey(key)
    const product = store.products.find(p => p.id === productId)
    if (!product) return null
    return {
      ...product,
      cartKey: key,
      qty,
      variations,
    }
  }).filter(Boolean) as (Product & { cartKey: string, qty: number, variations: Record<string, string> })[]

  // Categorías
  const categories = ['Todos', ...Array.from(new Set(store.products.map(p => p.category || 'Varios')))]

  // Conteo dinámico de productos por categoría
  const categoryCounts = store.products.reduce((acc, p) => {
    const cat = p.category || 'Varios'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Filtro de productos
  const filteredProducts = store.products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'Todos' || (p.category || 'Varios') === selectedCategory
      const matchesStock = !onlyInStock || p.stock > 0
      return matchesSearch && matchesCategory && matchesStock
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      return 0
    })


  function changeQtyByKey(cartKey: string, delta: number) {
    const { productId } = parseCartKey(cartKey)
    const product = store.products.find(p => p.id === productId)!
    setHasChanged(true)
    setCart(prev => {
      const currentQty = prev[cartKey] ?? 0
      const newQty = Math.max(0, Math.min(currentQty + delta, product.stock))
      const next = { ...prev, [cartKey]: newQty }
      if (newQty === 0) delete next[cartKey]
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
    const items = cartProducts.map(p => {
      const variationDetails = Object.keys(p.variations).length > 0
        ? ` (${Object.entries(p.variations).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : ''
      return {
        productId: p.id,
        name: `${p.name}${variationDetails}`,
        qty: p.qty,
        price: p.price
      }
    })
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
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank')
        }
      } else {
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

  async function handleCardPayment() {
    if (!validateForm()) return
    setLoadingAction('card')
    const items = cartProducts.map(p => {
      const variationDetails = Object.keys(p.variations).length > 0
        ? ` (${Object.entries(p.variations).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : ''
      return {
        productId: p.id,
        qty: p.qty,
        nameSuffix: variationDetails
      }
    })
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

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'todos': return Sprout
      case 'moda': return Shirt
      case 'tecnología':
      case 'tecnologia': return Smartphone
      case 'hogar': return Home
      case 'belleza': return Sparkles
      case 'comida': return Tag
      case 'deportes':
      case 'deporte': return Dumbbell
      default: return Tag
    }
  }

  const handleMobileTabClick = (tab: string) => {
    setActiveMobileTab(tab)
    if (tab === 'carrito') {
      setIsCartOpen(true)
    } else if (tab === 'buscar') {
      searchInputRef.current?.focus()
    } else if (tab === 'categorias') {
      document.getElementById('mobile-categories-row')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-50 rounded-lg flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#25D366] rounded-lg flex items-center justify-center animate-bounce">
            <MessageCircle className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">¡Pedido Recibido!</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed text-lg">
          Hemos enviado un mensaje de confirmación a tu WhatsApp. <br/>
          <span className="font-bold text-zinc-800">Cierra esta ventana y vuelve al chat</span> para continuar.
        </p>
        <a 
          href="whatsapp://"
          className="w-full h-15 bg-zinc-900 text-white rounded-lg font-bold text-lg shadow-xl shadow-zinc-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          Regresar a WhatsApp
        </a>
      </div>
    )
  }

  // Cargar mock SKU y variables para detalle de producto
  const productSku = selectedProduct ? `MOD-${selectedProduct.id.slice(-3).toUpperCase()}` : ''
  const productImages = selectedProduct ? (selectedProduct.imageUrl ? selectedProduct.imageUrl.split(',').filter(Boolean) : []) : []
  const currentDetailImg = selectedProduct && productImages.length > 0 ? productImages[activeImageIdx] : null
  const selectedCartKey = selectedProduct ? getCartKey(selectedProduct.id, selectedOptions) : ''
  const qtyInCart = selectedCartKey ? (cart[selectedCartKey] ?? 0) : 0

  return (
    <div 
      className={cn(
        "flex flex-col min-h-screen text-zinc-900 selection:bg-zinc-100",
        typography === 'Georgia' ? 'font-serif' : typography === 'Courier New' ? 'font-mono' : 'font-sans'
      )}
      style={{ 
        backgroundColor: colors.fondo,
        color: colors.texto,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* Overrides para emular la paleta elegida del comercio */
        .bg-emerald-600, .bg-emerald-700 {
          background-color: ${colors.primario} !important;
        }
        .bg-emerald-600:hover, .bg-emerald-700:hover {
          opacity: 0.9 !important;
          background-color: ${colors.primario} !important;
        }
        .bg-emerald-50, .bg-emerald-100 {
          background-color: ${colors.acento}15 !important;
        }
        .text-emerald-600, .text-emerald-700, .text-emerald-800 {
          color: ${colors.primario} !important;
        }
        .border-emerald-100, .border-emerald-200, .border-emerald-500, .border-emerald-600 {
          border-color: ${colors.primario} !important;
        }
        .border-emerald-600:hover {
          border-color: ${colors.primario} !important;
        }
        .focus\\:border-emerald-500:focus {
          border-color: ${colors.primario} !important;
        }
        .focus\\:ring-emerald-500\\/10:focus {
          box-shadow: 0 0 0 4px ${colors.primario}20 !important;
        }
      `}} />
      
      {/* ========================================================================= */}
      {/* 🖥️ VISTA DESKTOP (PANTALLAS GRANDES - lg:flex) */}
      {/* ========================================================================= */}
      <div className={cn("flex flex-col min-h-screen w-full", showMobile ? "hidden" : "flex")}>
        
        {/* Barra de anuncios (Desktop) */}
        {announcement?.enabled && announcement?.text && (
          <div 
            className="w-full text-center py-2 px-4 text-xs font-bold leading-tight select-none shrink-0"
            style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
          >
            {announcement.text}
          </div>
        )}

        {/* Cabecera Premium Rediseñada */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-150 h-[76px] shadow-none select-none shrink-0 w-full">
          <div className="max-w-[1300px] mx-auto w-full h-full px-6 flex items-center justify-between gap-6">
            
            {/* Logo o Nombre de la Tienda */}
            <div className="flex items-center gap-3">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={formattedStoreName} className="h-8 max-w-[150px] object-contain shrink-0" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-[10px] text-emerald-600">
                    ☕
                  </div>
                  <span className="font-black text-sm text-zinc-955 uppercase tracking-tight">{formattedStoreName}</span>
                </div>
              )}

              {/* Schedule Badge (Desktop) */}
              {schedule?.enabled && (
                <div className="relative group shrink-0 select-none">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2F0] text-emerald-700 cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{schedule.alwaysOpen ? 'Abierto 24/7' : 'Abierto'}</span>
                  </span>
                  
                  {!schedule.alwaysOpen && (
                    <div className="absolute left-0 mt-1.5 hidden group-hover:block bg-zinc-900 text-white text-[9px] font-bold rounded px-2.5 py-1.5 whitespace-nowrap shadow-lg z-50 animate-in fade-in duration-200">
                      Horario: {schedule.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enlaces de Navegación del Rediseño */}
            <nav className="hidden xl:flex items-center gap-6 text-xs font-bold text-zinc-500">
              {['Inicio', 'Tienda', 'Sobre nosotros', 'Contacto'].map((tab) => {
                const isActive = activeNavTab === tab;
                return (
                  <span
                    key={tab}
                    onClick={() => setActiveNavTab(tab)}
                    className={cn(
                      "cursor-pointer hover:text-zinc-900 transition-all pb-1 relative",
                      isActive ? "text-zinc-950 border-b-2 border-emerald-600 font-extrabold" : "text-zinc-500"
                    )}
                  >
                    {tab}
                  </span>
                )
              })}
            </nav>

            {/* Buscador y Carrito */}
            <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
              
              {/* Redes Sociales en cabecera (Desktop) */}
              {socialsShowInCatalog && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {store.aiSettings?.socials?.instagram && (
                    <a 
                      href={store.aiSettings.socials.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                      title="Instagram"
                    >
                      <span className="text-[10px] font-black tracking-tight">IG</span>
                    </a>
                  )}
                  {store.aiSettings?.socials?.facebook && (
                    <a 
                      href={store.aiSettings.socials.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                      title="Facebook"
                    >
                      <span className="text-[10px] font-black tracking-tight">FB</span>
                    </a>
                  )}
                  {store.aiSettings?.socials?.twitter && (
                    <a 
                      href={store.aiSettings.socials.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                      title="Twitter / X"
                    >
                      <span className="text-[10px] font-black tracking-tight">X</span>
                    </a>
                  )}
                </div>
              )}

              {/* Buscador Compacto */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-10 pr-4 text-xs font-semibold text-zinc-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              {/* Botón Carrito */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2.5 h-9.5 px-3 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-all active:scale-95 shrink-0 relative border-0 cursor-pointer"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-zinc-700" />
                  <span className="absolute -top-2.5 -right-2.5 bg-[#10B981] text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                    {itemsInCart}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-bold text-zinc-800">Carrito</span>
                  <span className="text-[9px] text-zinc-500 font-bold mt-0.5" suppressHydrationWarning={true}>
                    ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </span>
                </div>
              </button>

            </div>

          </div>
        </header>

        {/* Banner principal (Desktop) */}
        {sections.banner && bannerUrl && (
          <div className="max-w-[1300px] mx-auto w-full px-6 pt-6 pb-2 shrink-0">
            <div className="relative h-[340px] w-full bg-zinc-900 rounded-3xl overflow-hidden flex items-center px-12 text-left select-none shadow-sm">
              <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-100 z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent z-0 pointer-events-none" />
              
              <div className="relative z-10 space-y-4 max-w-lg">
                <h2 className="text-2xl xl:text-3xl font-black text-white leading-tight">{bannerTitle}</h2>
                <p className="text-xs xl:text-sm font-semibold text-zinc-100 leading-normal">{bannerSubtitle}</p>
                <button 
                  onClick={handleBannerButtonClick}
                  className="px-6 py-3 rounded-xl text-white font-extrabold text-xs xl:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all select-none border-0 cursor-pointer"
                  style={{ backgroundColor: colors.secundario }}
                >
                  <span>{bannerButton.text}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Beneficios (Desktop) */}
        {sections.beneficios && benefits?.items?.length > 0 && (
          <div className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
            <div className="bg-white border border-zinc-150 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-4">
              {benefits.items.map((item: any, idx: number) => {
                const ItemIcon = IconMap[item.icon] || Award
                return (
                  <div key={idx} className="flex items-center gap-3.5 p-1.5 text-left select-none">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${colors.secundario}12`, color: colors.secundario }}
                    >
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-zinc-900 block leading-none">{item.label}</span>
                      <span className="text-[10px] font-semibold text-zinc-400 mt-1.5 block leading-none">{item.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <main className="max-w-[1300px] mx-auto w-full px-6 py-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Grid/Feed Central (Ancho completo al eliminar el sidebar) */}
            <div id="catalog-products" className={cn(
              "space-y-6 transition-all duration-300",
              selectedProduct ? "lg:col-span-8" : "lg:col-span-12"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                    {selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
                  </p>
                </div>

                {/* Switchers Grid/List */}
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border-0",
                      viewMode === 'grid' ? "bg-white text-zinc-905 shadow-sm" : "text-zinc-500 hover:text-zinc-900 bg-transparent"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cuadrícula</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border-0",
                      viewMode === 'list' ? "bg-white text-zinc-905 shadow-sm" : "text-zinc-500 hover:text-zinc-900 bg-transparent"
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>

              {/* Productos */}
              <div className={cn(
                "gap-4 pb-20",
                viewMode === 'grid' 
                  ? (selectedProduct ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5") 
                  : "grid grid-cols-1"
              )}>
                {filteredProducts.map(product => {
                  const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
                    const { productId } = parseCartKey(k)
                    return sum + (productId === product.id ? q : 0)
                  }, 0)
                  const isItemInCart = productCartQty > 0
                  return (
                    <div 
                      key={product.id}
                      className={cn(
                        "group relative bg-white border border-zinc-150 rounded-2xl overflow-hidden p-3.5 transition-all duration-300 hover:border-zinc-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 flex flex-col justify-between h-full select-none",
                        viewMode === 'list' && "flex-row gap-4 items-center"
                      )}
                    >
                      <div className={cn("flex flex-col h-full justify-between w-full", viewMode === 'list' && "flex-row gap-4 items-center flex-1")}>
                        
                        {/* Image Container with Category Badge */}
                        <div 
                          className={cn("relative rounded-xl overflow-hidden bg-zinc-50 shrink-0 cursor-pointer border border-zinc-100", viewMode === 'grid' ? "aspect-square w-full mb-3" : "w-20 h-20")}
                          onClick={() => setSelectedProduct(product)}
                        >
                          {/* Categoría Badge Overlay */}
                          <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 bg-[#EEF2F0] rounded-md text-[9px] font-bold text-emerald-700 uppercase tracking-wide select-none">
                            {product.category || 'General'}
                          </span>

                          {product.imageUrl ? (
                            <img src={product.imageUrl.split(',')[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingBag className="w-8 h-8" /></div>
                          )}
                        </div>

                        {/* Title and price row (no bottom stock dot or divider line) */}
                        <div className="flex-1 flex flex-col justify-between mt-1 select-none text-left">
                          <h4 className="font-bold text-xs text-zinc-900 leading-snug line-clamp-2 cursor-pointer hover:text-zinc-950 transition-colors" onClick={() => setSelectedProduct(product)}>
                            {product.name}
                          </h4>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-extrabold text-xs text-zinc-900 leading-none select-none" suppressHydrationWarning={true}>
                              ${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </span>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const parsedOpts = product.options
                                  ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options)
                                  : []
                                if (Array.isArray(parsedOpts) && parsedOpts.length > 0) {
                                  setSelectedProduct(product)
                                } else {
                                  changeQtyByKey(product.id, 1)
                                }
                              }}
                              disabled={product.stock <= 0}
                              className={cn(
                                "w-8 h-8 rounded-full border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95",
                                isItemInCart && "border-emerald-500 bg-emerald-50/20"
                              )}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 font-extrabold" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Panel de Detalles (Columna Derecha) */}
            {selectedProduct && (
              <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 tracking-wider">{selectedProduct.category || 'General'} • SKU: {productSku}</p>
                    <h3 className="text-base font-bold text-zinc-900 leading-tight">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">4.8 (32 reseñas)</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/50 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
                </div>

                <div className="relative aspect-square w-full rounded-xl bg-zinc-50 border border-zinc-200 overflow-hidden flex items-center justify-center">
                  {currentDetailImg ? <img src={currentDetailImg} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-12 h-12 text-zinc-300" />}
                  {productImages.length > 1 && (
                    <>
                      <button onClick={() => setActiveImageIdx(p => p === 0 ? productImages.length - 1 : p - 1)} className="absolute left-2.5 w-7 h-7 rounded-full bg-white/90 text-zinc-700 flex items-center justify-center border border-zinc-200/50 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setActiveImageIdx(p => p === productImages.length - 1 ? 0 : p + 1)} className="absolute right-2.5 w-7 h-7 rounded-full bg-white/90 text-zinc-700 flex items-center justify-center border border-zinc-200/50 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                    </>
                  )}
                </div>

                {productImages.length > 1 && (
                  <div className="flex gap-2 justify-center overflow-x-auto py-1">
                    {productImages.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveImageIdx(idx)} className={cn("w-11 h-11 rounded-lg overflow-hidden border bg-white shrink-0 cursor-pointer transition-all", activeImageIdx === idx ? "border-emerald-600 scale-102" : "border-zinc-200 opacity-60")}><img src={img} alt="" className="w-full h-full object-cover" /></button>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  <span className="text-2xl font-black text-zinc-950 block">${selectedProduct.price.toLocaleString('es-CO')}</span>
                  
                  {/* Dynamic Product Options Selectors */}
                  {(() => {
                    const parsedOpts = selectedProduct.options
                      ? (typeof selectedProduct.options === 'string' ? JSON.parse(selectedProduct.options) : selectedProduct.options)
                      : []
                    if (!Array.isArray(parsedOpts) || parsedOpts.length === 0) return null
                    return (
                      <div className="space-y-4 pt-1">
                        {parsedOpts.map((opt: any) => {
                          if (!opt.name || !Array.isArray(opt.values) || opt.values.length === 0) return null
                          const currentVal = selectedOptions[opt.name] || opt.values[0]
                          return (
                            <div key={opt.name} className="space-y-1.5 text-left">
                              <span className="text-[11px] font-bold text-zinc-500">{opt.name}: {currentVal}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {opt.values.map((val: string) => (
                                  <button
                                    key={val}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                                    className={cn(
                                      "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-9",
                                      currentVal === val
                                        ? "bg-emerald-600 border-emerald-600 text-white font-extrabold"
                                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                    )}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}

                  <div className="text-[11px] font-bold text-emerald-600">Stock disponible: {selectedProduct.stock} unidades</div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-700"><Truck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[10px] font-bold">Envío</span></div>
                    <p className="text-[9px] font-bold text-zinc-500 leading-normal">24 a 48 horas<br/>Bogotá y alrededores</p>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-700"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[10px] font-bold">Devoluciones</span></div>
                    <p className="text-[9px] font-bold text-zinc-500 leading-normal">30 días<br/>Garantía de satisfacción</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Descripción</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-semibold whitespace-pre-wrap">{selectedProduct.description || 'Sin descripción disponible.'}</p>
                </div>

                <div className="pt-2">
                  {qtyInCart > 0 ? (
                    <div className="flex items-center justify-between gap-4 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <button onClick={() => changeQtyByKey(selectedCartKey, -1)} className="w-8 h-8 rounded-lg bg-white border border-zinc-250 flex items-center justify-center cursor-pointer active:scale-95"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="font-extrabold text-sm w-4 text-center tabular-nums">{qtyInCart}</span>
                        <button onClick={() => changeQtyByKey(selectedCartKey, 1)} disabled={qtyInCart >= selectedProduct.stock} className="w-8 h-8 rounded-lg bg-white border border-zinc-250 flex items-center justify-center cursor-pointer active:scale-95"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="text-xs font-black text-zinc-950 pr-2">${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}</span>
                    </div>
                  ) : (
                    <button onClick={() => changeQtyByKey(selectedCartKey, 1)} disabled={selectedProduct.stock <= 0} className="w-full flex items-center justify-center gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-none cursor-pointer transition-all active:scale-[0.98]"><ShoppingCart className="w-4 h-4" /><span>Agregar al carrito</span></button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 📱 VISTA MÓVIL (PANTALLAS CELULAR/TABLET - lg:hidden) */}
      {/* ========================================================================= */}
      <div className={cn("flex flex-col min-h-screen pb-20 w-full", showMobile ? "flex" : "hidden")}>
        
        {/* Barra de anuncios (Mobile) */}
        {announcement?.enabled && announcement?.text && (
          <div 
            className="w-full text-center py-1.5 px-3 text-[10px] font-bold leading-tight select-none shrink-0"
            style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
          >
            {announcement.text}
          </div>
        )}

        {/* Cabecera Móvil */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-150 h-16 flex items-center justify-between px-4 shadow-none">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-zinc-650 hover:text-zinc-900 cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {store.logoUrl ? (
                <div className="flex items-center gap-1.5">
                  <img src={store.logoUrl} alt={formattedStoreName} className="h-6 max-w-[100px] object-contain shrink-0" />
                  
                  {/* Schedule Badge (Mobile with Logo) */}
                  {schedule?.enabled && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-[#EEF2F0] text-emerald-700 select-none scale-90 origin-left shrink-0">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{schedule.alwaysOpen ? '24/7' : 'Abierto'}</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-[9px] text-emerald-600">
                    ☕
                  </div>
                  <span className="font-black text-xs text-zinc-950 uppercase tracking-tight">{formattedStoreName}</span>

                  {/* Schedule Badge (Mobile without Logo) */}
                  {schedule?.enabled && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-[#EEF2F0] text-emerald-700 select-none scale-90 origin-left shrink-0">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{schedule.alwaysOpen ? '24/7' : 'Abierto'}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => handleMobileTabClick('carrito')}
            className="w-10 h-10 flex items-center justify-center relative bg-transparent border-0 cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-zinc-700" />
            {itemsInCart > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                {itemsInCart}
              </span>
            )}
          </button>
        </header>

        {/* Cuerpo del Catálogo Móvil */}
        <main className="flex-1 px-4 py-4 space-y-6">
          
          {/* Banner principal (Mobile) */}
          {sections.banner && bannerUrl && (
            <div className="relative h-[190px] w-full bg-zinc-900 overflow-hidden flex items-center px-6 rounded-2xl text-left select-none shrink-0 shadow-sm">
              <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-100 z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent z-0 pointer-events-none" />
              
              <div className="relative z-10 space-y-2 max-w-[220px]">
                <h2 className="text-xs xl:text-sm font-black text-white leading-tight">{bannerTitle}</h2>
                <p className="text-[9px] xl:text-[10px] font-semibold text-zinc-200 leading-normal">{bannerSubtitle}</p>
                <button 
                  onClick={handleBannerButtonClick}
                  className="inline-flex items-center gap-0.5 px-3 py-1.5 rounded-md text-white font-extrabold text-[9px] xl:text-[10px] border-0 cursor-pointer active:scale-95 transition-all" 
                  style={{ backgroundColor: colors.secundario }}
                >
                  <span>{bannerButton.text}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Barra de Beneficios (Mobile) */}
          {sections.beneficios && benefits?.items?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-3 border border-zinc-150 shrink-0">
              {benefits.items.map((item: any, idx: number) => {
                const ItemIcon = IconMap[item.icon] || Award
                return (
                  <div key={idx} className="flex items-center gap-1.5 p-1 text-left min-w-0">
                    <div 
                      className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${colors.secundario}12`, color: colors.secundario, borderColor: `${colors.secundario}22` }}
                    >
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 leading-none">
                      <span className="text-[9px] font-bold text-zinc-900 block truncate">{item.label}</span>
                      <span className="text-[8px] font-semibold text-zinc-400 mt-0.5 block truncate">{item.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Barra de Búsqueda Móvil con botón Sliders */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-zinc-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <button onClick={() => setIsFilterOpen(true)} className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer">
              <Sliders className="w-4 h-4" />
            </button>
          </div>




          {/* Toggles Cuadrícula / Lista en Móvil */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 w-full max-w-[280px]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  viewMode === 'grid' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500"
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>



          {/* Sección Más Productos (Cuadrícula vertical) */}
          <div className="space-y-3.5 pb-12">
            <h3 className="text-sm font-black text-zinc-900 tracking-tight text-left">Más productos</h3>
            
            <div className={cn(
              "gap-4",
              viewMode === 'grid' ? "grid grid-cols-2" : "grid grid-cols-1"
            )}>
              {filteredProducts.map(product => {
                const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
                  const { productId } = parseCartKey(k)
                  return sum + (productId === product.id ? q : 0)
                }, 0)
                const isItemInCart = productCartQty > 0
                return (
                  <div 
                    key={product.id}
                    className={cn(
                      "group bg-white border border-zinc-150 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between h-full select-none shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300",
                      viewMode === 'list' && "flex-row gap-4 items-center"
                    )}
                  >
                    <div className={cn("flex flex-col h-full justify-between w-full", viewMode === 'list' && "flex-row gap-4 items-center flex-1")}>
                      
                      {/* Image Container with Category Badge */}
                      <div 
                        className={cn("relative rounded-xl overflow-hidden bg-zinc-50 shrink-0 cursor-pointer border border-zinc-100", viewMode === 'grid' ? "aspect-square w-full mb-3" : "w-16 h-16")}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* Categoría Badge Overlay */}
                        <span className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 bg-[#EEF2F0] rounded-md text-[8px] font-bold text-emerald-700 uppercase tracking-wide select-none">
                          {product.category || 'General'}
                        </span>

                        {product.imageUrl ? (
                          <img src={product.imageUrl.split(',')[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-200"><ShoppingBag className="w-6 h-6" /></div>
                        )}
                      </div>

                      {/* Title and price row (no bottom stock dot or divider line) */}
                      <div className="flex-1 flex flex-col justify-between mt-1 select-none text-left">
                        <h4 className="font-bold text-[11px] text-zinc-900 leading-snug line-clamp-2 cursor-pointer hover:text-zinc-950 transition-colors" onClick={() => setSelectedProduct(product)}>
                          {product.name}
                        </h4>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="font-extrabold text-[11px] text-zinc-900 leading-none select-none" suppressHydrationWarning={true}>
                            ${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </span>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const parsedOpts = product.options
                                ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options)
                                : []
                              if (Array.isArray(parsedOpts) && parsedOpts.length > 0) {
                                setSelectedProduct(product)
                              } else {
                                changeQtyByKey(product.id, 1)
                              }
                            }}
                            disabled={product.stock <= 0}
                            className={cn(
                              "w-8 h-8 rounded-full border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95",
                              isItemInCart && "border-emerald-500 bg-emerald-50/20"
                            )}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 font-extrabold" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </main>

        {/* 5. BOTTOM NAVIGATION BAR FOR MOBILE (Mockup Móvil) */}
        <div className={cn(
          (device === 'tablet' || device === 'movil') ? "absolute" : "fixed",
          "bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-150 h-16 flex items-center justify-around shadow-none px-4 select-none"
        )}>
          <button 
            onClick={() => handleMobileTabClick('inicio')}
            className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
          >
            <Home className={cn("w-5 h-5 transition-colors", activeMobileTab === 'inicio' ? "text-emerald-600" : "text-zinc-400")} />
            <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'inicio' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Inicio</span>
          </button>
          
          <button 
            onClick={() => handleMobileTabClick('categorias')}
            className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
          >
            <LayoutGrid className={cn("w-5 h-5 transition-colors", activeMobileTab === 'categorias' ? "text-emerald-600" : "text-zinc-400")} />
            <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'categorias' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Categorías</span>
          </button>
          
          <button 
            onClick={() => handleMobileTabClick('buscar')}
            className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
          >
            <Search className={cn("w-5 h-5 transition-colors", activeMobileTab === 'buscar' ? "text-emerald-600" : "text-zinc-400")} />
            <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'buscar' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Buscar</span>
          </button>
          
          <button 
            onClick={() => handleMobileTabClick('carrito')}
            className="flex flex-col items-center gap-1 cursor-pointer relative bg-transparent border-0 outline-none"
          >
            <div className="relative">
              <ShoppingCart className={cn("w-5 h-5 transition-colors", activeMobileTab === 'carrito' ? "text-emerald-600" : "text-zinc-400")} />
              {itemsInCart > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                  {itemsInCart}
                </span>
              )}
            </div>
            <span className={cn("text-[9px] font-bold transition-colors", activeMobileTab === 'carrito' ? "text-emerald-600 font-extrabold" : "text-zinc-400")}>Carrito</span>
          </button>
        </div>


      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL / DRAWER DE CARRITO & CHECKOUT (COMPARTIDO) */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className={cn("inset-0 z-[100] flex items-end sm:items-center justify-center animate-in fade-in duration-300", !!device ? "absolute" : "fixed")}>
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Cabecera del Carrito */}
            <div className="p-6 pb-4 flex justify-between items-center border-b border-zinc-100">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Tu Pedido</h2>
                <p className="text-xs font-bold text-zinc-400">Total: {itemsInCart} items</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-zinc-50 border border-zinc-200/50 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer active:scale-90 transition-transform border-none"
              >
                <X className="w-5 h-5 text-zinc-900" />
              </button>
            </div>

            {/* Contenido Desplazable del Pedido */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Listado de Productos en el Carrito */}
              <div className="space-y-4">
                {cartProducts.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
                    <p className="text-xs font-bold text-zinc-400">Tu carrito está vacío</p>
                  </div>
                ) : (
                  cartProducts.map(p => (
                    <div key={p.cartKey} className="flex items-center justify-between bg-zinc-50/50 border border-zinc-100 p-3 rounded-xl gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl.split(',')[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-zinc-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-bold text-xs text-zinc-900 truncate">{p.name}</p>
                          {Object.keys(p.variations).length > 0 && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                              {Object.entries(p.variations).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                            </p>
                          )}
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-bold">${p.price.toLocaleString('es-CO')} x {p.qty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-zinc-200 p-1 rounded-lg shrink-0">
                        <button onClick={() => changeQtyByKey(p.cartKey, -1)} className="p-1 cursor-pointer hover:bg-zinc-50 rounded text-zinc-500 border-none bg-transparent"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-xs font-bold w-4 text-center tabular-nums">{p.qty}</span>
                        <button onClick={() => changeQtyByKey(p.cartKey, 1)} className="p-1 cursor-pointer hover:bg-zinc-50 rounded text-zinc-500 border-none bg-transparent"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario de Checkout */}
              {cartProducts.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="space-y-3.5">
                    <label className="text-[10px] font-bold text-zinc-400 tracking-wider">Datos de entrega</label>
                    
                    <input 
                      placeholder="¿A nombre de quién?" 
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all" 
                      value={form.customerName}
                      onChange={e => {
                        setForm(f => ({ ...f, customerName: e.target.value }))
                        setHasChanged(true)
                      }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="Ciudad" 
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all" 
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      />
                      <input 
                        placeholder="Dirección" 
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all" 
                        value={form.address}
                        onChange={e => {
                          setForm(f => ({ ...f, address: e.target.value }))
                          setHasChanged(true)
                        }}
                      />
                    </div>
                    
                    <p className="text-[10px] text-zinc-400 italic font-semibold">* También puedes ubicarte en el mapa interactivo:</p>
                  </div>
                  
                  {/* Mapa Interactivo */}
                  <div className="rounded-xl overflow-hidden border border-zinc-200 h-40 shadow-none">
                    <MapPicker 
                      onLocationSelectAction={(lat, lng, addr) => {
                        setForm(f => ({ ...f, lat, lng, address: addr || f.address, city: f.city || 'Bogotá' }))
                      }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Footer de Checkout y Compra */}
            {cartProducts.length > 0 && (
              <div className="p-6 bg-zinc-50 border-t border-zinc-150 space-y-3.5 shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-zinc-500">Total a pagar</span>
                  <span className="text-xl font-black text-zinc-950 tabular-nums">${total.toLocaleString('es-CO')}</span>
                </div>
                
                <button 
                  onClick={handleWhatsAppOrder}
                  disabled={loadingAction !== null}
                  className={cn(
                    "w-full h-12 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-none border-none",
                    loadingAction === 'whatsapp' && "opacity-75 cursor-not-allowed"
                  )}
                >
                  <MessageCircle className="w-4.5 h-4.5 text-white fill-current" />
                  <span>{loadingAction === 'whatsapp' ? 'Procesando...' : 'Pedir por WhatsApp'}</span>
                </button>

                {store.cardPaymentsEnabled && (
                  <button 
                    onClick={handleCardPayment}
                    disabled={loadingAction !== null}
                    className={cn(
                      "w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-none border-none",
                      loadingAction === 'card' && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    <CreditCard className="w-4.5 h-4.5" />
                    <span>{loadingAction === 'card' ? 'Iniciando Pago...' : 'Pagar con Tarjeta'}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SIMULATOR DRAWER PARA DETALLE EN MÓVILES (COMPARTIDO) */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <div className={cn("lg:hidden inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300", !!device ? "absolute" : "fixed")}>
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative w-full bg-white rounded-t-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="p-5 pb-3 flex justify-between items-start border-b border-zinc-100">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 tracking-wider">{selectedProduct.category || 'General'} • SKU: {productSku}</p>
                <h3 className="text-sm font-bold text-zinc-900 mt-0.5 leading-snug">{selectedProduct.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 bg-zinc-50 border border-zinc-200/50 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Product Image */}
              <div className="relative w-full aspect-video bg-zinc-50 border-b border-zinc-100 flex items-center justify-center">
                {currentDetailImg ? <img src={currentDetailImg} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-10 h-10 text-zinc-300" />}
              </div>

              <div className="p-5 space-y-4">
                <span className="text-xl font-black text-zinc-950 block">${selectedProduct.price.toLocaleString('es-CO')}</span>

                {/* Dynamic Product Options Selectors */}
                {(() => {
                  const parsedOpts = selectedProduct.options
                    ? (typeof selectedProduct.options === 'string' ? JSON.parse(selectedProduct.options) : selectedProduct.options)
                    : []
                  if (!Array.isArray(parsedOpts) || parsedOpts.length === 0) return null
                  return (
                    <div className="space-y-4 pt-1">
                      {parsedOpts.map((opt: any) => {
                        if (!opt.name || !Array.isArray(opt.values) || opt.values.length === 0) return null
                        const currentVal = selectedOptions[opt.name] || opt.values[0]
                        return (
                          <div key={opt.name} className="space-y-1.5 text-left">
                            <span className="text-[10px] font-bold text-zinc-500">{opt.name}: {currentVal}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {opt.values.map((val: string) => (
                                <button
                                  key={val}
                                  onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-9",
                                    currentVal === val
                                      ? "bg-emerald-600 border-emerald-600 text-white font-extrabold"
                                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                  )}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                <div className="text-[10px] font-bold text-emerald-600">Stock disponible: {selectedProduct.stock} unidades</div>
                <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                  <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Descripción</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed font-semibold whitespace-pre-wrap">{selectedProduct.description || 'Sin descripción disponible.'}</p>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-5 bg-zinc-50 border-t border-zinc-100 flex items-center gap-3">
              {qtyInCart > 0 ? (
                <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-1.5 w-full justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => changeQtyByKey(selectedCartKey, -1)} className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-700 border-none bg-transparent"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="font-extrabold text-sm tabular-nums">{qtyInCart}</span>
                    <button onClick={() => changeQtyByKey(selectedCartKey, 1)} className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-700 border-none bg-transparent"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <span className="text-xs font-black text-zinc-950 pr-2">${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}</span>
                </div>
              ) : (
                <button
                  onClick={() => changeQtyByKey(selectedCartKey, 1)}
                  className="w-full flex items-center justify-center gap-2 h-11 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer border-none"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar al carrito</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}


      {/* Drawer: Menú Lateral Móvil (Categorías & Enlaces) */}
      {isMobileMenuOpen && (
        <div className={cn("inset-0 z-50 flex lg:hidden", !!device ? "absolute" : "fixed")}>
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn("inset-0 bg-black/40 backdrop-blur-sm transition-opacity", !!device ? "absolute" : "fixed")}
          />
          {/* Menu Panel */}
          <div className="relative flex w-full max-w-[280px] flex-col bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 overflow-hidden">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={formattedStoreName} className="w-full h-full object-cover" />
                  ) : (
                    <Sprout className="w-4.5 h-4.5" />
                  )}
                </div>
                <span className="font-bold text-xs text-zinc-900 tracking-tight">{formattedStoreName}</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-650 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-left">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Categorías</h4>
                <div className="space-y-1">
                  {categories.map(cat => {
                    const Icon = getCategoryIcon(cat)
                    const isActive = selectedCategory === cat
                    const count = cat === 'Todos' ? store.products.length : categoryCounts[cat] || 0

                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat)
                          setIsMobileMenuOpen(false)
                          document.getElementById('mobile-categories-row')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className={cn(
                          "w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer",
                          isActive
                            ? "text-emerald-700 bg-emerald-50/50 font-bold border-l-2 border-emerald-500 rounded-l-none"
                            : "text-zinc-600 hover:text-zinc-900 border-l-2 border-transparent hover:bg-zinc-50/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{cat === 'Todos' ? 'Todos los productos' : cat}</span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          isActive ? "bg-emerald-100 text-emerald-800" : "text-zinc-400 bg-zinc-100"
                        )}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Contacto</h4>
                <a 
                  href={`https://wa.me/${initialPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50/50 rounded-lg"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500 fill-current" />
                  <span>Comprar por WhatsApp</span>
                </a>
              </div>

              {/* Schedule Info (Mobile menu) */}
              {schedule?.enabled && (
                <div className="space-y-2 pt-4 border-t border-zinc-100 text-left">
                  <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Horario de atención</h4>
                  <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-150 rounded-lg text-zinc-700 text-[11px] font-semibold">
                    {schedule.alwaysOpen ? 'Abierto las 24 horas (Siempre abierto)' : schedule.text}
                  </div>
                </div>
              )}

              {/* Socials Links (Mobile menu) */}
              {socialsShowInCatalog && (store.aiSettings?.socials?.instagram || store.aiSettings?.socials?.facebook || store.aiSettings?.socials?.twitter) && (
                <div className="space-y-2 pt-4 border-t border-zinc-100 text-left">
                  <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Redes sociales</h4>
                  <div className="flex gap-2 px-1">
                    {store.aiSettings.socials.instagram && (
                      <a href={store.aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 hover:bg-zinc-100">
                        Instagram
                      </a>
                    )}
                    {store.aiSettings.socials.facebook && (
                      <a href={store.aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 hover:bg-zinc-100">
                        Facebook
                      </a>
                    )}
                    {store.aiSettings.socials.twitter && (
                      <a href={store.aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 hover:bg-zinc-100">
                        X / Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Filtros / Ordenación Bottom Sheet */}
      {isFilterOpen && (
        <div className={cn("inset-0 z-50 flex items-end justify-center lg:hidden", !!device ? "absolute" : "fixed")}>
          {/* Backdrop */}
          <div 
            onClick={() => setIsFilterOpen(false)}
            className={cn("inset-0 bg-black/40 backdrop-blur-sm transition-opacity", !!device ? "absolute" : "fixed")}
          />
          {/* Sheet Panel */}
          <div className="relative w-full max-w-lg bg-white rounded-t-2xl shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Ordenar y Filtrar</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-650 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold text-zinc-800">Ordenar por</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'default', label: 'Destacados' },
                  { value: 'price-asc', label: 'Menor precio' },
                  { value: 'price-desc', label: 'Mayor precio' },
                  { value: 'name-asc', label: 'Nombre A-Z' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value as any)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition-all active:scale-[0.97]",
                      sortBy === opt.value
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold text-zinc-800">Disponibilidad</h4>
              <button
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={cn(
                  "w-full flex items-center justify-between py-2.5 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all",
                  onlyInStock
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600"
                )}
              >
                <span>Mostrar solo productos en stock</span>
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-all",
                  onlyInStock ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-300 bg-white"
                )}>
                  {onlyInStock && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-none active:scale-[0.98] transition-all cursor-pointer border-none"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

