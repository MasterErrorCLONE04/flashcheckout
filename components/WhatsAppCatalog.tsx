'use client'

import { useState, useEffect, useRef } from 'react'
import type { ComponentType } from 'react'
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
import { SiVisa, SiMastercard } from 'react-icons/si'

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc'
type CatalogIconName = 'Truck' | 'ShieldCheck' | 'Award' | 'Clock' | 'Gift' | 'Star'
type CatalogNavAction = 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link'

type ProductOption = {
  name: string
  values: string[]
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category?: string
  description?: string
  options?: ProductOption[] | string
}

type CatalogSettings = {
  colors?: {
    primario?: string
    secundario?: string
    acento?: string
    fondo?: string
    texto?: string
  }
  typography?: string
  bannerUrl?: string
  bannerTitle?: string
  bannerSubtitle?: string
  announcement?: {
    enabled?: boolean
    text?: string
    bgColor?: string
    textColor?: string
  }
  bannerButton?: {
    text?: string
    action?: 'scroll' | 'whatsapp' | 'link'
    link?: string
  }
  benefits?: {
    items?: Array<{ icon: CatalogIconName; label: string; desc: string }>
  }
  socialsShowInCatalog?: boolean
  schedule?: {
    enabled?: boolean
    text?: string
    alwaysOpen?: boolean
  }
  heroType?: string
  heroVideoUrl?: string
  ingredientsSection?: {
    title?: string
    leftTitle?: string
    leftDesc?: string
    centerImageUrl?: string
    rightTitle?: string
    rightDesc?: string
  }
  freeShipping?: {
    enabled?: boolean
    threshold?: number
  }
  bentoHighlights?: {
    title?: string
    items?: Array<{ emoji: string; title: string; desc: string }>
  }
  accordionSpecs?: {
    tabs?: Array<{ title: string; content: string }>
  }
  brandStory?: {
    title?: string
    desc?: string
    bgUrl?: string
    btnText?: string
    btnLink?: string
  }
  visualCategories?: Array<{ category: string; imageUrl: string }>
  processTimeline?: {
    title?: string
    items?: Array<{ step: string; title: string; desc: string }>
  }
  lifestyleGallery?: string[]
  newsletterWidget?: {
    title?: string
    subtitle?: string
    placeholder?: string
    btnText?: string
    bgColor?: string
    textColor?: string
  }
  navbarLinks?: Array<{ label: string; action: CatalogNavAction; link?: string }>
  sections?: Record<string, boolean | undefined>
}

type Store = {
  id: string
  name: string
  whatsapp: string
  products: Product[]
  logoUrl: string | null
  cardPaymentsEnabled: boolean
  bio?: string | null
  aiSettings?: CatalogSettings
  bannerUrl?: string | null
}

type NavLink = {
  label: string
  action: CatalogNavAction
  link?: string
}

type CatalogIcon = ComponentType<{ className?: string }>

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

function normalizeProductOptions(options: Product['options']): ProductOption[] {
  if (!options) return []

  const parsed = typeof options === 'string'
    ? (() => {
        try {
          return JSON.parse(options)
        } catch {
          return null
        }
      })()
    : options

  if (!Array.isArray(parsed)) return []

  return parsed.filter((opt): opt is ProductOption => (
    !!opt &&
    typeof opt.name === 'string' &&
    Array.isArray(opt.values)
  ))
}


const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.836 4.836 0 0 1-3.43-1.44 4.836 4.836 0 0 1-1.44-3.43h-3.07v16.06c0 1.1-.39 2.05-1.17 2.83a3.86 3.86 0 0 1-2.83 1.17 3.86 3.86 0 0 1-2.83-1.17 3.86 3.86 0 0 1-1.17-2.83 3.86 3.86 0 0 1 1.17-2.83 3.86 3.86 0 0 1 2.83-1.17c.26 0 .52.03.77.08v-3.07a7.03 7.03 0 0 0-1.1-.09 6.93 6.93 0 0 0-4.95 2.05 6.93 6.93 0 0 0-2.05 4.95 6.93 6.93 0 0 0 2.05 4.95 6.93 6.93 0 0 0 4.95 2.05 6.93 6.93 0 0 0 4.95-2.05 6.93 6.93 0 0 0 2.05-4.95V7.07c1.1.8 2.37 1.25 3.82 1.36V5.36c-.46 0-.91-.1-1.34-.3-.42-.2-.8-.47-1.11-.8a4.67 4.67 0 0 1-.84-1.28c-.21-.47-.32-.96-.32-1.47H19.59v3.18z"/>
  </svg>
)

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
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0)
  const bannerUrls = store.bannerUrl ? store.bannerUrl.split(',').map(u => u.trim()).filter(Boolean) : []

  useEffect(() => {
    if (bannerUrls.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % bannerUrls.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [bannerUrls.length])
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
  const aiSettings: CatalogSettings = store.aiSettings || {}
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
  const benefits: { items: Array<{ icon: CatalogIconName; label: string; desc: string }> } = aiSettings.benefits || {
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

  // Chocodate Premium configurations
  const heroType = aiSettings.heroType || 'image'
  const heroVideoUrl = aiSettings.heroVideoUrl || 'https://www.chocodate.com/assets/video/hero.mp4'

  const ingredientsSection = aiSettings.ingredientsSection || {
    title: 'Nuestros Ingredientes Premium',
    leftTitle: 'Dátiles de Faraón',
    leftDesc: 'Dulces, carnosos, naturales y recolectados en su punto de madurez.',
    centerImageUrl: 'https://www.chocodate.com/assets/img/central-product.png',
    rightTitle: 'Chocolate Belga Puro',
    rightDesc: 'Exquisita cobertura de chocolate de primera calidad con textura suave.'
  }

  const freeShipping = aiSettings.freeShipping || {
    enabled: false,
    threshold: 100000
  }

  // Bento Highlights config (Chocodate Style)
  const bentoHighlights: { title: string; items: Array<{ emoji: string; title: string; desc: string }> } = aiSettings.bentoHighlights || {
    title: 'Nuestros Ingredientes Premium',
    items: [
      { emoji: '🌴', title: 'Dátiles de Faraón', desc: 'Dulces, carnosos y naturales' },
      { emoji: '🥜', title: 'Almendras Tostadas', desc: 'Crujientes y seleccionadas a mano' },
      { emoji: '🍫', title: 'Chocolate Belga', desc: 'Cobertura suave de cacao puro' }
    ]
  }

  // Accordion Specs config
  const accordionSpecs: Array<{ title: string; content: string }> = aiSettings.accordionSpecs?.tabs || [
    { title: 'Ficha Nutricional', content: 'Calorías: 140 kcal | Grasas: 4g | Carbohidratos: 22g | Proteínas: 2g por porción.' },
    { title: 'Método de Envío', content: 'Empacado con tecnología térmica para conservar el chocolate fresco hasta tu puerta.' }
  ]

  // Brand Story config
  const brandStory = aiSettings.brandStory || {
    title: 'Nuestra Historia de Sabor',
    desc: 'Fundada con la visión de combinar frutos del desierto y chocolate fino, creamos una experiencia única de confitería artesanal.',
    bgUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=800&auto=format&fit=crop',
    btnText: 'Saber más',
    btnLink: ''
  }

  // Categorías Visuales config
  const visualCategories: Array<{ category: string; imageUrl: string }> = aiSettings.visualCategories || [
    { category: 'Café', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop' },
    { category: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop' },
    { category: 'Combos', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop' }
  ]

  // Proceso Timeline config
  const processTimeline: { title: string; items: Array<{ step: string; title: string; desc: string }> } = aiSettings.processTimeline || {
    title: '¿Cómo Comprar en FlashCheckout?',
    items: [
      { step: '1', title: 'Explora y Agrega', desc: 'Selecciona tus productos favoritos del catálogo y agrégalos al carrito.' },
      { step: '2', title: 'Datos de Envío', desc: 'Ingresa tu dirección de entrega y ubícate en el mapa interactivo.' },
      { step: '3', title: 'Completa en WhatsApp', desc: 'Finaliza el pedido enviando el mensaje estructurado de WhatsApp al vendedor.' }
    ]
  }

  // Galería de fotos reales de estilo de vida (Lifestyle)
  const lifestyleGallery = aiSettings.lifestyleGallery || [
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop'
  ]

  // Newsletter Widget Premium config
  const newsletterWidget = aiSettings.newsletterWidget || {
    title: 'Únete a Nuestro Club Gourmet',
    subtitle: 'Entérate antes que nadie de nuestros lanzamientos, descuentos exclusivos y recetas especiales.',
    placeholder: 'Ingresa tu correo electrónico',
    btnText: 'Suscribirme',
    bgColor: '#111827',
    textColor: '#FFFFFF'
  }

  // Menú de navegación superior (Navbar links)
  const navbarLinks: NavLink[] = aiSettings.navbarLinks || [
    { label: 'Inicio', action: 'scroll-banner', link: '' },
    { label: 'Productos', action: 'scroll-products', link: '' },
    { label: 'Historia', action: 'scroll-story', link: '' },
    { label: 'Contacto', action: 'whatsapp', link: '' }
  ]

  const handleNavbarLinkClick = (item: NavLink) => {
    setSelectedProduct(null)
    if (item.action === 'scroll-banner') {
      setActiveNavTab('Inicio')
      setTimeout(() => {
        const el = document.getElementById('catalog-banner') || document.getElementById('catalog-banner-mobile')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (item.action === 'scroll-products') {
      setActiveNavTab('Productos')
      setTimeout(() => {
        const el = document.getElementById('catalog-products')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (item.action === 'scroll-story') {
      setActiveNavTab('Historia')
    } else if (item.action === 'whatsapp') {
      window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=Hola! Me gustaría hacer una consulta.`, '_blank')
    } else if (item.action === 'link' && item.link) {
      window.open(item.link, '_blank')
    } else {
      setActiveNavTab(item.label)
    }
  }

  const IconMap: Record<string, CatalogIcon> = {
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

  const sections = {
    banner: aiSettings.sections?.banner !== false,
    destacados: aiSettings.sections?.destacados !== false,
    categorias: aiSettings.sections?.categorias !== false,
    beneficios: aiSettings.sections?.beneficios !== false,
    bentoHighlights: aiSettings.sections?.bentoHighlights === true,
    accordionSpecs: aiSettings.sections?.accordionSpecs === true,
    brandStory: aiSettings.sections?.brandStory === true,
    visualCategories: aiSettings.sections?.visualCategories === true,
    processTimeline: aiSettings.sections?.processTimeline === true,
    lifestyleGallery: aiSettings.sections?.lifestyleGallery === true,
    newsletterWidget: aiSettings.sections?.newsletterWidget === true,
    ingredientsSection: aiSettings.sections?.ingredientsSection === true
  }

  const formattedStoreName = store.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  useEffect(() => {
    setActiveImageIdx(0)
    if (selectedProduct) {
      const parsedOpts = normalizeProductOptions(selectedProduct.options)
      const defaults: Record<string, string> = {}
      parsedOpts.forEach((opt) => {
        if (opt.values.length > 0) {
          defaults[opt.name] = opt.values[0]
        }
      })
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
      setActiveNavTab('Productos')
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else if (tab === 'categorias') {
      setActiveNavTab('Productos')
      setTimeout(() => {
        document.getElementById('mobile-categories-row')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (tab === 'inicio') {
      setActiveNavTab('Inicio')
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
              {navbarLinks.map((item, idx: number) => {
                const isActive = activeNavTab === item.label;
                return (
                  <span
                    key={idx}
                    onClick={() => {
                      setActiveNavTab(item.label)
                      handleNavbarLinkClick(item)
                    }}
                    className={cn(
                      "cursor-pointer hover:text-zinc-900 transition-all pb-1 relative",
                      isActive ? "text-zinc-950 border-b-2 border-emerald-600 font-extrabold" : "text-zinc-500"
                    )}
                  >
                    {item.label}
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
                      <InstagramIcon />
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
                      <FacebookIcon />
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
                      <TwitterIcon />
                    </a>
                  )}
                  {store.aiSettings?.socials?.tiktok && (
                    <a 
                      href={store.aiSettings.socials.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                      title="TikTok"
                    >
                      <TikTokIcon />
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
        {/* Banner principal (Desktop) */}
        {activeNavTab === 'Inicio' && !selectedProduct && sections.banner && (heroType === 'video' || bannerUrls.length > 0) && (
          <div id="catalog-banner" className="max-w-[1300px] mx-auto w-full px-6 pt-6 pb-2 shrink-0">
            <div className="relative h-[340px] w-full bg-zinc-900 rounded-3xl overflow-hidden flex items-center px-12 text-left select-none shadow-sm group">
              {heroType === 'video' && heroVideoUrl ? (
                <video 
                  src={heroVideoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 z-0"
                />
              ) : bannerUrls.length > 0 ? (
                <div className="absolute inset-0 w-full h-full">
                  {bannerUrls.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url} 
                      alt="Banner" 
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0",
                        idx === currentBannerIdx ? "opacity-100" : "opacity-0"
                      )} 
                    />
                  ))}
                </div>
              ) : null}
              <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
              
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

              {/* Navigation Indicators */}
              {bannerUrls.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentBannerIdx(prev => (prev === 0 ? bannerUrls.length - 1 : prev - 1))}
                    className="absolute left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentBannerIdx(prev => (prev + 1) % bannerUrls.length)}
                    className="absolute right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {bannerUrls.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentBannerIdx(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all border-0 p-0 cursor-pointer",
                          idx === currentBannerIdx ? "bg-white w-5" : "bg-white/40 hover:bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

{/* Barra de Beneficios (Desktop) */}
        {activeNavTab === 'Inicio' && !selectedProduct && sections.beneficios && benefits?.items?.length > 0 && (
          <div className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
            <div className="bg-white border border-zinc-150 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-4">
              {benefits.items.map((item, idx: number) => {
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

        {/* Categorías Visuales (Desktop) */}
        {activeNavTab === 'Inicio' && !selectedProduct && sections.visualCategories && visualCategories?.length > 0 && (
          <div className="max-w-[1300px] mx-auto w-full px-6 pt-6 pb-2 shrink-0 select-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {visualCategories.map((catItem, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedCategory(catItem.category)}
                  className={cn(
                    "bg-white border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:border-zinc-350 hover:shadow-md active:scale-[0.98]",
                    selectedCategory === catItem.category ? "border-emerald-600 ring-2 ring-emerald-500/10" : "border-zinc-150"
                  )}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                    {catItem.imageUrl ? (
                      <img src={catItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <span className="text-xs font-black text-zinc-800 tracking-tight leading-tight">{catItem.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bento Grid Highlights (Desktop) */}
        {activeNavTab === 'Inicio' && !selectedProduct && sections.bentoHighlights && bentoHighlights?.items?.length > 0 && (
          <div className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-left mb-3">{bentoHighlights.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bentoHighlights.items.map((item, idx: number) => (
                <div key={idx} className="bg-white border border-zinc-150 rounded-2xl p-5 text-left flex flex-col justify-between hover:border-zinc-300 transition-all select-none">
                  <div className="text-3xl mb-3">{item.emoji || '✨'}</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 leading-snug">{item.title}</h4>
                    <p className="text-xs font-semibold text-zinc-500 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3-Column Ingredients Storytelling (Desktop) */}
        {activeNavTab === 'Inicio' && !selectedProduct && sections.ingredientsSection && ingredientsSection && (
          <div className="max-w-[1300px] mx-auto w-full px-6 pt-6 pb-2 shrink-0 select-none text-center">
            <div className="bg-white border border-zinc-150 rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-8">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{ingredientsSection.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Columna Izquierda */}
                <div className="text-right space-y-3">
                  <h4 className="font-extrabold text-sm text-zinc-900">{ingredientsSection.leftTitle}</h4>
                  <p className="text-xs font-semibold text-zinc-500 leading-relaxed">{ingredientsSection.leftDesc}</p>
                </div>
                {/* Columna Central (Imagen) */}
                <div className="flex justify-center">
                  <img 
                    src={ingredientsSection.centerImageUrl} 
                    alt="Center Ingredients" 
                    className="max-h-[220px] object-contain hover:rotate-3 transition-transform duration-500" 
                  />
                </div>
                {/* Columna Derecha */}
                <div className="text-left space-y-3">
                  <h4 className="font-extrabold text-sm text-zinc-900">{ingredientsSection.rightTitle}</h4>
                  <p className="text-xs font-semibold text-zinc-500 leading-relaxed">{ingredientsSection.rightDesc}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        {activeNavTab === 'Inicio' && !selectedProduct && (
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

          </div>
        </main>
      )}

          {/* Secciones Adicionales de la Página de Inicio (Desktop) */}
          {activeNavTab === 'Inicio' && !selectedProduct && (
            <div className="max-w-[1300px] mx-auto w-full px-6 pb-20">
              {/* Accordion Specs (Desktop) */}
              {sections.accordionSpecs && accordionSpecs?.length > 0 && (
                <div className="mt-12 border-t border-zinc-150 pt-8 w-full">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-left mb-6">Especificaciones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {accordionSpecs.map((tab, idx: number) => (
                      <details key={idx} className="group border border-zinc-150 rounded-xl bg-white overflow-hidden" open={idx === 0}>
                        <summary className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-905 list-none [&::-webkit-details-marker]:hidden">
                          <span>{tab.title}</span>
                          <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="px-5 py-4 border-t border-zinc-150 text-xs font-semibold leading-relaxed text-zinc-600 whitespace-pre-wrap">
                          {tab.content}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Story (Desktop) */}
              {sections.brandStory && brandStory && (
                <div id="brand-story-section" className="w-full pt-10 shrink-0 select-none">
                  <div className="relative h-[280px] w-full bg-zinc-900 rounded-3xl flex items-center justify-center text-center p-8 overflow-hidden">
                    {brandStory.bgUrl && (
                      <img src={brandStory.bgUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-35 z-0" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 z-0" />
                    <div className="relative z-10 space-y-4 max-w-xl text-white">
                      <h2 className="text-xl xl:text-2xl font-black tracking-tight">{brandStory.title}</h2>
                      <p className="text-xs font-semibold text-zinc-200 leading-relaxed">{brandStory.desc}</p>
                      {brandStory.btnText && (
                        <button
                          onClick={() => {
                            if (brandStory.btnLink) window.open(brandStory.btnLink, '_blank')
                          }}
                          className="px-6 py-2.5 rounded-xl font-bold text-xs border-0 cursor-pointer shadow-md hover:shadow-lg transition-all"
                          style={{ backgroundColor: colors.primario, color: '#FFFFFF' }}
                        >
                          {brandStory.btnText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Proceso Timeline (Desktop) */}
              {sections.processTimeline && processTimeline?.items?.length > 0 && (
                <div className="mt-12 border-t border-zinc-150 pt-8 w-full select-none text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">{processTimeline.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {processTimeline.items.map((stepItem, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start relative z-10 bg-white p-2">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                          style={{ backgroundColor: `${colors.primario}12`, color: colors.primario }}
                        >
                          {stepItem.step}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs text-zinc-900 leading-snug">{stepItem.title}</h4>
                          <p className="text-[11px] font-semibold text-zinc-500 leading-normal">{stepItem.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Gallery (Desktop) */}
              {sections.lifestyleGallery && lifestyleGallery?.length > 0 && (
                <div className="mt-12 border-t border-zinc-150 pt-8 w-full select-none text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">Estilo de Vida</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {lifestyleGallery.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 group border border-zinc-200/50">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Banner Widget (Desktop) */}
              {sections.newsletterWidget && newsletterWidget && (
                <div className="mt-12 w-full select-none rounded-3xl overflow-hidden relative">
                  <div 
                    className="p-10 text-center flex flex-col items-center justify-center space-y-4"
                    style={{ backgroundColor: newsletterWidget.bgColor, color: newsletterWidget.textColor }}
                  >
                    <div className="max-w-xl space-y-2">
                      <h2 className="text-lg font-black tracking-tight">{newsletterWidget.title}</h2>
                      <p className="text-xs opacity-85 leading-relaxed font-semibold">{newsletterWidget.subtitle}</p>
                    </div>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        toast.success("¡Te has unido al club correctamente! 🎁 Recibirás noticias pronto.")
                      }}
                      className="flex gap-2 max-w-md w-full pt-1"
                    >
                      <input 
                        type="email"
                        required
                        placeholder={newsletterWidget.placeholder}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-semibold text-white outline-none focus:border-white focus:bg-white/15 placeholder:text-white/40"
                      />
                      <button 
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer border-0 shrink-0 shadow-sm"
                      >
                        {newsletterWidget.btnText}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* ========================================== */}
        {/* DEDICATED ABOUT PAGE VIEW (DESKTOP)        */}
        {/* ========================================== */}
        {activeNavTab === 'Historia' && !selectedProduct && (
          <main className="max-w-[1200px] mx-auto w-full px-6 py-12 space-y-16 select-none text-left animate-in fade-in duration-500 flex-1">
            {/* Page Header */}
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase block">Nuestra Trayectoria</span>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">Perfil de la Empresa</h2>
              <div className="w-12 h-1 bg-[#C5A880] mx-auto rounded-full mt-2" />
            </div>

            {/* Narrative Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-base text-zinc-650 leading-relaxed font-medium">
                  Fundada en <strong>1992</strong> por el visionario <em>Fawaz Masri</em>, Chocodate nació en el corazón de los Emiratos Árabes Unidos con una misión singular: elevar la humilde y nutritiva fruta del dátil de Arabia a una experiencia de confitería de clase mundial.
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed font-semibold">
                  Al combinar el dulzor natural y la riqueza en fibra de los mejores dátiles seleccionados a mano con el crujido de una almendra tostada en su interior, y envolverlo todo en una generosa capa de chocolate belga prémium, creamos una golosina única que trasciende fronteras. Hoy en día, nuestros productos se disfrutan en más de 50 países alrededor del mundo.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lg border border-zinc-150 h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=800&auto=format&fit=crop" 
                  alt="Chocodate Factory" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Two Pillars Section */}
            <div className="space-y-8">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight text-center">Nuestras Dos Grandes Columnas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pillar 1 */}
                <div className="bg-white border border-zinc-150 rounded-2xl p-6 space-y-4 hover:border-zinc-350 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#4A2E1B]/5 text-[#4A2E1B] flex items-center justify-center font-bold text-xl">🏭</div>
                  <h4 className="font-extrabold text-base text-[#4A2E1B]">Fábrica La Ronda (Dubái, EAU)</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    Nuestra planta principal con tecnología de punta dedicada exclusivamente al procesamiento de dátiles frescos, tostado de almendras y la formulación del chocolate belga. Cumple con las más estrictas certificaciones internacionales de calidad alimentaria (HACCP, ISO 22000 y Halal).
                  </p>
                </div>
                {/* Pillar 2 */}
                <div className="bg-white border border-zinc-150 rounded-2xl p-6 space-y-4 hover:border-zinc-350 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#C5A880]/5 text-[#C5A880] flex items-center justify-center font-bold text-xl">🌴</div>
                  <h4 className="font-extrabold text-base text-[#C5A880]">Star Foods (KSA)</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    Nuestra sucursal agrícola y de procesamiento ubicada en Arabia Saudita, encargada de la recolección y selección de los dátiles en su momento justo de maduración, garantizando una cadena de suministro sostenible y local.
                  </p>
                </div>
              </div>
            </div>

            {/* Leadership Section */}
            <div className="space-y-8">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight text-center">Equipo de Liderazgo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Fawaz Al-Masri', role: 'Fundador & CEO', icon: '👨‍💼' },
                  { name: 'Razan Al-Masri', role: 'Directora de Desarrollo (CBDO)', icon: '👩‍💼' },
                  { name: 'Omar Al-Masri', role: 'Director de Operaciones (COO)', icon: '👨‍💻' },
                  { name: 'Hazem Al-Masri', role: 'Gerente General', icon: '👨‍🔧' }
                ].map((member, idx) => (
                  <div key={idx} className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-5 text-center space-y-2.5">
                    <div className="w-16 h-16 rounded-full bg-white border border-zinc-200/50 flex items-center justify-center text-2xl mx-auto shadow-sm">{member.icon}</div>
                    <div>
                      <span className="font-extrabold text-xs text-zinc-900 block leading-tight">{member.name}</span>
                      <span className="text-[9px] font-bold text-zinc-400 block mt-1 uppercase tracking-wide">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Values */}
            <div className="space-y-8 pt-4">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight text-center font-bold">Nuestros Valores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Razón & Pasión', desc: 'Equilibramos la toma de decisiones basada en datos científicos con la pasión por la repostería fina.' },
                  { title: 'Tradición & Modernidad', desc: 'Respetamos el legado histórico del dátil del desierto mientras aplicamos tecnología de punta en empaque y producción.' },
                  { title: 'Familia & Comunidad', desc: 'Operamos como una empresa familiar que apoya a los agricultores locales y cuida de sus empleados.' }
                ].map((val, idx) => (
                  <div key={idx} className="p-5 border border-zinc-150 rounded-xl text-left bg-white space-y-2">
                    <h4 className="font-extrabold text-xs text-[#4A2E1B]">{val.title}</h4>
                    <p className="text-[11px] font-semibold text-zinc-500 leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ========================================== */}
        {/* DEDICATED SHOP PAGE VIEW (DESKTOP)         */}
        {/* ========================================== */}
        {activeNavTab === 'Productos' && !selectedProduct && (
          <main className="max-w-[1300px] mx-auto w-full px-6 py-8 flex-1 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT SIDEBAR: FILTERS (3/12 width) */}
              <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-5 space-y-6 text-left select-none sticky top-24">
                <div className="space-y-1 pb-3 border-b border-zinc-100">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Filtrar Productos</h3>
                  <p className="text-[10px] text-zinc-400 font-bold">Refina tu búsqueda gourmet</p>
                </div>

                {/* Categories checklist */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categorías</h4>
                  <div className="space-y-1.5">
                    {categories.map(cat => {
                      const isActive = selectedCategory === cat;
                      const count = cat === 'Todos' ? store.products.length : categoryCounts[cat] || 0;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer border-none bg-transparent",
                            isActive 
                              ? "text-emerald-700 bg-emerald-50/50 font-bold" 
                              : "text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50/50"
                          )}
                        >
                          <span>{cat === 'Todos' ? 'Todos los productos' : cat}</span>
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                            isActive ? "bg-emerald-100 text-emerald-800" : "text-zinc-400 bg-zinc-100"
                          )}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Disponibilidad</h4>
                  <button
                    onClick={() => setOnlyInStock(!onlyInStock)}
                    className={cn(
                      "w-full flex items-center justify-between py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all bg-transparent",
                      onlyInStock ? "border-emerald-600 bg-emerald-50/50 text-emerald-700 font-bold" : "border-zinc-200 bg-white text-zinc-600"
                    )}
                  >
                    <span>Solo en stock</span>
                    <div className={cn(
                      "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all",
                      onlyInStock ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-300 bg-white"
                    )}>
                      {onlyInStock && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Ordenar por</h4>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as CatalogSort)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="default">Recomendados</option>
                    <option value="price-asc">Precio: de Menor a Mayor</option>
                    <option value="price-desc">Precio: de Mayor a Menor</option>
                    <option value="name-asc">Nombre: A - Z</option>
                  </select>
                </div>
              </div>

              {/* RIGHT MAIN PANEL: PRODUCT GRID (9/12 width) */}
              <div className="lg:col-span-9 space-y-6">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-150">
                  <div className="text-left">
                    <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                      Catálogo Gourmet / {selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory}
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                    </p>
                  </div>
                  
                  {/* Grid/List View switcher */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
                    <button
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

                {/* Product Grid Render */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 space-y-3 bg-white border border-zinc-150 rounded-2xl">
                    <ShoppingBag className="w-12 h-12 text-zinc-350 mx-auto" />
                    <p className="text-sm font-black text-zinc-400">No encontramos productos con estos filtros</p>
                  </div>
                ) : (
                  <div className={cn(
                    "gap-6",
                    viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid grid-cols-1"
                  )}>
                    {filteredProducts.map(product => {
                      const productCartQty = Object.entries(cart).reduce((sum, [k, q]) => {
                        const { productId } = parseCartKey(k);
                        return sum + (productId === product.id ? q : 0);
                      }, 0);
                      const isItemInCart = productCartQty > 0;
                      return (
                        <div 
                          key={product.id}
                          className={cn(
                            "group relative bg-white border border-zinc-150 rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:border-zinc-350 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full select-none text-left",
                            viewMode === 'list' && "flex-row gap-4 items-center"
                          )}
                        >
                          <div className={cn("flex flex-col h-full justify-between w-full", viewMode === 'list' && "flex-row gap-4 items-center flex-1")}>
                            
                            {/* Image container */}
                            <div 
                              className={cn("relative rounded-xl overflow-hidden bg-zinc-50 shrink-0 cursor-pointer border border-zinc-100", viewMode === 'grid' ? "aspect-square w-full mb-4" : "w-24 h-24")}
                              onClick={() => setSelectedProduct(product)}
                            >
                              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#EEF2F0] rounded text-[8px] font-bold text-emerald-700 uppercase tracking-wide">
                                {product.category || 'General'}
                              </span>
                              {product.imageUrl ? (
                                <img src={product.imageUrl.split(',')[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingBag className="w-8 h-8" /></div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between mt-1 text-left">
                              <div>
                                <h4 
                                  className="font-bold text-sm text-zinc-900 leading-snug line-clamp-2 cursor-pointer hover:text-zinc-950 transition-colors" 
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  {product.name}
                                </h4>
                                {product.description && (
                                  <p className="text-[11px] text-zinc-400 mt-1.5 leading-normal line-clamp-2">{product.description}</p>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 pt-2 border-t border-zinc-100">
                                <span className="font-extrabold text-sm text-[#4A2E1B] leading-none" suppressHydrationWarning={true}>
                                  ${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => setSelectedProduct(product)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer select-none active:scale-95 border-none text-white",
                                    isItemInCart ? "bg-emerald-600" : "bg-[#4A2E1B] hover:bg-[#3D2515]"
                                  )}
                                >
                                  {isItemInCart ? 'Configurado' : 'Ver Detalles'}
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* ========================================== */}
        {/* DEDICATED PRODUCT DETAIL VIEW (DESKTOP)    */}
        {/* ========================================== */}
        {selectedProduct && (
          <main className="max-w-[1100px] mx-auto w-full px-6 py-8 flex-1 animate-in fade-in duration-500 text-left">
            {/* Back Button / Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mb-8 select-none">
              <button 
                onClick={() => {
                  setSelectedProduct(null);
                  setActiveNavTab('Productos');
                }}
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors border-none bg-transparent cursor-pointer font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Catálogo</span>
              </button>
              <span>/</span>
              <span className="text-zinc-400 truncate max-w-[200px]">{selectedProduct.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* LEFT COLUMN: Image Gallery */}
              <div className="space-y-4 text-left select-none">
                <div className="relative aspect-square w-full rounded-2xl bg-white border border-zinc-150 overflow-hidden flex items-center justify-center">
                  {currentDetailImg ? (
                    <img src={currentDetailImg} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-zinc-200" />
                  )}
                  {productImages.length > 1 && (
                    <>
                      <button onClick={() => setActiveImageIdx(p => p === 0 ? productImages.length - 1 : p - 1)} className="absolute left-3 w-8 h-8 rounded-full bg-white/90 shadow text-zinc-700 flex items-center justify-center border-none cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setActiveImageIdx(p => p === productImages.length - 1 ? 0 : p + 1)} className="absolute right-3 w-8 h-8 rounded-full bg-white/90 shadow text-zinc-700 flex items-center justify-center border-none cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                    </>
                  )}
                </div>

                {productImages.length > 1 && (
                  <div className="flex gap-2 justify-center overflow-x-auto py-1 scrollbar-none">
                    {productImages.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImageIdx(idx)} 
                        className={cn(
                          "w-14 h-14 rounded-xl overflow-hidden border bg-white shrink-0 cursor-pointer transition-all border-none", 
                          activeImageIdx === idx ? "ring-2 ring-[#C5A880] scale-102" : "opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Product Metadata & Actions */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6 text-left select-none">
                <div className="space-y-1.5 pb-4 border-b border-zinc-100">
                  <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase block">{selectedProduct.category || 'Gourmet Series'} • SKU: {productSku}</span>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-snug">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500">4.9 (48 valoraciones)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-3xl font-black text-[#4A2E1B] block" suppressHydrationWarning={true}>
                    ${selectedProduct.price.toLocaleString('es-CO')}
                  </span>

                  {/* Dynamic Product Options Selectors */}
                  {(() => {
      const parsedOpts = normalizeProductOptions(selectedProduct.options)
      if (parsedOpts.length === 0) return null
      return (
        <div className="space-y-4 pt-1">
          {parsedOpts.map((opt) => {
            const currentVal = selectedOptions[opt.name] || opt.values[0];
            return (
                            <div key={opt.name} className="space-y-1.5 text-left">
                              <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block">{opt.name}: {currentVal}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {opt.values.map((val: string) => (
                                  <button
                                    key={val}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                                    className={cn(
                                      "px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-10 border-none",
                                      currentVal === val
                                        ? "bg-[#C5A880] text-white font-black"
                                        : "bg-zinc-50 text-zinc-655 hover:bg-zinc-100"
                                    )}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <div className="text-xs font-bold text-[#C5A880] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
                    <span>Stock disponible: {selectedProduct.stock} unidades</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1 text-left">
                    <div className="flex items-center gap-1.5 text-zinc-700"><Truck className="w-3.5 h-3.5 text-[#C5A880]" /><span className="text-[10px] font-bold uppercase tracking-wider">Envío Seguro</span></div>
                    <p className="text-[9px] font-bold text-zinc-400 leading-normal">Cajas protegidas térmicamente. Envío en 24h-48h.</p>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1 text-left">
                    <div className="flex items-center gap-1.5 text-zinc-700"><ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" /><span className="text-[10px] font-bold uppercase tracking-wider">Calidad Premium</span></div>
                    <p className="text-[9px] font-bold text-zinc-400 leading-normal">Garantía total del chocolate y frescura del dátil.</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 pt-2 text-left">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Descripción del Producto</h4>
                  <p className="text-zinc-600 text-xs leading-relaxed font-semibold whitespace-pre-wrap">{selectedProduct.description || 'Deliciosos dátiles gourmet rellenos y bañados en chocolate belga.'}</p>
                </div>

                {/* Checkout actions */}
                <div className="pt-4 border-t border-zinc-100">
                  {qtyInCart > 0 ? (
                    <div className="flex items-center justify-between gap-4 p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <button onClick={() => changeQtyByKey(selectedCartKey, -1)} className="w-8.5 h-8.5 rounded-xl bg-white border border-zinc-250 flex items-center justify-center cursor-pointer active:scale-95 border-none shadow-sm"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="font-extrabold text-sm w-4 text-center tabular-nums">{qtyInCart}</span>
                        <button onClick={() => changeQtyByKey(selectedCartKey, 1)} disabled={qtyInCart >= selectedProduct.stock} className="w-8.5 h-8.5 rounded-xl bg-white border border-zinc-250 flex items-center justify-center cursor-pointer active:scale-95 border-none shadow-sm"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="text-sm font-black text-[#4A2E1B] pr-3">${(selectedProduct.price * qtyInCart).toLocaleString('es-CO')}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => changeQtyByKey(selectedCartKey, 1)} 
                      disabled={selectedProduct.stock <= 0} 
                      className="w-full flex items-center justify-center gap-2.5 h-12.5 bg-[#4A2E1B] hover:bg-[#3D2515] text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-[0.98] border-none"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Agregar al carrito</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Related products (Chocodate Style) */}
            <div className="mt-16 pt-10 border-t border-zinc-150 select-none text-left">
              <h3 className="text-sm font-black text-zinc-900 tracking-tight mb-6">Productos Recomendados</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {store.products
                  .filter(p => p.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setSelectedProduct(p);
                        setActiveImageIdx(0);
                      }}
                      className="group bg-white border border-zinc-150 hover:border-zinc-350 hover:shadow-sm rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 mb-3 shrink-0">
                        {p.imageUrl ? <img src={p.imageUrl.split(',')[0]} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-zinc-300" />}
                      </div>
                      <div className="space-y-2 text-left">
                        <h4 className="font-bold text-xs text-zinc-905 leading-snug line-clamp-1 group-hover:text-zinc-950">{p.name}</h4>
                        <span className="font-black text-xs text-[#4A2E1B] block">${p.price.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </main>
        )}

        {/* Premium Footer (Desktop) */}
        <footer className="w-full bg-[#4A2E1B] text-[#C5A880] py-12 px-6 border-t border-[#3D2515] select-none mt-auto">
          <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="space-y-4">
              <span className="font-black text-lg tracking-wider text-white uppercase">{formattedStoreName}</span>
              <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                Desde 1992, ofreciendo el equilibrio perfecto de sabores mediante la fusión gourmet del dátil de Arabia y el auténtico chocolate belga.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Enlaces Rápidos</h4>
              <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-300">
                <span onClick={() => { setSelectedProduct(null); setActiveNavTab('Inicio'); }} className="hover:text-white cursor-pointer transition-colors">Inicio</span>
                <span onClick={() => { setSelectedProduct(null); setActiveNavTab('Productos'); }} className="hover:text-white cursor-pointer transition-colors">Productos</span>
                <span onClick={() => { setSelectedProduct(null); setActiveNavTab('Historia'); }} className="hover:text-white cursor-pointer transition-colors">Sobre Nosotros</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Certificaciones</h4>
              <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
                ISO 22000 • HACCP • Certificación Halal. Máximos estándares de calidad internacional.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Métodos de Pago</h4>
              <div className="flex gap-2.5 flex-wrap items-center">
                <div className="bg-white px-2.5 py-1 rounded flex items-center justify-center h-7 shadow-sm">
                  <SiVisa className="h-4.5 w-auto text-[#1A1F71]" style={{ minWidth: '28px' }} />
                </div>
                <div className="bg-white px-2.5 py-1 rounded flex items-center justify-center h-7 shadow-sm">
                  <SiMastercard className="h-5 w-auto text-[#EB001B]" style={{ minWidth: '24px' }} />
                </div>
                <div className="bg-emerald-600/90 text-white border border-emerald-500/25 px-2.5 py-1 rounded flex items-center justify-center gap-1.5 h-7 text-[10px] font-bold shadow-sm">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Contra Entrega</span>
                </div>
              </div>
              
              {socialsShowInCatalog && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-extrabold text-[10px] text-white/50 uppercase tracking-wider">Síguenos</h4>
                  <div className="flex gap-2.5">
                    {store.aiSettings?.socials?.instagram && (
                      <a href={store.aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="Instagram">
                        <InstagramIcon />
                      </a>
                    )}
                    {store.aiSettings?.socials?.facebook && (
                      <a href={store.aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="Facebook">
                        <FacebookIcon />
                      </a>
                    )}
                    {store.aiSettings?.socials?.twitter && (
                      <a href={store.aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="Twitter / X">
                        <TwitterIcon />
                      </a>
                    )}
                    {store.aiSettings?.socials?.tiktok && (
                      <a href={store.aiSettings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors" title="TikTok">
                        <TikTokIcon />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-zinc-400 font-bold">© {new Date().getFullYear()} {formattedStoreName}. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
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
          {/* Banner principal (Mobile) */}
          {activeNavTab === 'Inicio' && sections.banner && (heroType === 'video' || bannerUrls.length > 0) && (
            <div id="catalog-banner-mobile" className="relative h-[190px] w-full bg-zinc-900 overflow-hidden flex items-center px-6 rounded-2xl text-left select-none shrink-0 shadow-sm group">
              {heroType === 'video' && heroVideoUrl ? (
                <video 
                  src={heroVideoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 z-0"
                />
              ) : bannerUrls.length > 0 ? (
                <div className="absolute inset-0 w-full h-full">
                  {bannerUrls.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url} 
                      alt="Banner" 
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0",
                        idx === currentBannerIdx ? "opacity-100" : "opacity-0"
                      )} 
                    />
                  ))}
                </div>
              ) : null}
              <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
              
              <div className="relative z-10 space-y-2.5 max-w-xs">
                <h2 className="text-base font-black text-white leading-tight">{bannerTitle}</h2>
                <p className="text-[9.5px] font-semibold text-zinc-200 leading-normal">{bannerSubtitle}</p>
                <button 
                  onClick={handleBannerButtonClick}
                  className="px-4 py-2 rounded-lg text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm active:scale-95 transition-all select-none border-0 cursor-pointer"
                  style={{ backgroundColor: colors.secundario }}
                >
                  <span>{bannerButton.text}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile indicators */}
              {bannerUrls.length > 1 && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {bannerUrls.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all border-0 p-0 cursor-pointer",
                        idx === currentBannerIdx ? "bg-white w-3.5" : "bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

{/* Barra de Beneficios (Mobile) */}
          {activeNavTab === 'Inicio' && sections.beneficios && benefits?.items?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-3 border border-zinc-150 shrink-0">
              {benefits.items.map((item, idx: number) => {
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

          {/* Categorías Visuales (Mobile) */}
          {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && sections.visualCategories && visualCategories?.length > 0 && (
            <div className="space-y-2.5 shrink-0 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Categorías</h3>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
                {visualCategories.map((catItem, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedCategory(catItem.category)}
                    className={cn(
                      "bg-white border rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer shrink-0 transition-all",
                      selectedCategory === catItem.category ? "border-emerald-600 ring-2 ring-emerald-500/10" : "border-zinc-150"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                      {catItem.imageUrl ? (
                        <img src={catItem.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Tag className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-zinc-800 tracking-tight leading-tight pr-1.5">{catItem.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bento Grid Highlights (Mobile) */}
          {activeNavTab === 'Inicio' && sections.bentoHighlights && bentoHighlights?.items?.length > 0 && (
            <div className="space-y-2.5 shrink-0 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{bentoHighlights.title}</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {bentoHighlights.items.map((item, idx: number) => (
                  <div key={idx} className="bg-white border border-zinc-150 rounded-xl p-3 flex items-center gap-3 shadow-none">
                    <span className="text-xl shrink-0 select-none">{item.emoji || '✨'}</span>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-zinc-900 leading-none">{item.title}</h4>
                      <p className="text-[9px] font-semibold text-zinc-500 mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Barra de Búsqueda Móvil con botón Sliders */}
          {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
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
          )}

          {/* Toggles Cuadrícula / Lista en Móvil */}
          {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
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
          )}

          {/* Sección Más Productos (Cuadrícula vertical) */}
          {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
            <div className="space-y-3.5 pb-12">
              <h3 className="text-sm font-black text-zinc-900 tracking-tight text-left">
                {activeNavTab === 'Inicio' ? 'Nuestros Lanzamientos' : 'Productos Encontrados'}
              </h3>
              
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
          )}

          {/* Accordion Specs (Mobile) */}
          {activeNavTab === 'Inicio' && sections.accordionSpecs && accordionSpecs?.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-zinc-150 shrink-0 text-left pb-2">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Especificaciones</h3>
              <div className="space-y-2">
                {accordionSpecs.map((tab, idx: number) => (
                  <details key={idx} className="group border border-zinc-150 rounded-xl bg-white overflow-hidden" open={idx === 0}>
                    <summary className="w-full px-4 py-3 flex items-center justify-between font-bold text-xs bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-900 list-none [&::-webkit-details-marker]:hidden">
                      <span>{tab.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-4 py-3 border-t border-zinc-150 text-[11px] font-semibold leading-relaxed text-zinc-600 whitespace-pre-wrap">
                      {tab.content}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* 3-Column Ingredients Storytelling (Mobile) */}
          {activeNavTab === 'Inicio' && sections.ingredientsSection && ingredientsSection && (
            <div className="space-y-4 pt-4 border-t border-zinc-150 shrink-0 text-center select-none bg-white p-4 rounded-2xl border border-zinc-150 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">{ingredientsSection.title}</h3>
              <div className="flex justify-center my-3">
                <img 
                  src={ingredientsSection.centerImageUrl} 
                  alt="Ingredients" 
                  className="max-h-[140px] object-contain" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[11px] text-zinc-900 leading-snug">{ingredientsSection.leftTitle}</h4>
                  <p className="text-[9px] font-semibold text-zinc-500 leading-normal">{ingredientsSection.leftDesc}</p>
                </div>
                <div className="space-y-1 border-l border-zinc-150 pl-4">
                  <h4 className="font-extrabold text-[11px] text-zinc-900 leading-snug">{ingredientsSection.rightTitle}</h4>
                  <p className="text-[9px] font-semibold text-zinc-500 leading-normal">{ingredientsSection.rightDesc}</p>
                </div>
              </div>
            </div>
          )}

          {/* Brand Story (Mobile) */}
          {activeNavTab === 'Inicio' && sections.brandStory && brandStory && (
            <div id="brand-story-section-mobile" className="w-full shrink-0 select-none rounded-2xl overflow-hidden relative">
              <div className="relative h-[200px] w-full bg-zinc-900 flex items-center justify-center text-center p-6">
                {brandStory.bgUrl && (
                  <img src={brandStory.bgUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-35 z-0" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10 z-0" />
                <div className="relative z-10 space-y-3 text-white">
                  <h2 className="text-xs font-black tracking-tight">{brandStory.title}</h2>
                  <p className="text-[9px] font-semibold text-zinc-200 leading-normal">{brandStory.desc}</p>
                  {brandStory.btnText && (
                    <button
                      onClick={() => {
                        if (brandStory.btnLink) window.open(brandStory.btnLink, '_blank')
                      }}
                      className="px-4 py-1.5 rounded-lg font-bold text-[9px] border-0 cursor-pointer shadow-md"
                      style={{ backgroundColor: colors.primario, color: '#FFFFFF' }}
                    >
                      {brandStory.btnText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Proceso Timeline (Mobile) */}
          {activeNavTab === 'Inicio' && sections.processTimeline && processTimeline?.items?.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-zinc-150 shrink-0 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{processTimeline.title}</h3>
              <div className="space-y-3">
                {processTimeline.items.map((stepItem, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start bg-white p-2.5 border border-zinc-100 rounded-xl">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                      style={{ backgroundColor: `${colors.primario}12`, color: colors.primario }}
                    >
                      {stepItem.step}
                    </div>
                    <div className="space-y-0.5 leading-none">
                      <h4 className="font-extrabold text-[11px] text-zinc-900 leading-snug">{stepItem.title}</h4>
                      <p className="text-[9px] font-semibold text-zinc-500 mt-1 leading-normal">{stepItem.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Gallery (Mobile) */}
          {activeNavTab === 'Inicio' && sections.lifestyleGallery && lifestyleGallery?.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-zinc-150 shrink-0 text-left">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Estilo de Vida</h3>
              <div className="grid grid-cols-2 gap-2">
                {lifestyleGallery.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/50">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Banner Widget (Mobile) */}
          {activeNavTab === 'Inicio' && sections.newsletterWidget && newsletterWidget && (
            <div className="w-full shrink-0 select-none rounded-2xl overflow-hidden mt-4">
              <div 
                className="p-6 text-center flex flex-col items-center justify-center space-y-3"
                style={{ backgroundColor: newsletterWidget.bgColor, color: newsletterWidget.textColor }}
              >
                <div className="space-y-1">
                  <h2 className="text-sm font-black tracking-tight">{newsletterWidget.title}</h2>
                  <p className="text-[9px] opacity-85 leading-relaxed font-semibold">{newsletterWidget.subtitle}</p>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    toast.success("¡Te has unido al club correctamente! 🎁 Recibirás noticias pronto.")
                  }}
                  className="flex flex-col gap-2 w-full pt-1"
                >
                  <input 
                    type="email"
                    required
                    placeholder={newsletterWidget.placeholder}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[10px] font-semibold text-white outline-none focus:border-white focus:bg-white/15 placeholder:text-white/35"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer border-0 shadow-sm"
                  >
                    {newsletterWidget.btnText}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* DEDICATED ABOUT PAGE VIEW (MOBILE)        */}
          {/* ========================================== */}
          {activeNavTab === 'Historia' && (
            <div className="space-y-8 select-none text-left animate-in fade-in duration-500 pb-12">
              {/* Page Header */}
              <div className="space-y-2 text-center pb-2 border-b border-zinc-150">
                <span className="text-[9px] font-bold tracking-widest text-[#C5A880] uppercase block">Nuestra Trayectoria</span>
                <h2 className="text-xl font-black text-zinc-905 tracking-tight leading-none">Perfil de la Empresa</h2>
                <div className="w-10 h-0.5 bg-[#C5A880] mx-auto rounded-full mt-1.5" />
              </div>

              {/* Narrative */}
              <div className="space-y-4">
                <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
                  Fundada en <strong>1992</strong> por el visionario <em>Fawaz Masri</em>, Chocodate nació con la misión de fusionar el dátil de Arabia con el auténtico chocolate belga.
                </p>
                <div className="rounded-2xl overflow-hidden shadow-sm h-48 border border-zinc-150">
                  <img src="https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=800&auto=format&fit=crop" alt="Heritage" className="w-full h-full object-cover" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                  Al combinar el dulzor de los dátiles cosechados a mano con el toque crujiente de una almendra tostada en su interior y bañarlo en chocolate premium, creamos una experiencia gourmet única.
                </p>
              </div>

              {/* Two Pillars */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-905 tracking-tight uppercase">Instalaciones</h3>
                <div className="space-y-3">
                  <div className="bg-white border border-zinc-150 rounded-xl p-4 space-y-2">
                    <h4 className="font-extrabold text-xs text-[#4A2E1B]">La Ronda (Dubái, EAU)</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">Procesamiento higiénico del chocolate belga y dátil con certificaciones ISO 22000 y Halal.</p>
                  </div>
                  <div className="bg-white border border-zinc-150 rounded-xl p-4 space-y-2">
                    <h4 className="font-extrabold text-xs text-[#C5A880]">Star Foods (KSA)</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">Ubicada en Arabia Saudita, asegura el suministro y la selección de la mejor cosecha local.</p>
                  </div>
                </div>
              </div>

              {/* Leadership */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-905 tracking-tight uppercase">Liderazgo</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Fawaz Al-Masri', role: 'CEO', icon: '👨‍💼' },
                    { name: 'Razan Al-Masri', role: 'CBDO', icon: '👩‍💼' },
                    { name: 'Omar Al-Masri', role: 'COO', icon: '👨‍💻' },
                    { name: 'Hazem Al-Masri', role: 'Gerente', icon: '👨‍🔧' }
                  ].map((member, idx) => (
                    <div key={idx} className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 text-center space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200/50 flex items-center justify-center text-lg mx-auto shadow-sm">{member.icon}</div>
                      <div>
                        <span className="font-extrabold text-[10px] text-zinc-900 block leading-tight">{member.name}</span>
                        <span className="text-[8px] font-bold text-zinc-400 block mt-0.5 uppercase tracking-wide">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-905 tracking-tight uppercase">Valores</h3>
                <div className="space-y-2.5">
                  {[
                    { title: 'Pasión & Razón', desc: 'Repostería fina y control de calidad científico.' },
                    { title: 'Tradición & Modernidad', desc: 'Dátil árabe de herencia empacado con robótica.' },
                    { title: 'Familia & Comunidad', desc: 'Apoyo constante a los agricultores de la región.' }
                  ].map((val, idx) => (
                    <div key={idx} className="p-3.5 border border-zinc-150 rounded-xl bg-white space-y-1 text-left">
                      <h4 className="font-extrabold text-[11px] text-[#4A2E1B]">{val.title}</h4>
                      <p className="text-[10px] text-zinc-500 leading-normal font-semibold">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Premium Footer (Mobile) */}
          {(activeNavTab === 'Inicio' || activeNavTab === 'Productos') && (
                        <footer className="pt-8 border-t border-zinc-150 shrink-0 text-left pb-16 select-none">
              <div className="space-y-4">
                <span className="font-black text-sm text-zinc-900 uppercase tracking-wider">{formattedStoreName}</span>
                
                {socialsShowInCatalog && (
                  <div className="flex gap-3 text-zinc-400">
                    {store.aiSettings?.socials?.instagram && (
                      <a href={store.aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Instagram">
                        <InstagramIcon />
                      </a>
                    )}
                    {store.aiSettings?.socials?.facebook && (
                      <a href={store.aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Facebook">
                        <FacebookIcon />
                      </a>
                    )}
                    {store.aiSettings?.socials?.twitter && (
                      <a href={store.aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Twitter / X">
                        <TwitterIcon />
                      </a>
                    )}
                    {store.aiSettings?.socials?.tiktok && (
                      <a href={store.aiSettings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="TikTok">
                        <TikTokIcon />
                      </a>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                  © {new Date().getFullYear()} {formattedStoreName}. Todos los derechos reservados.
                </p>
                <div className="flex gap-2 items-center">
                  <div className="bg-white px-2 py-0.5 rounded border border-zinc-200/80 flex items-center justify-center h-5.5 shadow-xs">
                    <SiVisa className="h-3.5 w-auto text-[#1A1F71]" style={{ minWidth: '18px' }} />
                  </div>
                  <div className="bg-white px-2 py-0.5 rounded border border-zinc-200/80 flex items-center justify-center h-5.5 shadow-xs">
                    <SiMastercard className="h-3.5 w-auto text-[#EB001B]" style={{ minWidth: '18px' }} />
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded flex items-center justify-center gap-1 h-5.5 text-[8px] font-bold shadow-xs">
                    <Truck className="w-2.5 h-2.5" />
                    <span>Contra Entrega</span>
                  </div>
                </div>
              </div>
            </footer>
          )}

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
              
              {/* Progreso Envío Gratis (Chocodate Style) */}
              {freeShipping.enabled && cartProducts.length > 0 && (() => {
                const threshold = freeShipping.threshold || 100000
                const difference = threshold - total
                const isFree = difference <= 0
                const percent = Math.min((total / threshold) * 100, 100)
                return (
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 space-y-2 text-left select-none animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🚚</span>
                      <p className="text-[10px] font-bold text-zinc-700 leading-snug">
                        {isFree ? (
                          <span className="text-emerald-700 font-black">¡Felicidades! Tienes envío gratis.</span>
                        ) : (
                          <>Estás a <span className="font-extrabold text-emerald-600">${difference.toLocaleString('es-CO')}</span> de obtener envío gratis.</>
                        )}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })()}

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
                  const parsedOpts = normalizeProductOptions(selectedProduct.options)
                  if (parsedOpts.length === 0) return null
                  return (
                    <div className="space-y-4 pt-1">
                      {parsedOpts.map((opt) => {
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

              {/* Dynamic Navbar Links (Mobile menu) */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Navegación</h4>
                <div className="space-y-1">
                  {navbarLinks.map((item, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleNavbarLinkClick(item)
                      }}
                      className="w-full flex items-center gap-2 py-2 px-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 rounded-lg text-left cursor-pointer border-0 bg-transparent"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}
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
              {socialsShowInCatalog && (store.aiSettings?.socials?.instagram || store.aiSettings?.socials?.facebook || store.aiSettings?.socials?.twitter || store.aiSettings?.socials?.tiktok) && (
                <div className="space-y-2 pt-4 border-t border-zinc-100 text-left">
                  <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider">Redes sociales</h4>
                  <div className="flex gap-2 px-1">
                    {store.aiSettings.socials.instagram && (
                      <a href={store.aiSettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="Instagram">
                        <InstagramIcon />
                      </a>
                    )}
                    {store.aiSettings.socials.facebook && (
                      <a href={store.aiSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="Facebook">
                        <FacebookIcon />
                      </a>
                    )}
                    {store.aiSettings.socials.twitter && (
                      <a href={store.aiSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="Twitter / X">
                        <TwitterIcon />
                      </a>
                    )}
                    {store.aiSettings.socials.tiktok && (
                      <a href={store.aiSettings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all active:scale-90" title="TikTok">
                        <TikTokIcon />
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
                    onClick={() => setSortBy(opt.value as CatalogSort)}
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
