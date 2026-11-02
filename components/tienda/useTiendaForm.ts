import { useState } from 'react'
import { toast } from 'sonner'
import type { PublicCheckoutStore } from '@/lib/checkout/types'
import { buildIndustryStoreBlueprint } from '@/lib/store-blueprints'
import {
  CardStyleType,
  HeaderStyleType,
  HeroStyleType,
  Product,
  ThemePreset,
  TiendaSettings,
} from './types'
import {
  getInitialAccordionSpecs,
  getInitialAmbassadors,
  getInitialBenefits,
  getInitialBentoHighlights,
  getInitialBrandStory,
  getInitialBrandStoryPage,
  getInitialFaqs,
  getInitialIngredientsSection,
  getInitialLifestyleGallery,
  getInitialNavbarLinks,
  getInitialNewsletterWidget,
  getInitialPaymentMethods,
  getInitialPressLogos,
  getInitialProcessTimeline,
  getInitialRetailers,
  getInitialSections,
  getInitialTestimonials,
  getInitialUgcGallery,
  getInitialVisualCategories,
} from './tiendaDefaults'
import { buildTiendaAiSettings, persistStoreSettings, uploadStoreImage } from './tiendaPersistence'

export function useTiendaForm(
  initialStore: {
    id: string
    name: string
    slug: string
    category: string | null
    whatsapp: string
    bio: string | null
    logoUrl: string | null
    aiSettings: any
    active: boolean
  },
  products: Product[]
) {
  const parsedSettings: TiendaSettings =
    initialStore.aiSettings && typeof initialStore.aiSettings === 'object'
      ? (initialStore.aiSettings as TiendaSettings)
      : {}

  const fallback = buildIndustryStoreBlueprint({
    name: initialStore.name,
    category: initialStore.category,
    description: initialStore.bio,
  }).aiSettings

  const [themePreset, setThemePreset] = useState<string>(
    parsedSettings.themePreset || fallback.themePreset || 'waterdrop'
  )
  const [borderRadius, setBorderRadius] = useState<'sharp' | 'smooth' | 'pill'>(
    parsedSettings.borderRadius || fallback.borderRadius || 'pill'
  )
  const [shadowStyle, setShadowStyle] = useState<'flat' | 'soft' | 'floating'>(
    parsedSettings.shadowStyle || fallback.shadowStyle || 'flat'
  )
  const [headerStyle, setHeaderStyle] = useState<HeaderStyleType>(
    parsedSettings.headerStyle || fallback.headerStyle || 'clean-border'
  )
  const [heroStyle, setHeroStyle] = useState<HeroStyleType>(
    parsedSettings.heroStyle || fallback.heroStyle || 'waterdrop-collage'
  )
  const [heroBadge, setHeroBadge] = useState<string>(
    parsedSettings.heroBadge ?? fallback.heroBadge ?? 'NUEVA EDICIÓN'
  )
  const [heroPanels, setHeroPanels] = useState<string[]>(
    parsedSettings.heroPanels || fallback.heroPanels || []
  )
  const [cardStyle, setCardStyle] = useState<CardStyleType>(
    parsedSettings.cardStyle || fallback.cardStyle || 'waterdrop-studio'
  )
  const [cardAspectRatio, setCardAspectRatio] = useState<'square' | 'portrait'>(
    parsedSettings.cardAspectRatio || fallback.cardAspectRatio || 'portrait'
  )
  const [badgeStyle, setBadgeStyle] = useState<'pill' | 'solid' | 'outline'>(
    parsedSettings.badgeStyle || fallback.badgeStyle || 'pill'
  )
  const [catalogColumns, setCatalogColumns] = useState<'3' | '4' | '5'>(
    parsedSettings.catalogColumns || '4'
  )
  const [showVariantSwatches, setShowVariantSwatches] = useState<boolean>(
    parsedSettings.showVariantSwatches !== false
  )

  const [colors, setColors] = useState({
    primario: parsedSettings.colors?.primario || fallback.colors?.primario || '#111111',
    secundario: parsedSettings.colors?.secundario || fallback.colors?.secundario || '#52525B',
    acento: parsedSettings.colors?.acento || fallback.colors?.acento || '#8CE5A7',
    fondo: parsedSettings.colors?.fondo || fallback.colors?.fondo || '#FFFFFF',
    texto: parsedSettings.colors?.texto || fallback.colors?.texto || '#111111',
  })
  const [typography, setTypography] = useState(
    parsedSettings.typography || fallback.typography || 'Plus Jakarta Sans'
  )

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
    setAnnouncement(prev => ({
      ...prev,
      bgColor: preset.id === 'waterdrop' ? '#DDF3E4' : preset.colors.acento,
      textColor: preset.id === 'waterdrop' ? '#0D3B26' : preset.id === 'midnight' ? '#09090B' : '#111111',
    }))
    if (preset.id === 'waterdrop') {
      setHeroType('image')
      setShowVariantSwatches(true)
      setSections(prev => ({
        ...prev,
        banner: true,
        destacados: true,
        editorialCategories: true,
        processTimeline: true,
        pressLogos: true,
        ambassadors: true,
        ugcGallery: true,
        retailers: true,
        testimonials: true,
        faqs: true,
        beneficios: true,
        newsletterWidget: true,
        visualCategories: false,
        bentoHighlights: false,
        ingredientsSection: false,
        brandStory: false,
        accordionSpecs: false,
      }))
    }
    toast.success(`Tema "${preset.name}" aplicado`)
  }

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setThemePreset('custom')
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const [sections, setSections] = useState(getInitialSections(parsedSettings, fallback))
  const [bentoHighlights, setBentoHighlights] = useState(getInitialBentoHighlights(parsedSettings, fallback))
  const [visualCategories, setVisualCategories] = useState(getInitialVisualCategories(parsedSettings, fallback))
  const [processTimeline, setProcessTimeline] = useState(getInitialProcessTimeline(parsedSettings, fallback))
  const [ambassadors, setAmbassadors] = useState(getInitialAmbassadors(parsedSettings, fallback))
  const [pressLogos, setPressLogos] = useState(getInitialPressLogos(parsedSettings, fallback))
  const [retailers, setRetailers] = useState(getInitialRetailers(parsedSettings, fallback))
  const [ugcGallery, setUgcGallery] = useState(getInitialUgcGallery(parsedSettings, fallback))
  const [lifestyleGallery, setLifestyleGallery] = useState(getInitialLifestyleGallery(parsedSettings, fallback))
  const [newsletterWidget, setNewsletterWidget] = useState(getInitialNewsletterWidget(parsedSettings, fallback))
  const [navbarLinks, setNavbarLinks] = useState(getInitialNavbarLinks(parsedSettings))
  const [accordionSpecs, setAccordionSpecs] = useState(getInitialAccordionSpecs(parsedSettings, fallback))
  const [brandStory, setBrandStory] = useState(getInitialBrandStory(parsedSettings, fallback))
  const [brandStoryPage, setBrandStoryPage] = useState(getInitialBrandStoryPage(parsedSettings, fallback))
  const [ingredientsSection, setIngredientsSection] = useState(getInitialIngredientsSection(parsedSettings, fallback))
  const [paymentMethods, setPaymentMethods] = useState(getInitialPaymentMethods(parsedSettings, fallback))
  const [testimonials, setTestimonials] = useState(getInitialTestimonials(parsedSettings, fallback))
  const [faqs, setFaqs] = useState(getInitialFaqs(parsedSettings, fallback))
  const [benefits, setBenefits] = useState(getInitialBenefits(parsedSettings, fallback))

  const [logoUrl, setLogoUrl] = useState<string>(initialStore.logoUrl || '')
  const [bannerUrl, setBannerUrl] = useState<string>(
    parsedSettings.bannerUrl ||
      fallback.bannerUrl ||
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop'
  )
  const [bannerTitle, setBannerTitle] = useState(
    parsedSettings.bannerTitle || fallback.bannerTitle || `Bienvenido a ${initialStore.name}`
  )
  const [bannerSubtitle, setBannerSubtitle] = useState(
    parsedSettings.bannerSubtitle ||
      fallback.bannerSubtitle ||
      'Explora nuestro catálogo actualizado y haz tu pedido de forma rápida y segura.'
  )
  const [heroType, setHeroType] = useState<'image' | 'video'>(
    parsedSettings.heroType === 'video' ? 'video' : 'image'
  )
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>(parsedSettings.heroVideoUrl || '')

  const [freeShipping, setFreeShipping] = useState({
    enabled: parsedSettings.freeShipping?.enabled ?? true,
    threshold: parsedSettings.freeShipping?.threshold || 120000,
  })
  const [floatingWhatsApp, setFloatingWhatsApp] = useState({
    enabled: parsedSettings.floatingWhatsApp?.enabled !== false,
    message: parsedSettings.floatingWhatsApp?.message || fallback.floatingWhatsApp?.message || '¿Tienes dudas con tu pedido? Chatea con un asesor aquí 👋',
    agentName: parsedSettings.floatingWhatsApp?.agentName || fallback.floatingWhatsApp?.agentName || 'Asesor en línea',
  })
  const [announcement, setAnnouncement] = useState({
    enabled: parsedSettings.announcement?.enabled ?? true,
    text: parsedSettings.announcement?.text || fallback.announcement?.text || '🚚 Envíos gratis desde $120.000 | Pagos seguros y contra entrega',
    bgColor: parsedSettings.announcement?.bgColor || fallback.announcement?.bgColor || '#8CE5A7',
    textColor: parsedSettings.announcement?.textColor || fallback.announcement?.textColor || '#111111',
  })
  const [bannerButton, setBannerButton] = useState({
    text: parsedSettings.bannerButton?.text || fallback.bannerButton?.text || 'Comprar ahora',
    action: (parsedSettings.bannerButton?.action as 'scroll' | 'whatsapp' | 'link') || 'scroll',
    link: parsedSettings.bannerButton?.link || '',
  })
  const [socialsShowInCatalog, setSocialsShowInCatalog] = useState(parsedSettings.socialsShowInCatalog !== false)
  const [schedule, setSchedule] = useState({
    enabled: parsedSettings.schedule?.enabled || false,
    text: parsedSettings.schedule?.text || 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: parsedSettings.schedule?.alwaysOpen !== false,
  })
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    parsedSettings.whatsappTemplate ||
      'Hola! Vengo de tu tienda online y quiero realizar el siguiente pedido:\n\n*Productos:*\n{lista_productos}\n\n*Total:* {monto_total}\n\n*Datos de entrega:*\nNombre: {cliente_nombre}\nDirección: {direccion}'
  )

  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPage, setIsGeneratingPage] = useState(false)
  const [storeActive, setStoreActive] = useState(initialStore.active)

  const [storeInfo, setStoreInfo] = useState({
    name: initialStore.name,
    desc: initialStore.bio || '',
    whatsapp: initialStore.whatsapp,
    category: initialStore.category || 'Otros',
    address: parsedSettings.info?.address || '',
  })
  const [domains, setDomains] = useState({
    subdomain: initialStore.slug,
    customDomain: parsedSettings.domains?.customDomain || '',
  })
  const [seo, setSeo] = useState({
    title: parsedSettings.seo?.title || `${initialStore.name} | Tienda Oficial`,
    desc: parsedSettings.seo?.desc || `Compra online en ${initialStore.name} con atención directa.`,
  })
  const [socials, setSocials] = useState({
    instagram: parsedSettings.socials?.instagram || '',
    facebook: parsedSettings.socials?.facebook || '',
    tiktok: parsedSettings.socials?.tiktok || '',
    twitter: parsedSettings.socials?.twitter || '',
    web: parsedSettings.socials?.web || '',
  })
  const [policies, setPolicies] = useState({
    terms: parsedSettings.policies?.terms || '',
    refunds: parsedSettings.policies?.refunds || '',
  })

  const commonSettingsParams = {
    colors, typography, themePreset, borderRadius, shadowStyle, headerStyle, heroStyle, heroBadge,
    heroPanels, cardStyle, cardAspectRatio, badgeStyle, catalogColumns, showVariantSwatches,
    sections, bannerUrl, bannerTitle, bannerSubtitle, announcement, bannerButton, benefits,
    socialsShowInCatalog, schedule, whatsappTemplate, socials, policies, address: storeInfo.address,
    bentoHighlights, accordionSpecs, brandStory, brandStoryPage, visualCategories, processTimeline,
    ambassadors, pressLogos, retailers, ugcGallery, lifestyleGallery, newsletterWidget, navbarLinks,
    heroType, heroVideoUrl, ingredientsSection, freeShipping, paymentMethods, testimonials, faqs,
    floatingWhatsApp,
  }

  const previewStore: PublicCheckoutStore = {
    ...initialStore,
    name: storeInfo.name,
    category: storeInfo.category,
    whatsapp: storeInfo.whatsapp,
    logoUrl: logoUrl || null,
    bio: storeInfo.desc,
    products,
    cardPaymentsEnabled: true,
    aiSettings: buildTiendaAiSettings(commonSettingsParams),
    bannerUrl: bannerUrl || null,
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner',
    panelIndex?: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadStoreImage(file, type)
      if (type === 'logo') {
        setLogoUrl(url)
      } else if (typeof panelIndex === 'number') {
        setHeroPanels(prev => {
          const next = [...prev]
          while (next.length <= panelIndex) next.push('')
          next[panelIndex] = url
          return next
        })
        if (panelIndex === 0) setBannerUrl(url)
      } else {
        setBannerUrl(url)
      }
    } catch {
      // toast handled
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
        storeId: initialStore.id,
        name: storeInfo.name,
        whatsapp: storeInfo.whatsapp,
        bio: storeInfo.desc,
        category: storeInfo.category,
        logoUrl: logoUrl || null,
        slug: domains.subdomain,
        active: storeActive,
        aiSettings: buildTiendaAiSettings({ ...commonSettingsParams, seo, customDomain: domains.customDomain }),
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Ocurrió un error al guardar los ajustes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutogeneratePage = async () => {
    setIsGeneratingPage(true)
    const toastId = toast.loading('Diseñando y redactando tu página según tu negocio...')
    try {
      const res = await fetch('/api/stores/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: initialStore.id,
          name: storeInfo.name,
          category: storeInfo.category,
          description: storeInfo.desc,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.generated) throw new Error(data.error || 'No se pudo autogenerar la página')

      const gen: TiendaSettings = data.generated.aiSettings
      if (data.generated.bio) setStoreInfo(prev => ({ ...prev, desc: data.generated.bio }))
      if (gen.themePreset) setThemePreset(gen.themePreset)
      if (gen.colors) {
        setColors(prev => ({
          primario: gen.colors?.primario || prev.primario,
          secundario: gen.colors?.secundario || prev.secundario,
          acento: gen.colors?.acento || prev.acento,
          fondo: gen.colors?.fondo || prev.fondo,
          texto: gen.colors?.texto || prev.texto,
        }))
      }
      if (gen.typography) setTypography(gen.typography)
      if (gen.borderRadius) setBorderRadius(gen.borderRadius)
      if (gen.shadowStyle) setShadowStyle(gen.shadowStyle)
      if (gen.headerStyle) setHeaderStyle(gen.headerStyle)
      if (gen.heroStyle) setHeroStyle(gen.heroStyle)
      if (gen.heroBadge !== undefined) setHeroBadge(gen.heroBadge)
      if (gen.heroPanels) setHeroPanels(gen.heroPanels)
      if (gen.cardStyle) setCardStyle(gen.cardStyle)
      if (gen.cardAspectRatio) setCardAspectRatio(gen.cardAspectRatio)
      if (gen.badgeStyle) setBadgeStyle(gen.badgeStyle)
      if (gen.bannerUrl) setBannerUrl(gen.bannerUrl)
      if (gen.bannerTitle) setBannerTitle(gen.bannerTitle)
      if (gen.bannerSubtitle) setBannerSubtitle(gen.bannerSubtitle)
      if (gen.sections) setSections(getInitialSections(gen))
      if (gen.announcement) {
        setAnnouncement(prev => ({
          enabled: gen.announcement?.enabled ?? true,
          text: gen.announcement?.text || prev.text,
          bgColor: gen.announcement?.bgColor || prev.bgColor,
          textColor: gen.announcement?.textColor || prev.textColor,
        }))
      }
      if (gen.benefits?.items) setBenefits({ items: gen.benefits.items })
      if (gen.processTimeline) setProcessTimeline(getInitialProcessTimeline(gen))
      if (gen.ambassadors) setAmbassadors(getInitialAmbassadors(gen))
      if (gen.pressLogos) setPressLogos(gen.pressLogos)
      if (gen.retailers) setRetailers(getInitialRetailers(gen))
      if (gen.ugcGallery) setUgcGallery(gen.ugcGallery)
      if (gen.bentoHighlights) setBentoHighlights(getInitialBentoHighlights(gen))
      if (gen.brandStory) setBrandStory(getInitialBrandStory(gen))
      if (gen.brandStoryPage) setBrandStoryPage(getInitialBrandStoryPage(gen))
      if (gen.faqs?.items) setFaqs(prev => ({ ...prev, enabled: true, items: gen.faqs!.items! }))
      if (gen.testimonials?.items) {
        setTestimonials(prev => ({
          ...prev,
          enabled: true,
          title: gen.testimonials?.title || prev.title,
          subtitle: gen.testimonials?.subtitle || prev.subtitle,
          items: gen.testimonials!.items!,
        }))
      }
      toast.success('¡Página adaptada a tu negocio!', {
        id: toastId,
        description: 'Estética Waterdrop, portada collage, secciones y textos guardados.',
      })
    } catch (err: any) {
      toast.error(err.message || 'Error al autogenerar la página', { id: toastId })
    } finally {
      setIsGeneratingPage(false)
    }
  }

  const toggleStoreStatus = async () => {
    const newStatus = !storeActive
    setStoreActive(newStatus)
    toast.info(newStatus ? 'Tienda activada' : 'Tienda pausada temporalmente')
  }

  return {
    themePreset, setThemePreset, borderRadius, setBorderRadius, shadowStyle, setShadowStyle,
    headerStyle, setHeaderStyle, heroStyle, setHeroStyle, heroBadge, setHeroBadge,
    heroPanels, setHeroPanels, cardStyle, setCardStyle, cardAspectRatio, setCardAspectRatio,
    badgeStyle, setBadgeStyle, catalogColumns, setCatalogColumns, showVariantSwatches, setShowVariantSwatches,
    colors, setColors, typography, setTypography, handleApplyPreset, handleColorChange,
    sections, setSections, handleSectionToggle, bentoHighlights, setBentoHighlights,
    visualCategories, setVisualCategories, processTimeline, setProcessTimeline,
    ambassadors, setAmbassadors, pressLogos, setPressLogos, retailers, setRetailers,
    ugcGallery, setUgcGallery, lifestyleGallery, setLifestyleGallery,
    newsletterWidget, setNewsletterWidget, navbarLinks, setNavbarLinks,
    accordionSpecs, setAccordionSpecs, brandStory, setBrandStory, brandStoryPage, setBrandStoryPage,
    logoUrl, setLogoUrl, bannerUrl, setBannerUrl, bannerTitle, setBannerTitle,
    bannerSubtitle, setBannerSubtitle, heroType, setHeroType, heroVideoUrl, setHeroVideoUrl,
    ingredientsSection, setIngredientsSection, freeShipping, setFreeShipping,
    paymentMethods, setPaymentMethods, testimonials, setTestimonials, faqs, setFaqs,
    floatingWhatsApp, setFloatingWhatsApp, announcement, setAnnouncement, bannerButton, setBannerButton,
    benefits, setBenefits, socialsShowInCatalog, setSocialsShowInCatalog, schedule, setSchedule,
    whatsappTemplate, setWhatsappTemplate, copied, isSaving, isGeneratingPage, storeActive,
    storeInfo, setStoreInfo, domains, setDomains, seo, setSeo, socials, setSocials,
    policies, setPolicies, previewStore, handleImageUpload, copyStoreUrl,
    handleSaveChanges, handleAutogeneratePage, toggleStoreStatus,
  }
}

export type TiendaFormState = ReturnType<typeof useTiendaForm>
