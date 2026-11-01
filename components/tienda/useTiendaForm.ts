import { useState } from 'react'
import { toast } from 'sonner'
import type { PublicCheckoutStore } from '@/lib/checkout/types'
import { Product, TiendaSettings, ThemePreset } from './types'
import {
  getInitialSections,
  getInitialBentoHighlights,
  getInitialVisualCategories,
  getInitialProcessTimeline,
  getInitialLifestyleGallery,
  getInitialNewsletterWidget,
  getInitialNavbarLinks,
  getInitialAccordionSpecs,
  getInitialBrandStory,
  getInitialBrandStoryPage
} from './tiendaDefaults'
import { uploadStoreImage, persistStoreSettings, buildTiendaAiSettings } from './tiendaPersistence'

export function useTiendaForm(initialStore: {
  id: string
  name: string
  slug: string
  category: string | null
  whatsapp: string
  bio: string | null
  logoUrl: string | null
  aiSettings: any
  active: boolean
}, products: Product[]) {
  const parsedSettings: TiendaSettings = initialStore.aiSettings && typeof initialStore.aiSettings === 'object'
    ? (initialStore.aiSettings as TiendaSettings)
    : {}

  // Aesthetic Customization States
  const [themePreset, setThemePreset] = useState<string>(parsedSettings.themePreset || 'luxe')
  const [borderRadius, setBorderRadius] = useState<'sharp' | 'smooth' | 'pill'>(parsedSettings.borderRadius || 'smooth')
  const [shadowStyle, setShadowStyle] = useState<'flat' | 'soft' | 'floating'>(parsedSettings.shadowStyle || 'soft')
  const [headerStyle, setHeaderStyle] = useState<'floating-glass' | 'clean-border' | 'editorial-centered'>(parsedSettings.headerStyle || 'floating-glass')
  const [heroStyle, setHeroStyle] = useState<'cinematic-overlay' | 'split-hero' | 'minimal-banner'>(parsedSettings.heroStyle || 'cinematic-overlay')
  const [heroBadge, setHeroBadge] = useState<string>(parsedSettings.heroBadge ?? '✨ NUEVA COLECCIÓN 2026')
  const [cardStyle, setCardStyle] = useState<'minimal-elevated' | 'clean-border' | 'glass-card'>(parsedSettings.cardStyle || 'minimal-elevated')
  const [cardAspectRatio, setCardAspectRatio] = useState<'square' | 'portrait'>(parsedSettings.cardAspectRatio || 'square')
  const [badgeStyle, setBadgeStyle] = useState<'pill' | 'solid' | 'outline'>(parsedSettings.badgeStyle || 'pill')
  const [catalogColumns, setCatalogColumns] = useState<'3' | '4' | '5'>(parsedSettings.catalogColumns || '4')

  // Color Theme state
  const [colors, setColors] = useState({
    primario: parsedSettings.colors?.primario || '#18181B',
    secundario: parsedSettings.colors?.secundario || '#71717A',
    acento: parsedSettings.colors?.acento || '#10B981',
    fondo: parsedSettings.colors?.fondo || '#FAFAFA',
    texto: parsedSettings.colors?.texto || '#09090B'
  })

  // Typography State
  const [typography, setTypography] = useState(parsedSettings.typography || 'Outfit')

  const handleApplyPreset = (preset: ThemePreset) => {
    setThemePreset(preset.id)
    setColors({ ...preset.colors })
    setTypography(preset.typography)
    setBorderRadius(preset.borderRadius)
    setShadowStyle(preset.shadowStyle)
    setHeaderStyle(preset.headerStyle)
    setHeroStyle(preset.heroStyle)
    setCardStyle(preset.cardStyle)
    setCardAspectRatio(preset.cardAspectRatio)
    setBadgeStyle(preset.badgeStyle)
    toast.success(`Tema "${preset.name}" aplicado`)
  }

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setThemePreset('custom')
    setColors(prev => ({ ...prev, [key]: value }))
  }

  // Sections and widgets states
  const [sections, setSections] = useState(getInitialSections(parsedSettings))
  const [bentoHighlights, setBentoHighlights] = useState(getInitialBentoHighlights(parsedSettings))
  const [visualCategories, setVisualCategories] = useState(getInitialVisualCategories(parsedSettings))
  const [processTimeline, setProcessTimeline] = useState(getInitialProcessTimeline(parsedSettings))
  const [lifestyleGallery, setLifestyleGallery] = useState(getInitialLifestyleGallery(parsedSettings))
  const [newsletterWidget, setNewsletterWidget] = useState(getInitialNewsletterWidget(parsedSettings))
  const [navbarLinks, setNavbarLinks] = useState(getInitialNavbarLinks(parsedSettings))
  const [accordionSpecs, setAccordionSpecs] = useState(getInitialAccordionSpecs(parsedSettings))
  const [brandStory, setBrandStory] = useState(getInitialBrandStory(parsedSettings))
  const [brandStoryPage, setBrandStoryPage] = useState(getInitialBrandStoryPage(parsedSettings))

  // Logo & Banner State
  const [logoUrl, setLogoUrl] = useState<string>(initialStore.logoUrl || '')
  const [bannerUrl, setBannerUrl] = useState<string>(
    parsedSettings.bannerUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop'
  )
  const [bannerTitle, setBannerTitle] = useState(
    parsedSettings.bannerTitle || 'El mejor café, directo a tu puerta'
  )
  const [bannerSubtitle, setBannerSubtitle] = useState(
    parsedSettings.bannerSubtitle || 'Descubre nuestros productos de especialidad cultivados con amor y tostados frescos.'
  )

  // Hero Banner type and video URL
  const [heroType, setHeroType] = useState<'image' | 'video'>(parsedSettings.heroType === 'video' ? 'video' : 'image')
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>(
    parsedSettings.heroVideoUrl || 'https://www.chocodate.com/assets/video/hero.mp4'
  )

  // 3-Column Ingredients section state
  const [ingredientsSection, setIngredientsSection] = useState({
    title: parsedSettings.ingredientsSection?.title || 'Nuestros Ingredientes Premium',
    leftTitle: parsedSettings.ingredientsSection?.leftTitle || 'Dátiles de Faraón',
    leftDesc: parsedSettings.ingredientsSection?.leftDesc || 'Dulces, carnosos, naturales y recolectados en su punto de madurez.',
    centerImageUrl: parsedSettings.ingredientsSection?.centerImageUrl || 'https://www.chocodate.com/assets/img/central-product.png',
    rightTitle: parsedSettings.ingredientsSection?.rightTitle || 'Chocolate Belga Puro',
    rightDesc: parsedSettings.ingredientsSection?.rightDesc || 'Exquisita cobertura de chocolate de primera calidad con textura suave.'
  })

  // Free Shipping configuration
  const [freeShipping, setFreeShipping] = useState({
    enabled: parsedSettings.freeShipping?.enabled ?? true,
    threshold: parsedSettings.freeShipping?.threshold || 100000
  })

  // Conversion Trust Modules States
  const [paymentMethods, setPaymentMethods] = useState({
    enabled: parsedSettings.paymentMethods?.enabled !== false,
    nequi: parsedSettings.paymentMethods?.nequi !== false,
    bancolombia: parsedSettings.paymentMethods?.bancolombia !== false,
    contraEntrega: parsedSettings.paymentMethods?.contraEntrega !== false,
    pse: parsedSettings.paymentMethods?.pse !== false,
    tarjetas: parsedSettings.paymentMethods?.tarjetas !== false,
    customNote: parsedSettings.paymentMethods?.customNote || 'Aceptamos transferencias y pago contra entrega en Colombia.'
  })

  const [testimonials, setTestimonials] = useState({
    enabled: parsedSettings.testimonials?.enabled !== false,
    title: parsedSettings.testimonials?.title || 'Lo que dicen nuestros clientes',
    subtitle: parsedSettings.testimonials?.subtitle || 'Compradores reales que confían en nosotros día a día',
    items: parsedSettings.testimonials?.items || [
      { name: 'Carolina Martínez', city: 'Bogotá', stars: 5, comment: 'Excelente calidad y la atención por WhatsApp fue de 10. Mi pedido llegó al día siguiente.' },
      { name: 'Andrés Rincón', city: 'Medellín', stars: 5, comment: 'Súper rápido y confiable. Pagué contra entrega y el producto venía perfectamente empacado.' },
      { name: 'Mariana Gómez', city: 'Cali', stars: 5, comment: 'Tenía dudas sobre mi talla y me asesoraron súper bien por chat. Ya he comprado 3 veces.' }
    ]
  })

  const [faqs, setFaqs] = useState({
    enabled: parsedSettings.faqs?.enabled !== false,
    title: parsedSettings.faqs?.title || 'Preguntas Frecuentes',
    items: parsedSettings.faqs?.items || [
      { q: '¿Cómo realizo mi pedido y pago?', a: 'Elige tus productos, añade tu dirección y al confirmar se abrirá tu WhatsApp con el pedido listo. Puedes pagar por Nequi, Bancolombia, PSE, tarjeta o pago contra entrega según cobertura.' },
      { q: '¿Cuánto tiempo tarda en llegar?', a: 'Despachamos en 24 a 48 horas hábiles a ciudades principales. Te compartimos la guía de rastreo por WhatsApp.' },
      { q: '¿Tienen garantía los productos?', a: 'Sí, todos nuestros artículos cuentan con garantía directa de satisfacción. Si tienes cualquier inconveniente, te respondemos de inmediato.' }
    ]
  })

  const [floatingWhatsApp, setFloatingWhatsApp] = useState({
    enabled: parsedSettings.floatingWhatsApp?.enabled !== false,
    message: parsedSettings.floatingWhatsApp?.message || '¿Tienes dudas con tu pedido? Chatea con un asesor aquí 👋',
    agentName: parsedSettings.floatingWhatsApp?.agentName || 'Asesor en línea'
  })

  // Announcement Bar state
  const [announcement, setAnnouncement] = useState({
    enabled: parsedSettings.announcement?.enabled || false,
    text: parsedSettings.announcement?.text || '🚚 ¡Envíos gratis por compras superiores a $100.000!',
    bgColor: parsedSettings.announcement?.bgColor || '#059669',
    textColor: parsedSettings.announcement?.textColor || '#FFFFFF'
  })

  // Banner Button state
  const [bannerButton, setBannerButton] = useState({
    text: parsedSettings.bannerButton?.text || 'Ver productos',
    action: (parsedSettings.bannerButton?.action as 'scroll' | 'whatsapp' | 'link') || 'scroll',
    link: parsedSettings.bannerButton?.link || ''
  })

  // Benefits Custom items
  const [benefits, setBenefits] = useState({
    items: parsedSettings.benefits?.items || [
      { icon: 'Truck' as const, label: 'Envíos rápidos', desc: 'A todo el país' },
      { icon: 'ShieldCheck' as const, label: 'Pagos seguros', desc: 'Múltiples métodos' },
      { icon: 'Award' as const, label: 'Café de calidad', desc: 'Granos seleccionados' },
      { icon: 'Clock' as const, label: 'Atención 24/7', desc: 'Siempre disponibles' }
    ]
  })

  const [socialsShowInCatalog, setSocialsShowInCatalog] = useState(
    parsedSettings.socialsShowInCatalog !== false
  )

  const [schedule, setSchedule] = useState({
    enabled: parsedSettings.schedule?.enabled || false,
    text: parsedSettings.schedule?.text || 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: parsedSettings.schedule?.alwaysOpen !== false
  })

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    parsedSettings.whatsappTemplate || 
    'Hola! Vengo de tu tienda online y quiero realizar el siguiente pedido:\n\n*Productos:*\n{lista_productos}\n\n*Total:* {monto_total}\n\n*Datos de entrega:*\nNombre: {cliente_nombre}\nDirección: {direccion}'
  )
  
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [storeActive, setStoreActive] = useState(initialStore.active)

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
    title: parsedSettings.seo?.title || `${initialStore.name} | Catálogo`,
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

  const commonSettingsParams = {
    colors,
    typography,
    themePreset,
    borderRadius,
    shadowStyle,
    headerStyle,
    heroStyle,
    heroBadge,
    cardStyle,
    cardAspectRatio,
    badgeStyle,
    catalogColumns,
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
    address: storeInfo.address,
    bentoHighlights,
    accordionSpecs,
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
    paymentMethods,
    testimonials,
    faqs,
    floatingWhatsApp
  }

  const previewStore: PublicCheckoutStore = {
    ...initialStore,
    name: storeInfo.name,
    whatsapp: storeInfo.whatsapp,
    logoUrl: logoUrl || null,
    bio: storeInfo.desc,
    products,
    cardPaymentsEnabled: true,
    aiSettings: buildTiendaAiSettings(commonSettingsParams),
    bannerUrl: bannerUrl || null,
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadStoreImage(file, type)
      if (type === 'logo') {
        setLogoUrl(url)
      } else {
        setBannerUrl(url)
      }
    } catch {
      // toast already handled
    }
  }

  const copyStoreUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://flashcheckout.co'
    navigator.clipboard.writeText(`${base}/tienda/${domains.subdomain}`)
    setCopied(true)
    toast.success('Enlace de la tienda copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSectionToggle = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await persistStoreSettings({
        name: storeInfo.name,
        whatsapp: storeInfo.whatsapp,
        bio: storeInfo.desc,
        category: storeInfo.category,
        logoUrl: logoUrl || null,
        slug: domains.subdomain,
        active: storeActive,
        aiSettings: buildTiendaAiSettings({
          ...commonSettingsParams,
          seo,
          customDomain: domains.customDomain
        })
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Ocurrió un error al guardar los ajustes.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStoreStatus = async () => {
    const newStatus = !storeActive
    setStoreActive(newStatus)
    toast.info(newStatus ? 'Tienda activada' : 'Tienda desactivada temporalmente')
  }

  return {
    themePreset,
    setThemePreset,
    borderRadius,
    setBorderRadius,
    shadowStyle,
    setShadowStyle,
    headerStyle,
    setHeaderStyle,
    heroStyle,
    setHeroStyle,
    heroBadge,
    setHeroBadge,
    cardStyle,
    setCardStyle,
    cardAspectRatio,
    setCardAspectRatio,
    badgeStyle,
    setBadgeStyle,
    catalogColumns,
    setCatalogColumns,
    colors,
    setColors,
    typography,
    setTypography,
    handleApplyPreset,
    handleColorChange,
    sections,
    setSections,
    handleSectionToggle,
    bentoHighlights,
    setBentoHighlights,
    visualCategories,
    setVisualCategories,
    processTimeline,
    setProcessTimeline,
    lifestyleGallery,
    setLifestyleGallery,
    newsletterWidget,
    setNewsletterWidget,
    navbarLinks,
    setNavbarLinks,
    accordionSpecs,
    setAccordionSpecs,
    brandStory,
    setBrandStory,
    brandStoryPage,
    setBrandStoryPage,
    logoUrl,
    setLogoUrl,
    bannerUrl,
    setBannerUrl,
    bannerTitle,
    setBannerTitle,
    bannerSubtitle,
    setBannerSubtitle,
    heroType,
    setHeroType,
    heroVideoUrl,
    setHeroVideoUrl,
    ingredientsSection,
    setIngredientsSection,
    freeShipping,
    setFreeShipping,
    paymentMethods,
    setPaymentMethods,
    testimonials,
    setTestimonials,
    faqs,
    setFaqs,
    floatingWhatsApp,
    setFloatingWhatsApp,
    announcement,
    setAnnouncement,
    bannerButton,
    setBannerButton,
    benefits,
    setBenefits,
    socialsShowInCatalog,
    setSocialsShowInCatalog,
    schedule,
    setSchedule,
    whatsappTemplate,
    setWhatsappTemplate,
    copied,
    isSaving,
    storeActive,
    storeInfo,
    setStoreInfo,
    domains,
    setDomains,
    seo,
    setSeo,
    socials,
    setSocials,
    policies,
    setPolicies,
    previewStore,
    handleImageUpload,
    copyStoreUrl,
    handleSaveChanges,
    toggleStoreStatus
  }
}

export type TiendaFormState = ReturnType<typeof useTiendaForm>
