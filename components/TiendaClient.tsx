'use client'

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { 
  Store, 
  Upload, 
  Trash2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Power, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Truck, 
  Shield, 
  Award, 
  Clock, 
  FileText, 
  ChevronDown, 
  Save,
  MessageSquare,
  Menu,
  Type
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { PublicCheckoutStore } from '@/lib/checkout/types'

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string | null
  stock: number
}

type TiendaSettings = {
  colors?: {
    primario?: string
    secundario?: string
    acento?: string
    fondo?: string
    texto?: string
  }
  sections?: Record<string, boolean | undefined>
  bentoHighlights?: {
    title?: string
    items?: Array<{ emoji: string; title: string; desc: string }>
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
  navbarLinks?: Array<{ label: string; action: 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link'; link: string }>
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
  brandStoryPage?: {
    headerTrayectoria?: string
    headerPerfil?: string
    narrativeP1?: string
    narrativeP2?: string
    imageHeritage?: string
    pillarsTitle?: string
    pillar1Icon?: string
    pillar1Title?: string
    pillar1Desc?: string
    pillar2Icon?: string
    pillar2Title?: string
    pillar2Desc?: string
    leadership?: Array<{ name: string; role: string; icon: string }>
    values?: Array<{ title: string; desc: string }>
  }
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
    items?: Array<{ icon: 'Truck' | 'ShieldCheck' | 'Award' | 'Clock' | 'Gift' | 'Star'; label: string; desc: string }>
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
  socials?: {
    instagram?: string
    facebook?: string
    tiktok?: string
    twitter?: string
    web?: string
  }
}

interface TiendaClientProps {
  initialStore: {
    id: string
    name: string
    slug: string
    category: string | null
    whatsapp: string
    bio: string | null
    logoUrl: string | null
    aiSettings: Record<string, unknown>
    active: boolean
  }
  products: Product[]
}

export default function TiendaClient({ initialStore, products }: TiendaClientProps) {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'apariencia' | 'premium' | 'info' | 'dominios' | 'seo' | 'redes' | 'politicas'>('apariencia')
  
  // Device Preview selection
  const [device, setDevice] = useState<'escritorio' | 'tablet' | 'movil'>('escritorio')

  // Prevent double scrollbar by locking the body and html overflow when editor is open
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow
    const origHtmlHeight = document.documentElement.style.height
    const origBodyOverflow = document.body.style.overflow
    const origBodyHeight = document.body.style.height

    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100%'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100%'

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow
      document.documentElement.style.height = origHtmlHeight
      document.body.style.overflow = origBodyOverflow
      document.body.style.height = origBodyHeight
    }
  }, [])

  // Parse initial settings
  const parsedSettings: TiendaSettings = initialStore.aiSettings && typeof initialStore.aiSettings === 'object'
    ? (initialStore.aiSettings as TiendaSettings)
    : {}

  // Color Theme state
  const [colors, setColors] = useState({
    primario: parsedSettings.colors?.primario || '#6F42C1',
    secundario: parsedSettings.colors?.secundario || '#FF7A00',
    acento: parsedSettings.colors?.acento || '#22C55E',
    fondo: parsedSettings.colors?.fondo || '#F8FAFC',
    texto: parsedSettings.colors?.texto || '#1F2937'
  })

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Visible sections toggles matching the screenshot exactly
  const [sections, setSections] = useState({
    banner: parsedSettings.sections?.banner !== false,
    destacados: parsedSettings.sections?.destacados !== false,
    categorias: parsedSettings.sections?.categorias !== false,
    beneficios: parsedSettings.sections?.beneficios !== false,
    testimonios: parsedSettings.sections?.testimonios !== false,
    newsletter: parsedSettings.sections?.newsletter !== false,
    bentoHighlights: parsedSettings.sections?.bentoHighlights === true,
    accordionSpecs: parsedSettings.sections?.accordionSpecs === true,
    brandStory: parsedSettings.sections?.brandStory === true,
    visualCategories: parsedSettings.sections?.visualCategories === true,
    processTimeline: parsedSettings.sections?.processTimeline === true,
    lifestyleGallery: parsedSettings.sections?.lifestyleGallery === true,
    newsletterWidget: parsedSettings.sections?.newsletterWidget === true,
    ingredientsSection: parsedSettings.sections?.ingredientsSection === true
  })

  // Bento Highlights custom items (style Chocodate: Date, Almond, Chocolate...)
  const [bentoHighlights, setBentoHighlights] = useState({
    title: parsedSettings.bentoHighlights?.title || 'Nuestros Ingredientes Premium',
    items: parsedSettings.bentoHighlights?.items || [
      { emoji: 'Ã°Å¸Å’Â´', title: 'DÃƒÂ¡tiles de FaraÃƒÂ³n', desc: 'Dulces, carnosos y naturales' },
      { emoji: 'Ã°Å¸Â¥Å“', title: 'Almendras Tostadas', desc: 'Crujientes y seleccionadas a mano' },
      { emoji: 'Ã°Å¸ÂÂ«', title: 'Chocolate Belga', desc: 'Cobertura suave de cacao puro' }
    ]
  })

  // CategorÃƒÂ­as Visuales (Visual PDP Grid)
  const [visualCategories, setVisualCategories] = useState<Array<{ category: string; imageUrl: string }>>(() => {
    return parsedSettings.visualCategories || [
      { category: 'CafÃƒÂ©', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop' },
      { category: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop' },
      { category: 'Combos', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop' }
    ]
  })

  // Proceso Paso a Paso (Timeline)
  const [processTimeline, setProcessTimeline] = useState({
    title: parsedSettings.processTimeline?.title || 'Ã‚Â¿CÃƒÂ³mo Comprar en Flashcheckouts?',
    items: parsedSettings.processTimeline?.items || [
      { step: '1', title: 'Explora y Agrega', desc: 'Selecciona tus productos favoritos del catÃƒÂ¡logo y agrÃƒÂ©galos al carrito.' },
      { step: '2', title: 'Datos de EnvÃƒÂ­o', desc: 'Ingresa tu direcciÃƒÂ³n de entrega y ubÃƒÂ­cate en el mapa interactivo.' },
      { step: '3', title: 'Completa en WhatsApp', desc: 'Finaliza el pedido enviando el mensaje estructurado de WhatsApp al vendedor.' }
    ]
  })

  // GalerÃƒÂ­a de fotos reales de estilo de vida (Lifestyle)
  const [lifestyleGallery, setLifestyleGallery] = useState<string[]>(() => {
    return parsedSettings.lifestyleGallery || [
      'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop'
    ]
  })

  // Newsletter Widget Premium
  const [newsletterWidget, setNewsletterWidget] = useState({
    title: parsedSettings.newsletterWidget?.title || 'ÃƒÅ¡nete a Nuestro Club Gourmet',
    subtitle: parsedSettings.newsletterWidget?.subtitle || 'EntÃƒÂ©rate antes que nadie de nuestros lanzamientos, descuentos exclusivos y recetas especiales.',
    placeholder: parsedSettings.newsletterWidget?.placeholder || 'Ingresa tu correo electrÃƒÂ³nico',
    btnText: parsedSettings.newsletterWidget?.btnText || 'Suscribirme',
    bgColor: parsedSettings.newsletterWidget?.bgColor || '#111827',
    textColor: parsedSettings.newsletterWidget?.textColor || '#FFFFFF'
  })

  // MenÃƒÂº de navegaciÃƒÂ³n superior (Navbar links)
  const [navbarLinks, setNavbarLinks] = useState<Array<{ label: string; action: 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link'; link: string }>>(() => {
    return parsedSettings.navbarLinks || [
      { label: 'Inicio', action: 'scroll-banner', link: '' },
      { label: 'Productos', action: 'scroll-products', link: '' },
      { label: 'Historia', action: 'scroll-story', link: '' },
      { label: 'Contacto', action: 'whatsapp', link: '' }
    ]
  })

  // Accordion Specs (Ficha tÃƒÂ©cnica, nutricional, etc.)
  const [accordionSpecs, setAccordionSpecs] = useState<Array<{ title: string; content: string }>>(() => {
    return parsedSettings.accordionSpecs?.tabs || [
      { title: 'Ficha Nutricional', content: 'CalorÃƒÂ­as: 140 kcal | Grasas: 4g | Carbohidratos: 22g | ProteÃƒÂ­nas: 2g por porciÃƒÂ³n.' },
      { title: 'MÃƒÂ©todo de EnvÃƒÂ­o', content: 'Empacado con tecnologÃƒÂ­a tÃƒÂ©rmica para conservar el chocolate fresco hasta tu puerta.' }
    ]
  })

  // Brand Story narrative section
  const [brandStory, setBrandStory] = useState({
    title: parsedSettings.brandStory?.title || 'Nuestra Historia de Sabor',
    desc: parsedSettings.brandStory?.desc || 'Fundada con la visiÃƒÂ³n de combinar frutos del desierto y chocolate fino, creamos una experiencia ÃƒÂºnica de confiterÃƒÂ­a artesanal.',
    bgUrl: parsedSettings.brandStory?.bgUrl || 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=800&auto=format&fit=crop',
    btnText: parsedSettings.brandStory?.btnText || 'Saber mÃƒÂ¡s',
    btnLink: parsedSettings.brandStory?.btnLink || ''
  })

  // Brand Story page settings
  const [brandStoryPage, setBrandStoryPage] = useState({
    headerTrayectoria: parsedSettings.brandStoryPage?.headerTrayectoria || 'Nuestra Trayectoria',
    headerPerfil: parsedSettings.brandStoryPage?.headerPerfil || 'Perfil de la Empresa',
    narrativeP1: parsedSettings.brandStoryPage?.narrativeP1 || 'Fundada en 1992 por el visionario Fawaz Masri, Chocodate naciÃƒÂ³ en el corazÃƒÂ³n de los Emiratos ÃƒÂrabes Unidos con una misiÃƒÂ³n singular: elevar la humilde y nutritiva fruta del dÃƒÂ¡til de Arabia a una experiencia de confiterÃƒÂ­a de clase mundial.',
    narrativeP2: parsedSettings.brandStoryPage?.narrativeP2 || 'Al combinar el dulzor natural y la riqueza en fibra de los mejores dÃƒÂ¡tiles seleccionados a mano con el crujido de una almendra tostada en su interior, y envolverlo todo en una generosa capa de chocolate belga prÃƒÂ©mium, creamos una golosina ÃƒÂºnica que trasciende fronteras. Hoy en dÃƒÂ­a, nuestros productos se disfrutan en mÃƒÂ¡s de 50 paÃƒÂ­ses alrededor del mundo.',
    imageHeritage: parsedSettings.brandStoryPage?.imageHeritage || 'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=800&auto=format&fit=crop',
    pillarsTitle: parsedSettings.brandStoryPage?.pillarsTitle || 'Nuestras Dos Grandes Columnas',
    pillar1Icon: parsedSettings.brandStoryPage?.pillar1Icon || 'Ã°Å¸ÂÂ­',
    pillar1Title: parsedSettings.brandStoryPage?.pillar1Title || 'FÃƒÂ¡brica La Ronda (DubÃƒÂ¡i, EAU)',
    pillar1Desc: parsedSettings.brandStoryPage?.pillar1Desc || 'Nuestra planta principal con tecnologÃƒÂ­a de punta dedicada exclusivamente al procesamiento de dÃƒÂ¡tiles frescos, tostado de almendras y la formulaciÃƒÂ³n del chocolate belga. Cumple con las mÃƒÂ¡s estrictas certificaciones internacionales de calidad alimentaria (HACCP, ISO 22000 y Halal).',
    pillar2Icon: parsedSettings.brandStoryPage?.pillar2Icon || 'Ã°Å¸Å’Â´',
    pillar2Title: parsedSettings.brandStoryPage?.pillar2Title || 'Star Foods (KSA)',
    pillar2Desc: parsedSettings.brandStoryPage?.pillar2Desc || 'Nuestra sucursal agrÃƒÂ­cola y de procesamiento ubicada en Arabia Saudita, encargada de la recolecciÃƒÂ³n y selecciÃƒÂ³n de los dÃƒÂ¡tiles en su momento justo de maduraciÃƒÂ³n, garantizando una cadena de suministro sostenible y local.',
    leadership: parsedSettings.brandStoryPage?.leadership || [
      { name: 'Fawaz Al-Masri', role: 'Fundador & CEO', icon: 'Ã°Å¸â€˜Â¨Ã¢â‚¬ÂÃ°Å¸â€™Â¼' },
      { name: 'Razan Al-Masri', role: 'Directora de Desarrollo (CBDO)', icon: 'Ã°Å¸â€˜Â©Ã¢â‚¬ÂÃ°Å¸â€™Â¼' },
      { name: 'Omar Al-Masri', role: 'Director de Operaciones (COO)', icon: 'Ã°Å¸â€˜Â¨Ã¢â‚¬ÂÃ°Å¸â€™Â»' },
      { name: 'Hazem Al-Masri', role: 'Gerente General', icon: 'Ã°Å¸â€˜Â¨Ã¢â‚¬ÂÃ°Å¸â€Â§' }
    ],
    values: parsedSettings.brandStoryPage?.values || [
      { title: 'RazÃƒÂ³n & PasiÃƒÂ³n', desc: 'Equilibramos la toma de decisiones basada en datos cientÃƒÂ­ficos con la pasiÃƒÂ³n por la reposterÃƒÂ­a fina.' },
      { title: 'TradiciÃƒÂ³n & Modernidad', desc: 'Respetamos el legado histÃƒÂ³rico del dÃƒÂ¡til del desierto mientras aplicamos tecnologÃƒÂ­a de punta en empaque y producciÃƒÂ³n.' },
      { title: 'Familia & Comunidad', desc: 'Operamos como una empresa familiar que apoya a los agricultores locales y cuida de sus empleados.' }
    ]
  })

  // Logo & Banner State
  const [logoUrl, setLogoUrl] = useState<string>(initialStore.logoUrl || '')
  const [bannerUrl, setBannerUrl] = useState<string>(
    parsedSettings.bannerUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop'
  )
  const [bannerTitle, setBannerTitle] = useState(
    parsedSettings.bannerTitle || 'El mejor cafÃƒÂ©, directo a tu puerta'
  )
  const [bannerSubtitle, setBannerSubtitle] = useState(
    parsedSettings.bannerSubtitle || 'Descubre nuestros productos de especialidad cultivados con amor y tostados frescos.'
  )

  // Hero Banner type and video URL (Chocodate Style)
  const [heroType, setHeroType] = useState<'image' | 'video'>(parsedSettings.heroType || 'image')
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>(
    parsedSettings.heroVideoUrl || 'https://www.chocodate.com/assets/video/hero.mp4'
  )

  // 3-Column Ingredients section state (Chocodate Style)
  const [ingredientsSection, setIngredientsSection] = useState({
    title: parsedSettings.ingredientsSection?.title || 'Nuestros Ingredientes Premium',
    leftTitle: parsedSettings.ingredientsSection?.leftTitle || 'DÃƒÂ¡tiles de FaraÃƒÂ³n',
    leftDesc: parsedSettings.ingredientsSection?.leftDesc || 'Dulces, carnosos, naturales y recolectados en su punto de madurez.',
    centerImageUrl: parsedSettings.ingredientsSection?.centerImageUrl || 'https://www.chocodate.com/assets/img/central-product.png',
    rightTitle: parsedSettings.ingredientsSection?.rightTitle || 'Chocolate Belga Puro',
    rightDesc: parsedSettings.ingredientsSection?.rightDesc || 'Exquisita cobertura de chocolate de primera calidad con textura suave.'
  })

  // Free Shipping configuration (Chocodate Style)
  const [freeShipping, setFreeShipping] = useState({
    enabled: parsedSettings.freeShipping?.enabled || false,
    threshold: parsedSettings.freeShipping?.threshold || 100000
  })

  // Announcement Bar state
  const [announcement, setAnnouncement] = useState({
    enabled: parsedSettings.announcement?.enabled || false,
    text: parsedSettings.announcement?.text || 'Ã°Å¸Å¡Å¡ Ã‚Â¡EnvÃƒÂ­os gratis por compras superiores a $100.000!',
    bgColor: parsedSettings.announcement?.bgColor || '#059669',
    textColor: parsedSettings.announcement?.textColor || '#FFFFFF'
  })

  // Banner Button state
  const [bannerButton, setBannerButton] = useState({
    text: parsedSettings.bannerButton?.text || 'Ver productos',
    action: parsedSettings.bannerButton?.action || 'scroll',
    link: parsedSettings.bannerButton?.link || ''
  })

  // Benefits Custom items
  const [benefits, setBenefits] = useState({
    items: parsedSettings.benefits?.items || [
      { icon: 'Truck', label: 'EnvÃƒÂ­os rÃƒÂ¡pidos', desc: 'A todo el paÃƒÂ­s' },
      { icon: 'ShieldCheck', label: 'Pagos seguros', desc: 'MÃƒÂºltiples mÃƒÂ©todos' },
      { icon: 'Award', label: 'CafÃƒÂ© de calidad', desc: 'Granos seleccionados' },
      { icon: 'Clock', label: 'AtenciÃƒÂ³n 24/7', desc: 'Siempre disponibles' }
    ]
  })

  // Social Links display config
  const [socialsShowInCatalog, setSocialsShowInCatalog] = useState(
    parsedSettings.socialsShowInCatalog !== false
  )

  // Opening Hours schedule
  const [schedule, setSchedule] = useState({
    enabled: parsedSettings.schedule?.enabled || false,
    text: parsedSettings.schedule?.text || 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: parsedSettings.schedule?.alwaysOpen !== false
  })

  // Custom WhatsApp message template
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    parsedSettings.whatsappTemplate || 
    'Hola! Vengo de tu tienda online y quiero realizar el siguiente pedido:\n\n*Productos:*\n{lista_productos}\n\n*Total:* {monto_total}\n\n*Datos de entrega:*\nNombre: {cliente_nombre}\nDirecciÃƒÂ³n: {direccion}'
  )
  
  // Typography State
  const [typography, setTypography] = useState(parsedSettings.typography || 'Inter')

  // Copied link state
  const [copied, setCopied] = useState(false)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // Store active state (from DB)
  const [storeActive, setStoreActive] = useState(initialStore.active)

  // Settings states for tabs
  const [storeInfo, setStoreInfo] = useState({
    name: initialStore.name,
    desc: initialStore.bio || '',
    whatsapp: initialStore.whatsapp,
    category: initialStore.category || 'General',
    address: parsedSettings.info?.address || ''
  })

  const [domains, setDomains] = useState({
    subdomain: initialStore.slug,
    customDomain: parsedSettings.domains?.customDomain || ''
  })

  const [seo, setSeo] = useState({
    title: parsedSettings.seo?.title || `${initialStore.name} | CatÃƒÂ¡logo`,
    desc: parsedSettings.seo?.desc || `Compra online y haz tu pedido por WhatsApp.`
  })

  const [socials, setSocials] = useState({
    instagram: parsedSettings.socials?.instagram || '',
    facebook: parsedSettings.socials?.facebook || '',
    twitter: parsedSettings.socials?.twitter || ''
  })

  const [policies, setPolicies] = useState({
    terms: parsedSettings.policies?.terms || '',
    refunds: parsedSettings.policies?.refunds || ''
  })

  const previewStore: PublicCheckoutStore = {
    ...initialStore,
    name: storeInfo.name,
    whatsapp: storeInfo.whatsapp,
    logoUrl: logoUrl || null,
    bio: storeInfo.desc,
    products,
    cardPaymentsEnabled: true,
    aiSettings: {
      colors,
      sections,
      bannerUrl,
      bannerTitle,
      bannerSubtitle,
      announcement,
      bannerButton,
      benefits,
      socialsShowInCatalog,
      schedule,
      whatsappTemplate,
      socials,
      policies,
      typography,
      info: {
        address: storeInfo.address,
      },
      bentoHighlights,
      accordionSpecs: {
        tabs: accordionSpecs,
      },
      brandStory,
      brandStoryPage,
      visualCategories,
      processTimeline,
      lifestyleGallery,
      newsletterWidget,
      navbarLinks,
      heroType,
      heroVideoUrl,
      ingredientsSection,
      freeShipping,
    },
    bannerUrl: bannerUrl || null,
  }

  const isImageUrl = (url: string) => {
    return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = toast.loading(`Subiendo ${type === 'logo' ? 'logotipo' : 'banner'}...`)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await res.json()
      
      if (type === 'logo') {
        setLogoUrl(data.url)
        toast.success('Logotipo subido correctamente', { id: toastId })
      } else {
        setBannerUrl(data.url)
        toast.success('Banner subido correctamente', { id: toastId })
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Error al subir la imagen', { id: toastId })
    }
  }

  const copyStoreUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://flashcheckout.co'
    navigator.clipboard.writeText(`${base}/tienda/${domains.subdomain}`)
    setCopied(true)
    toast.success('Enlace de la tienda copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  // Toggle visible sections
  const handleSectionToggle = (key: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Persist all settings in Database
  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeInfo.name,
          whatsapp: storeInfo.whatsapp,
          bio: storeInfo.desc,
          category: storeInfo.category,
          logoUrl: logoUrl || null,
          slug: domains.subdomain,
          active: storeActive,
          aiSettings: {
            colors,
            typography,
            bannerUrl,
            bannerTitle,
            bannerSubtitle,
            announcement,
            bannerButton,
            benefits,
            socialsShowInCatalog,
            schedule,
            whatsappTemplate,
            sections,
            socials,
            policies,
            seo,
            domains: {
              customDomain: domains.customDomain
            },
            info: {
              address: storeInfo.address
            },
             bentoHighlights,
             accordionSpecs: {
               tabs: accordionSpecs
             },
             brandStory,
             brandStoryPage,
             visualCategories,
             processTimeline,
             lifestyleGallery,
             newsletterWidget,
             navbarLinks,
             heroType,
             heroVideoUrl,
             ingredientsSection,
             freeShipping
           }
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al guardar los cambios')
      }

      toast.success('Ã‚Â¡Cambios guardados con ÃƒÂ©xito!', {
        description: 'La configuraciÃƒÂ³n y diseÃƒÂ±o de tu tienda online han sido guardados.'
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'OcurriÃƒÂ³ un error al guardar los ajustes.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle store state toggle
  const toggleStoreStatus = async () => {
    const newStatus = !storeActive
    setStoreActive(newStatus)
    toast.info(newStatus ? 'Tienda activada' : 'Tienda desactivada temporalmente')
  }

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-130px)] min-h-[500px] flex flex-col overflow-hidden animate-in duration-300 font-sans text-left pb-2">
      
      {/* Header Panel matching screenshot */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none pb-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tienda
            </h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Personaliza la apariencia de tu tienda online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/tienda/${domains.subdomain}`} target="_blank">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none cursor-pointer select-none">
              <span>Vista previa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
          
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-350 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none active:scale-[0.98] cursor-pointer select-none"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </header>

      {/* Tabs navigation list */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6 select-none">
        {[
          { id: 'apariencia', label: 'Apariencia' },
          { id: 'premium', label: 'Secciones Premium (PDP)' },
          { id: 'info', label: 'InformaciÃƒÂ³n de la tienda' },
          { id: 'dominios', label: 'Dominios' },
          { id: 'seo', label: 'SEO' },
          { id: 'redes', label: 'Redes sociales' },
          { id: 'politicas', label: 'PolÃƒÂ­ticas' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-800' 
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch overflow-hidden mt-6">
        
        {/* LEFT COLUMN: Customized Widgets based on selected tab (4/12) */}
        <div className="lg:col-span-4 h-full overflow-y-auto pr-1 pb-20 select-none space-y-6">
          
          {/* TAB 1: APARIENCIA */}
          {activeTab === 'apariencia' && (
            <div className="space-y-6">
              
              {/* Logo Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <input 
                  type="file" 
                  id="logo-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'logo')} 
                />
                <input 
                  type="file" 
                  id="banner-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'banner')} 
                />

                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Logo de la tienda</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Este logo se mostrarÃƒÂ¡ en tu tienda online y enlaces de pago.</p>
                </div>

                <div className="border border-zinc-150 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-50/30 min-h-[96px]">
                  {logoUrl ? (
                    isImageUrl(logoUrl) ? (
                      <img src={logoUrl} className="max-h-16 max-w-full object-contain" alt="Logo" />
                    ) : (
                      <div className="text-sm font-black text-zinc-900 border border-zinc-200 px-4 py-2 rounded bg-white tracking-wider flex items-center gap-1.5">
                        <span>Ã¢Ëœâ€¢</span>
                        <span>{logoUrl.toUpperCase()}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">Sin logotipo configurado</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Cambiar logo</span>
                  </button>
                  <button 
                    onClick={() => setLogoUrl('')}
                    className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    title="Eliminar logo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Banner Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Banner principal</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Imagen o Video loop destacado en la portada de tu tienda.</p>
                </div>

                {/* Banner Type Selection */}
                <div className="grid grid-cols-2 gap-2 pb-2">
                  <button
                    type="button"
                    onClick={() => setHeroType('image')}
                    className={cn(
                      "py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer",
                      heroType === 'image' 
                        ? "bg-zinc-950 border-zinc-950 text-white" 
                        : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
                    )}
                  >
                    Imagen de Fondo
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroType('video')}
                    className={cn(
                      "py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer",
                      heroType === 'video' 
                        ? "bg-zinc-950 border-zinc-950 text-white" 
                        : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
                    )}
                  >
                    Video Loop
                  </button>
                </div>

                {heroType === 'video' ? (
                  <div className="space-y-2.5">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL de Video (MP4)</label>
                      <input 
                        type="text"
                        value={heroVideoUrl}
                        onChange={e => setHeroVideoUrl(e.target.value)}
                        placeholder="Ej: https://mi-servidor.com/mi-video.mp4"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="border border-zinc-150 rounded-lg overflow-hidden h-28 relative bg-zinc-100 flex items-center justify-center">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">Sin banner principal</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Cambiar banner</span>
                  </button>
                  <button 
                    onClick={() => setBannerUrl('')}
                    className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    title="Eliminar banner"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Eliminar</span>
                  </button>
                </div>

                {/* Banner Texts Inputs */}
                <div className="space-y-3.5 pt-2 border-t border-zinc-100 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo del banner</label>
                    <input 
                      type="text"
                      value={bannerTitle}
                      onChange={e => setBannerTitle(e.target.value)}
                      placeholder="Ej: El mejor cafÃƒÂ©, directo a tu puerta"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">DescripciÃƒÂ³n del banner</label>
                    <textarea 
                      value={bannerSubtitle}
                      onChange={e => setBannerSubtitle(e.target.value)}
                      placeholder="Ej: Descubre nuestros productos de especialidad cultivados con amor."
                      rows={2}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none"
                    />
                  </div>

                  {/* Banner Button Customization */}
                  <div className="space-y-3 pt-2.5 border-t border-zinc-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Texto del botÃƒÂ³n</label>
                      <input 
                        type="text"
                        value={bannerButton.text}
                        onChange={e => setBannerButton(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ej: Ver productos"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AcciÃƒÂ³n del botÃƒÂ³n</label>
                      <select 
                        value={bannerButton.action}
                        onChange={e => setBannerButton(prev => ({ ...prev, action: e.target.value as 'scroll' | 'whatsapp' | 'link' }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      >
                        <option value="scroll">Hacer scroll a los productos</option>
                        <option value="whatsapp">Abrir chat de WhatsApp</option>
                        <option value="link">Redirigir a enlace externo</option>
                      </select>
                    </div>

                    {bannerButton.action === 'link' && (
                      <div className="space-y-1.5 animate-in fade-in duration-300">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Enlace del botÃƒÂ³n</label>
                        <input 
                          type="text"
                          value={bannerButton.link}
                          onChange={e => setBannerButton(prev => ({ ...prev, link: e.target.value }))}
                          placeholder="Ej: https://instagram.com/mi-tienda"
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Announcement Bar Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Barra de anuncios</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Franja llamativa sobre el encabezado de tu tienda.</p>
                  </div>
                  <button
                    onClick={() => setAnnouncement(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      announcement.enabled ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {announcement.enabled && (
                  <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Texto del anuncio</label>
                      <input 
                        type="text"
                        value={announcement.text}
                        onChange={e => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ej: Ã‚Â¡EnvÃƒÂ­os gratis por compras superiores a $100.000!"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-tight select-none pt-1">
                      <div className="space-y-1.5 flex flex-col items-center">
                        <input 
                          type="color" 
                          value={announcement.bgColor}
                          onChange={e => setAnnouncement(prev => ({ ...prev, bgColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                        />
                        <span>Fondo</span>
                      </div>

                      <div className="space-y-1.5 flex flex-col items-center">
                        <input 
                          type="color" 
                          value={announcement.textColor}
                          onChange={e => setAnnouncement(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                        />
                        <span>Texto</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits Editor Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Beneficios</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Personaliza los 4 cuadros de beneficios que flotan en tu portada.</p>
                </div>

                <div className="space-y-4 pt-1 text-left">
                  {benefits.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Beneficio #{idx + 1}</span>
                      
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                          <select
                            value={item.icon}
                            onChange={e => {
                              const newItems = [...benefits.items]
                              newItems[idx] = { ...item, icon: e.target.value }
                              setBenefits({ items: newItems })
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-1.5 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                          >
                            <option value="Truck">CamiÃƒÂ³n</option>
                            <option value="ShieldCheck">Escudo</option>
                            <option value="Award">Medalla</option>
                            <option value="Clock">Reloj</option>
                            <option value="Gift">Regalo</option>
                            <option value="Star">Estrella</option>
                          </select>
                        </div>

                        <div className="col-span-8 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={item.label}
                            onChange={e => {
                              const newItems = [...benefits.items]
                              newItems[idx] = { ...item, label: e.target.value }
                              setBenefits({ items: newItems })
                            }}
                            placeholder="Ej: EnvÃƒÂ­os rÃƒÂ¡pidos"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block">SubtÃƒÂ­tulo / Bajada</label>
                        <input 
                          type="text"
                          value={item.desc}
                          onChange={e => {
                            const newItems = [...benefits.items]
                            newItems[idx] = { ...item, desc: e.target.value }
                            setBenefits({ items: newItems })
                          }}
                          placeholder="Ej: A todo el paÃƒÂ­s"
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Colors Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Colores del tema</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Personaliza los colores principales de tu tienda.</p>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-tight select-none">
                  {/* Primario */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.primario}
                      onChange={e => handleColorChange('primario', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Primario</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.primario}</span>
                  </div>

                  {/* Secundario */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.secundario}
                      onChange={e => handleColorChange('secundario', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Secundario</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.secundario}</span>
                  </div>

                  {/* Acento */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.acento}
                      onChange={e => handleColorChange('acento', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Acento</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.acento}</span>
                  </div>

                  {/* Fondo */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.fondo}
                      onChange={e => handleColorChange('fondo', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Fondo</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.fondo}</span>
                  </div>

                  {/* Texto */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.texto}
                      onChange={e => handleColorChange('texto', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Texto</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.texto}</span>
                  </div>
                </div>
              </div>

              {/* Typography Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">TipografÃƒÂ­a</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Selecciona la tipografÃƒÂ­a de tu tienda.</p>
                </div>

                 <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select 
                      value={typography}
                      onChange={e => setTypography(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs xl:text-sm font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                    >
                      <option value="Inter">Inter (Sans-serif)</option>
                      <option value="Georgia">Georgia (Serif)</option>
                      <option value="Courier New">Courier New (Monospace)</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <button 
                    type="button"
                    className="px-4 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap shrink-0"
                  >
                    <Type className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Cambiar tipografÃƒÂ­a</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 1.5: SECCIONES PREMIUM (PDP) */}
          {activeTab === 'premium' && (
            <div className="space-y-6">
              
              {/* Bento Grid Highlights Config */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Bento Grid de Destacados</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Destaca caracterÃƒÂ­sticas o ingredientes clave con tarjetas.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('bentoHighlights')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.bentoHighlights ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.bentoHighlights && (
                  <div className="space-y-4 pt-1 text-left animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo de la secciÃƒÂ³n</label>
                      <input 
                        type="text"
                        value={bentoHighlights.title}
                        onChange={e => setBentoHighlights(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Ingredientes de Especialidad"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="space-y-3.5 border-t border-zinc-100 pt-3">
                      {bentoHighlights.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Elemento #{idx + 1}</span>
                          
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-3 space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Emoji</label>
                              <input 
                                type="text"
                                value={item.emoji}
                                onChange={e => {
                                  const newItems = [...bentoHighlights.items]
                                  newItems[idx] = { ...item, emoji: e.target.value }
                                  setBentoHighlights(prev => ({ ...prev, items: newItems }))
                                }}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-center text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                              />
                            </div>
                            <div className="col-span-9 space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                              <input 
                                type="text"
                                value={item.title}
                                onChange={e => {
                                  const newItems = [...bentoHighlights.items]
                                  newItems[idx] = { ...item, title: e.target.value }
                                  setBentoHighlights(prev => ({ ...prev, items: newItems }))
                                }}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n corta</label>
                            <input 
                              type="text"
                              value={item.desc}
                              onChange={e => {
                                  const newItems = [...bentoHighlights.items]
                                  newItems[idx] = { ...item, desc: e.target.value }
                                  setBentoHighlights(prev => ({ ...prev, items: newItems }))
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-755 focus:outline-none focus:border-zinc-950"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion Specs Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Acordeones de Ficha / Specs</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">PestaÃƒÂ±as desplegables para alÃƒÂ©rgenos, envÃƒÂ­os o garantÃƒÂ­as.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('accordionSpecs')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.accordionSpecs ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.accordionSpecs && (
                  <div className="space-y-4 pt-1 text-left animate-in fade-in duration-300">
                    {accordionSpecs.map((tab, idx) => (
                      <div key={idx} className="p-3.5 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5 relative">
                        <button
                          onClick={() => {
                            setAccordionSpecs(prev => prev.filter((_, i) => i !== idx))
                          }}
                          className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-200/50 transition-colors cursor-pointer border-0 bg-transparent"
                          title="Eliminar pestaÃƒÂ±a"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">PestaÃƒÂ±a #{idx + 1}</span>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={tab.title}
                            onChange={e => {
                              const newTabs = [...accordionSpecs]
                              newTabs[idx] = { ...tab, title: e.target.value }
                              setAccordionSpecs(newTabs)
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 pr-8"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Contenido</label>
                          <textarea 
                            value={tab.content}
                            onChange={e => {
                              const newTabs = [...accordionSpecs]
                              newTabs[idx] = { ...tab, content: e.target.value }
                              setAccordionSpecs(newTabs)
                            }}
                            rows={3}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 resize-none font-sans"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setAccordionSpecs(prev => [...prev, { title: 'Nueva PestaÃƒÂ±a', content: 'Detalles...' }])}
                      className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <span>+ AÃƒÂ±adir PestaÃƒÂ±a</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Brand Story Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Historia de Marca / Storytelling</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Franja de ancho completo para contar tu pasiÃƒÂ³n al comprador.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('brandStory')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.brandStory ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.brandStory && (
                  <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo del banner</label>
                      <input 
                        type="text"
                        value={brandStory.title}
                        onChange={e => setBrandStory(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">DescripciÃƒÂ³n narrativa</label>
                      <textarea 
                        value={brandStory.desc}
                        onChange={e => setBrandStory(prev => ({ ...prev, desc: e.target.value }))}
                        rows={3}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL imagen de fondo</label>
                      <input 
                        type="text"
                        value={brandStory.bgUrl}
                        onChange={e => setBrandStory(prev => ({ ...prev, bgUrl: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block">Texto botÃƒÂ³n</label>
                        <input 
                          type="text"
                          value={brandStory.btnText}
                          onChange={e => setBrandStory(prev => ({ ...prev, btnText: e.target.value }))}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block">Enlace botÃƒÂ³n (Opcional)</label>
                        <input 
                          type="text"
                          value={brandStory.btnLink}
                          onChange={e => setBrandStory(prev => ({ ...prev, btnLink: e.target.value }))}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PÃƒÂ¡gina de Historia Completa Editor Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">PÃƒÂ¡gina de Historia Completa</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Personaliza la secciÃƒÂ³n de "Historia" (Nuestra trayectoria, perfil, pilares, equipo y valores).</p>
                </div>

                <div className="space-y-4 pt-1.5 text-left">
                  {/* TÃƒÂ­tulos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Etiqueta Superior</label>
                      <input 
                        type="text"
                        value={brandStoryPage.headerTrayectoria}
                        onChange={e => setBrandStoryPage(prev => ({ ...prev, headerTrayectoria: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo Principal</label>
                      <input 
                        type="text"
                        value={brandStoryPage.headerPerfil}
                        onChange={e => setBrandStoryPage(prev => ({ ...prev, headerPerfil: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  {/* Narrativas */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">PÃƒÂ¡rrafo Narrativo 1</label>
                    <textarea 
                      value={brandStoryPage.narrativeP1}
                      onChange={e => setBrandStoryPage(prev => ({ ...prev, narrativeP1: e.target.value }))}
                      rows={3}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">PÃƒÂ¡rrafo Narrativo 2</label>
                    <textarea 
                      value={brandStoryPage.narrativeP2}
                      onChange={e => setBrandStoryPage(prev => ({ ...prev, narrativeP2: e.target.value }))}
                      rows={3}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Imagen de la Historia (URL)</label>
                    <input 
                      type="text"
                      value={brandStoryPage.imageHeritage}
                      onChange={e => setBrandStoryPage(prev => ({ ...prev, imageHeritage: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  {/* Pilares */}
                  <div className="space-y-3.5 border-t border-zinc-100 pt-3">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Pilares / Instalaciones</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo de la secciÃƒÂ³n</label>
                      <input 
                        type="text"
                        value={brandStoryPage.pillarsTitle}
                        onChange={e => setBrandStoryPage(prev => ({ ...prev, pillarsTitle: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    {/* Pilar 1 */}
                    <div className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Pilar #1</span>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                          <input 
                            type="text"
                            value={brandStoryPage.pillar1Icon}
                            onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar1Icon: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-8 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={brandStoryPage.pillar1Title}
                            onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar1Title: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n</label>
                        <textarea 
                          value={brandStoryPage.pillar1Desc}
                          onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar1Desc: e.target.value }))}
                          rows={2}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Pilar 2 */}
                    <div className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Pilar #2</span>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                          <input 
                            type="text"
                            value={brandStoryPage.pillar2Icon}
                            onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar2Icon: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-8 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={brandStoryPage.pillar2Title}
                            onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar2Title: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n</label>
                        <textarea 
                          value={brandStoryPage.pillar2Desc}
                          onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar2Desc: e.target.value }))}
                          rows={2}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Equipo de Liderazgo */}
                  <div className="space-y-3.5 border-t border-zinc-100 pt-3">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Equipo de Liderazgo</h4>
                    {brandStoryPage.leadership.map((member: any, idx: number) => (
                      <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Miembro #{idx + 1}</span>
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3 space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                            <input 
                              type="text"
                              value={member.icon}
                              onChange={e => {
                                const newLeader = [...brandStoryPage.leadership]
                                newLeader[idx] = { ...member, icon: e.target.value }
                                setBrandStoryPage(prev => ({ ...prev, leadership: newLeader }))
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-9 space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">Nombre</label>
                            <input 
                              type="text"
                              value={member.name}
                              onChange={e => {
                                const newLeader = [...brandStoryPage.leadership]
                                newLeader[idx] = { ...member, name: e.target.value }
                                setBrandStoryPage(prev => ({ ...prev, leadership: newLeader }))
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Cargo / Rol</label>
                          <input 
                            type="text"
                            value={member.role}
                            onChange={e => {
                              const newLeader = [...brandStoryPage.leadership]
                              newLeader[idx] = { ...member, role: e.target.value }
                              setBrandStoryPage(prev => ({ ...prev, leadership: newLeader }))
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Valores Corporativos */}
                  <div className="space-y-3.5 border-t border-zinc-100 pt-3">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Nuestros Valores</h4>
                    {brandStoryPage.values.map((val: any, idx: number) => (
                      <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Valor #{idx + 1}</span>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={val.title}
                            onChange={e => {
                              const newVals = [...brandStoryPage.values]
                              newVals[idx] = { ...val, title: e.target.value }
                              setBrandStoryPage(prev => ({ ...prev, values: newVals }))
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n</label>
                          <textarea 
                            value={val.desc}
                            onChange={e => {
                              const newVals = [...brandStoryPage.values]
                              newVals[idx] = { ...val, desc: e.target.value }
                              setBrandStoryPage(prev => ({ ...prev, values: newVals }))
                            }}
                            rows={2}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* CategorÃƒÂ­as Visuales Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">CategorÃƒÂ­as Visuales (PDP Grid)</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Muestra una cuadrÃƒÂ­cula de imÃƒÂ¡genes para navegar categorÃƒÂ­as.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('visualCategories')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.visualCategories ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.visualCategories && (
                  <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
                    {visualCategories.map((catItem, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2 relative">
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">CategorÃƒÂ­a #{idx + 1}</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">Nombre</label>
                            <input 
                              type="text"
                              value={catItem.category}
                              onChange={e => {
                                const newCats = [...visualCategories]
                                newCats[idx] = { ...catItem, category: e.target.value }
                                setVisualCategories(newCats)
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">URL Imagen</label>
                            <input 
                              type="text"
                              value={catItem.imageUrl}
                              onChange={e => {
                                const newCats = [...visualCategories]
                                newCats[idx] = { ...catItem, imageUrl: e.target.value }
                                setVisualCategories(newCats)
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Proceso Timeline Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">LÃƒÂ­nea de Proceso (Paso a Paso)</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Muestra los pasos de compra o elaboraciÃƒÂ³n de tu producto.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('processTimeline')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.processTimeline ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.processTimeline && (
                  <div className="space-y-4 pt-1 text-left animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo de la secciÃƒÂ³n</label>
                      <input 
                        type="text"
                        value={processTimeline.title}
                        onChange={e => setProcessTimeline(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-3.5 border-t border-zinc-100 pt-3">
                      {processTimeline.items.map((stepItem: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Paso #{idx + 1}</span>
                          
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-3 space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block">NÃƒÂºmero</label>
                              <input 
                                type="text"
                                value={stepItem.step}
                                onChange={e => {
                                  const newItems = [...processTimeline.items]
                                  newItems[idx] = { ...stepItem, step: e.target.value }
                                  setProcessTimeline(prev => ({ ...prev, items: newItems }))
                                }}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                              />
                            </div>
                            <div className="col-span-9 space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo del Paso</label>
                              <input 
                                type="text"
                                value={stepItem.title}
                                onChange={e => {
                                  const newItems = [...processTimeline.items]
                                  newItems[idx] = { ...stepItem, title: e.target.value }
                                  setProcessTimeline(prev => ({ ...prev, items: newItems }))
                                }}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n del Paso</label>
                            <input 
                              type="text"
                              value={stepItem.desc}
                              onChange={e => {
                                const newItems = [...processTimeline.items]
                                newItems[idx] = { ...stepItem, desc: e.target.value }
                                setProcessTimeline(prev => ({ ...prev, items: newItems }))
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lifestyle Gallery Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">GalerÃƒÂ­a de Estilo de Vida</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Muestra hasta 4 fotos reales (estilo Instagram) de tu marca.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('lifestyleGallery')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.lifestyleGallery ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.lifestyleGallery && (
                  <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
                    {lifestyleGallery.map((imgUrl, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block select-none">Imagen #{idx + 1} (URL)</label>
                        <input 
                          type="text"
                          value={imgUrl}
                          onChange={e => {
                            const newG = [...lifestyleGallery]
                            newG[idx] = e.target.value
                            setLifestyleGallery(newG)
                          }}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Newsletter Widget Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Newsletter Banner (Club)</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Atrae suscriptores ofreciendo ofertas o novedades.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('newsletterWidget')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.newsletterWidget ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.newsletterWidget && (
                  <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo del newsletter</label>
                      <input 
                        type="text"
                        value={newsletterWidget.title}
                        onChange={e => setNewsletterWidget(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">SubtÃƒÂ­tulo descriptivo</label>
                      <textarea 
                        value={newsletterWidget.subtitle}
                        onChange={e => setNewsletterWidget(prev => ({ ...prev, subtitle: e.target.value }))}
                        rows={2}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5 flex flex-col items-center select-none">
                        <input 
                          type="color" 
                          value={newsletterWidget.bgColor}
                          onChange={e => setNewsletterWidget(prev => ({ ...prev, bgColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                        />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Fondo</span>
                      </div>

                      <div className="space-y-1.5 flex flex-col items-center select-none">
                        <input 
                          type="color" 
                          value={newsletterWidget.textColor}
                          onChange={e => setNewsletterWidget(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                        />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Texto</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* MenÃƒÂº de NavegaciÃƒÂ³n del Encabezado Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">MenÃƒÂº de NavegaciÃƒÂ³n de Cabecera</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Personaliza hasta 5 enlaces rÃƒÂ¡pidos en la barra superior de tu catÃƒÂ¡logo.</p>
                </div>

                <div className="space-y-4 pt-1 text-left">
                  {navbarLinks.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5 relative">
                      <button
                        onClick={() => {
                          setNavbarLinks(prev => prev.filter((_, i) => i !== idx))
                        }}
                        className="absolute right-2 top-2 text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-200/50 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Eliminar enlace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Enlace #{idx + 1}</span>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Etiqueta</label>
                          <input 
                            type="text"
                            value={item.label}
                            onChange={e => {
                              const newLinks = [...navbarLinks]
                              newLinks[idx] = { ...item, label: e.target.value }
                              setNavbarLinks(newLinks)
                            }}
                            placeholder="Ej: Tienda"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">AcciÃƒÂ³n</label>
                          <select 
                            value={item.action}
                            onChange={e => {
                              const newLinks = [...navbarLinks]
                              newLinks[idx] = { ...item, action: e.target.value as 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link' }
                              setNavbarLinks(newLinks)
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                          >
                            <option value="scroll-banner">Scroll a Portada</option>
                            <option value="scroll-products">Scroll a CatÃƒÂ¡logo</option>
                            <option value="scroll-story">Scroll a Historia</option>
                            <option value="whatsapp">Abrir WhatsApp</option>
                            <option value="link">Enlace Externo</option>
                          </select>
                        </div>
                      </div>

                      {item.action === 'link' && (
                        <div className="space-y-1 animate-in fade-in duration-300">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">URL Enlace Externo</label>
                          <input 
                            type="text"
                            value={item.link}
                            onChange={e => {
                              const newLinks = [...navbarLinks]
                              newLinks[idx] = { ...item, link: e.target.value }
                              setNavbarLinks(newLinks)
                            }}
                            placeholder="Ej: https://instagram.com/mi-tienda"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {navbarLinks.length < 5 && (
                    <button
                      onClick={() => setNavbarLinks(prev => [...prev, { label: 'Nuevo Enlace', action: 'scroll-products', link: '' }])}
                      className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <span>+ AÃƒÂ±adir Enlace</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3-Column Ingredients storytelling Section (Chocodate Style) */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Ingredientes Premium (3 Columnas)</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Layout simÃƒÂ©trico con imagen en medio y caracterÃƒÂ­sticas explicativas a los lados.</p>
                  </div>
                  <button
                    onClick={() => handleSectionToggle('ingredientsSection')}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      sections.ingredientsSection ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {sections.ingredientsSection && (
                  <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TÃƒÂ­tulo de SecciÃƒÂ³n</label>
                      <input 
                        type="text"
                        value={ingredientsSection.title}
                        onChange={e => setIngredientsSection(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg">
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Columna Izquierda</span>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={ingredientsSection.leftTitle}
                            onChange={e => setIngredientsSection(prev => ({ ...prev, leftTitle: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n</label>
                          <textarea 
                            value={ingredientsSection.leftDesc}
                            onChange={e => setIngredientsSection(prev => ({ ...prev, leftDesc: e.target.value }))}
                            rows={2}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg">
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Columna Derecha</span>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">TÃƒÂ­tulo</label>
                          <input 
                            type="text"
                            value={ingredientsSection.rightTitle}
                            onChange={e => setIngredientsSection(prev => ({ ...prev, rightTitle: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">DescripciÃƒÂ³n</label>
                          <textarea 
                            value={ingredientsSection.rightDesc}
                            onChange={e => setIngredientsSection(prev => ({ ...prev, rightDesc: e.target.value }))}
                            rows={2}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL Imagen Central</label>
                      <input 
                        type="text"
                        value={ingredientsSection.centerImageUrl}
                        onChange={e => setIngredientsSection(prev => ({ ...prev, centerImageUrl: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Free Shipping Progress bar Config */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Progreso de EnvÃƒÂ­o Gratis</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Muestra una barra dinÃƒÂ¡mica en el carrito incentivando mÃƒÂ¡s compras.</p>
                  </div>
                  <button
                    onClick={() => setFreeShipping(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      freeShipping.enabled ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {freeShipping.enabled && (
                  <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Monto mÃƒÂ­nimo para EnvÃƒÂ­o Gratis</label>
                      <input 
                        type="number"
                        value={freeShipping.threshold}
                        onChange={e => setFreeShipping(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: INFORMACIÃƒâ€œN DE LA TIENDA */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Datos del comercio</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Edita la descripciÃƒÂ³n, contacto y localizaciÃƒÂ³n de la tienda.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Nombre de la tienda</label>
                  <input 
                    type="text"
                    value={storeInfo.name}
                    onChange={e => setStoreInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">TelÃƒÂ©fono / WhatsApp</label>
                  <input 
                    type="text"
                    value={storeInfo.whatsapp}
                    onChange={e => setStoreInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">DirecciÃƒÂ³n fÃƒÂ­sica</label>
                  <input 
                    type="text"
                    value={storeInfo.address}
                    onChange={e => setStoreInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                    placeholder="ej: Calle 10 # 43 - 21, MedellÃƒÂ­n, Colombia"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">BiografÃƒÂ­a / PresentaciÃƒÂ³n</label>
                  <textarea 
                    value={storeInfo.desc}
                    onChange={e => setStoreInfo(prev => ({ ...prev, desc: e.target.value }))}
                    rows={4}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Horario de atenciÃƒÂ³n Card */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="flex justify-between items-center text-left">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Horario de atenciÃƒÂ³n</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Configura cuÃƒÂ¡ndo estÃƒÂ¡ abierta tu tienda.</p>
                </div>
                <button
                  onClick={() => setSchedule(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                    schedule.enabled ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {schedule.enabled && (
                <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between py-1 select-none text-left">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 block">Abierto 24/7 (Siempre abierto)</span>
                      <p className="text-[10px] font-semibold text-zinc-400">Tu comercio no cierra en ningÃƒÂºn horario.</p>
                    </div>
                    <button
                      onClick={() => setSchedule(prev => ({ ...prev, alwaysOpen: !prev.alwaysOpen }))}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                        schedule.alwaysOpen ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                      )}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  {!schedule.alwaysOpen && (
                    <div className="space-y-1.5 text-left animate-in fade-in duration-300">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Horario detallado</label>
                      <input 
                        type="text"
                        value={schedule.text}
                        onChange={e => setSchedule(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ej: Lunes a Viernes 8:00 AM - 6:00 PM"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Plantilla de pedido por WhatsApp Card */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Plantilla de WhatsApp</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Personaliza el formato del mensaje que te envÃƒÂ­an tus clientes.</p>
              </div>

              <div className="space-y-3.5 text-left">
                <div className="space-y-1.5">
                  <textarea 
                    value={whatsappTemplate}
                    onChange={e => setWhatsappTemplate(e.target.value)}
                    rows={6}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none font-mono"
                    placeholder="Escribe la plantilla del mensaje..."
                  />
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Variables soportadas:</span>
                  <div className="grid grid-cols-2 gap-1.5 mt-2 text-[9px] font-semibold text-zinc-500">
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{cliente_nombre}'}</code> - Nombre</div>
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{lista_productos}'}</code> - Productos</div>
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{monto_total}'}</code> - Total compra</div>
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{direccion}'}</code> - DirecciÃƒÂ³n</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* TAB 3: DOMINIOS */}
          {activeTab === 'dominios' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Dominios pÃƒÂºblicos</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Configura el slug o vincula un dominio propio.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Subdominio local</label>
                  <div className="flex items-stretch">
                    <input 
                      type="text"
                      value={domains.subdomain}
                      onChange={e => setDomains(prev => ({ ...prev, subdomain: e.target.value }))}
                      className="flex-1 bg-white border border-zinc-200 focus:border-zinc-950 rounded-l-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                    />
                    <span className="bg-zinc-50 border border-l-0 border-zinc-200 rounded-r-lg px-4 flex items-center text-xs font-bold text-zinc-500">
                      .flashcheckout.co
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Dominio personalizado (Pro)</label>
                  <input 
                    type="text"
                    value={domains.customDomain}
                    onChange={e => setDomains(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="ej: www.minegocio.com"
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-955 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Meta Tags SEO</h3>
                <p className="text-[11px] font-semibold text-zinc-400">CÃƒÂ³mo se verÃƒÂ¡ el catÃƒÂ¡logo al listarse en buscadores o chats.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">TÃƒÂ­tulo del sitio (Title)</label>
                  <input 
                    type="text"
                    value={seo.title}
                    onChange={e => setSeo(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">DescripciÃƒÂ³n (Meta Description)</label>
                  <textarea 
                    value={seo.desc}
                    onChange={e => setSeo(prev => ({ ...prev, desc: e.target.value }))}
                    rows={4}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REDES SOCIALES */}
          {activeTab === 'redes' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Redes Sociales</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Enlaces a tus canales de comunicaciÃƒÂ³n de redes.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-left pb-3.5 border-b border-zinc-100 select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 block leading-tight">Mostrar en el catÃƒÂ¡logo</span>
                    <p className="text-[10px] font-semibold text-zinc-400">Mostrar accesos directos a tus redes en la tienda.</p>
                  </div>
                  <button
                    onClick={() => setSocialsShowInCatalog(!socialsShowInCatalog)}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      socialsShowInCatalog ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Instagram</label>
                  <input 
                    type="text"
                    value={socials.instagram}
                    onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/tu_marca"
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Facebook</label>
                  <input 
                    type="text"
                    value={socials.facebook}
                    onChange={e => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/tu_marca"
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: POLÃƒÂTICAS */}
          {activeTab === 'politicas' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">PolÃƒÂ­ticas de la tienda</h3>
                <p className="text-[11px] font-semibold text-zinc-400">TÃƒÂ©rminos y condiciones legales para tus clientes.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">PolÃƒÂ­ticas de devoluciÃƒÂ³n</label>
                  <textarea 
                    value={policies.refunds}
                    onChange={e => setPolicies(prev => ({ ...prev, refunds: e.target.value }))}
                    rows={4}
                    placeholder="Describe los tÃƒÂ©rminos para reembolsos o devoluciones de productos..."
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">TÃƒÂ©rminos de servicio</label>
                  <textarea 
                    value={policies.terms}
                    onChange={e => setPolicies(prev => ({ ...prev, terms: e.target.value }))}
                    rows={4}
                    placeholder="Describe las condiciones de uso y tÃƒÂ©rminos de despacho..."
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}


          {/* GENERAL CONFIGURATION WIDGETS */}
          <div className="h-px bg-zinc-200/60 my-6" />

          {/* Card 1: Switch Toggles (Secciones visibles) */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
            <div className="text-left space-y-0.5">
              <h3 className="text-sm font-black text-zinc-900 leading-none">Secciones visibles</h3>
              <p className="text-[11px] font-semibold text-zinc-400">Activa o desactiva las secciones que deseas mostrar en tu tienda.</p>
            </div>

            <div className="space-y-3.5 select-none font-semibold text-xs text-zinc-700">
              {[
                { id: 'banner', label: 'Banner principal' },
                { id: 'destacados', label: 'Productos destacados' },
                { id: 'categorias', label: 'CategorÃƒÂ­as' },
                { id: 'beneficios', label: 'Beneficios' },
                { id: 'testimonios', label: 'Testimonios' },
                { id: 'newsletter', label: 'Newsletter' }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between py-1 border-b border-zinc-100 last:border-0 pb-2 last:pb-0">
                  <span>{item.label}</span>
                  
                  <button
                    onClick={() => handleSectionToggle(item.id as keyof typeof sections)}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0",
                      sections[item.id as keyof typeof sections] ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Enlace de tu tienda */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left flex flex-col justify-start">
            <div>
              <h3 className="text-sm font-black text-zinc-900 leading-none">Enlace de tu tienda</h3>
              <p className="text-[11px] font-semibold text-zinc-405 mt-1.5">Comparte este enlace con tus clientes.</p>
            </div>

            <div className="relative w-full">
              <input 
                type="text" 
                readOnly
                value={`https://${domains.subdomain}.flashcheckout.co`}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-zinc-650 focus:outline-none cursor-default select-all"
              />
              <ExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>

            <button 
              onClick={copyStoreUrl}
              className="self-start flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all shadow-none cursor-pointer select-none"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar enlace</span>
            </button>
          </div>

          {/* Card 3: Estado de la tienda */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left flex flex-col justify-start">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-zinc-900 leading-none">Estado de la tienda</h3>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold tracking-tight",
                storeActive ? "bg-[#EEF2F0] text-emerald-700" : "bg-red-50 text-red-650"
              )}>
                {storeActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-zinc-400">
              {storeActive ? 'Tu tienda estÃƒÂ¡ visible para todos los clientes.' : 'Tu tienda estÃƒÂ¡ pausada. Los clientes no podrÃƒÂ¡n crear pedidos.'}
            </p>

            <button
              onClick={toggleStoreStatus}
              className={cn(
                "self-start flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-lg transition-all cursor-pointer shadow-none",
                storeActive 
                  ? "bg-red-50/50 border-red-200 hover:bg-red-50 text-red-600"
                  : "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 text-emerald-600"
              )}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{storeActive ? 'Desactivar tienda' : 'Activar tienda'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Customizer Preview (8/12) */}
        <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
          
          {/* Live Preview Website Container */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 flex-1 flex flex-col items-center shadow-none min-h-0 overflow-hidden">
            <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-3 select-none shrink-0">
              <h3 className="text-xs xl:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-zinc-400" />
                Vista previa de tu tienda
              </h3>
              
              {/* Device switches */}
              <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50/50">
                {[
                  { id: 'escritorio', icon: Monitor, label: 'Escritorio' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'movil', icon: Smartphone, label: 'MÃƒÂ³vil' }
                ].map(dev => {
                  const Icon = dev.icon
                  return (
                    <button
                      key={dev.id}
                      onClick={() => setDevice(dev.id as 'escritorio' | 'tablet' | 'movil')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] xl:text-xs font-bold ${
                        device === dev.id 
                          ? 'bg-white text-zinc-955 shadow-sm border border-zinc-200/40' 
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      title={dev.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{dev.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

             {/* LIVE CANVAS WEB PREVIEW */}
             <div className={cn(
               "w-full flex-1 flex justify-center overflow-hidden relative select-none min-h-0 bg-zinc-50 border border-zinc-150 border-dashed rounded-lg p-4 mt-4",
               device === 'escritorio' ? "bg-white p-0 border-0 mt-4 items-stretch" : "items-center"
             )}>
                <div 
                  className={cn(
                    "bg-white flex flex-col text-left overflow-y-auto select-none relative transition-all duration-300",
                    device === 'escritorio' ? 'w-full h-full' : 'border border-zinc-200 shadow-xl rounded-lg',
                    device === 'tablet' ? 'w-[440px] h-[92%] max-h-[580px]' : '',
                    device === 'movil' ? 'w-[280px] h-[95%] max-h-[540px] rounded-[32px] border-8 border-zinc-900 shadow-2xl relative pt-4' : ''
                  )}
                  style={{ 
                    fontFamily: typography === 'Inter' ? 'Inter, sans-serif' : typography === 'Georgia' ? 'Georgia, serif' : 'monospace', 
                    backgroundColor: colors.fondo 
                  }}
                >
                  {/* Phone Header notch for Mobile view */}
                  {device === 'movil' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 h-4 w-28 rounded-b-xl z-20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-zinc-800 rounded-full" />
                    </div>
                  )}

                  <WhatsAppCatalog 
                    store={previewStore}
                    device={device}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
  )
}
