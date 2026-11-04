import { useMemo } from 'react'
import { Store, CatalogSettings, NavLink } from '../types'
import { cn } from '@/lib/utils'
import { buildIndustryStoreBlueprint } from '@/lib/store-blueprints'

export function useCatalogSettings(store: Store) {
  const fallbackSettings = useMemo(
    () =>
      buildIndustryStoreBlueprint({
        name: store.name,
        category: store.category,
        description: store.bio,
      }).aiSettings,
    [store.name, store.category, store.bio]
  )

  const aiSettings: CatalogSettings = useMemo(() => {
    try {
      if (!store.aiSettings) return {}
      return typeof store.aiSettings === 'string'
        ? JSON.parse(store.aiSettings)
        : (store.aiSettings as CatalogSettings)
    } catch {
      return {}
    }
  }, [store.aiSettings])

  const colors = {
    primario: aiSettings.colors?.primario || fallbackSettings.colors?.primario || '#111111',
    secundario: aiSettings.colors?.secundario || fallbackSettings.colors?.secundario || '#52525B',
    acento: aiSettings.colors?.acento || fallbackSettings.colors?.acento || '#8CE5A7',
    fondo: aiSettings.colors?.fondo || fallbackSettings.colors?.fondo || '#FFFFFF',
    texto: aiSettings.colors?.texto || fallbackSettings.colors?.texto || '#111111',
  }

  const typography = aiSettings.typography || fallbackSettings.typography || 'Plus Jakarta Sans'
  const borderRadius = aiSettings.borderRadius || fallbackSettings.borderRadius || 'pill'
  const shadowStyle = aiSettings.shadowStyle || fallbackSettings.shadowStyle || 'flat'
  const headerStyle = aiSettings.headerStyle || fallbackSettings.headerStyle || 'clean-border'
  const heroStyle = aiSettings.heroStyle || fallbackSettings.heroStyle || 'waterdrop-collage'
  const heroBadge = aiSettings.heroBadge ?? fallbackSettings.heroBadge ?? ''
  const cardStyle = aiSettings.cardStyle || fallbackSettings.cardStyle || 'waterdrop-studio'
  const cardAspectRatio = aiSettings.cardAspectRatio || fallbackSettings.cardAspectRatio || 'portrait'
  const badgeStyle = aiSettings.badgeStyle || fallbackSettings.badgeStyle || 'pill'
  const catalogColumns = aiSettings.catalogColumns || fallbackSettings.catalogColumns || '4'
  const showVariantSwatches = aiSettings.showVariantSwatches !== false

  const resolvedFontFamily = useMemo(() => {
    switch (typography) {
      case 'Outfit':
        return "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      case 'Plus Jakarta Sans':
        return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      case 'Playfair Display':
        return "'Playfair Display', Georgia, serif"
      case 'Space Grotesk':
        return "'Space Grotesk', -apple-system, BlinkMacSystemFont, monospace, sans-serif"
      case 'Sora':
        return "'Sora', -apple-system, BlinkMacSystemFont, sans-serif"
      case 'Cinzel':
        return "'Cinzel', Georgia, serif"
      case 'DM Sans':
        return "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      case 'Manrope':
        return "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif"
      case 'Syne':
        return "'Syne', -apple-system, BlinkMacSystemFont, sans-serif"
      case 'Cormorant Garamond':
        return "'Cormorant Garamond', Georgia, serif"
      case 'Montserrat':
        return "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif"
      case 'Inter':
      default:
        return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }
  }, [typography])

  const radiusCard = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-2xl' : 'rounded-xl'
  const radiusButton = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-full' : 'rounded-xl'
  const radiusBadge = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-full' : 'rounded-md'
  const radiusImage = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-xl' : 'rounded-lg'

  const shadowCard =
    cardStyle === 'waterdrop-studio'
      ? 'shadow-none'
      : shadowStyle === 'flat'
        ? 'shadow-none'
        : shadowStyle === 'floating'
          ? 'shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1'
          : 'shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:-translate-y-0.5'

  const cardBgStyle =
    cardStyle === 'waterdrop-studio'
      ? 'bg-transparent border-0'
      : cardStyle === 'glass-card'
        ? 'bg-white/85 backdrop-blur-md border border-white/70'
        : cardStyle === 'clean-border'
          ? 'bg-white border border-zinc-200'
          : 'bg-white border border-zinc-200/80 hover:border-zinc-300'

  const getBadgeStyle = (_category: string) => {
    if (badgeStyle === 'solid') {
      return {
        className: cn('px-2.5 py-0.5 text-[9.5px] font-bold tracking-wide', radiusBadge),
        style: { backgroundColor: colors.acento || colors.primario, color: '#111111' },
      }
    }
    if (badgeStyle === 'outline') {
      return {
        className: cn('px-2.5 py-0.5 text-[9.5px] font-bold tracking-wide border', radiusBadge),
        style: { borderColor: `${colors.primario}35`, color: colors.texto, backgroundColor: '#FFFFFF' },
      }
    }
    return {
      className: cn('px-2.5 py-0.5 text-[9.5px] font-bold tracking-wide', radiusBadge),
      style: { backgroundColor: colors.acento || '#8CE5A7', color: '#111111' },
    }
  }

  const rawBannerUrl = store.bannerUrl || aiSettings.bannerUrl || fallbackSettings.bannerUrl || ''
  const bannerUrls = rawBannerUrl
    .split(',')
    .map(u => u.trim())
    .filter(Boolean)

  const heroPanels = useMemo(() => {
    const explicit = (aiSettings.heroPanels || []).map(u => u?.trim()).filter(Boolean) as string[]
    if (explicit.length >= 2) return explicit
    if (bannerUrls.length >= 2) return bannerUrls.slice(0, 4)
    const fallbackPanels = fallbackSettings.heroPanels || []
    const first = bannerUrls[0] || explicit[0] || fallbackPanels[0] || ''
    const rest = [
      ...(aiSettings.lifestyleGallery || []),
      ...fallbackPanels.slice(1),
      ...store.products.map(p => p.imageUrl?.split(',')[0] || ''),
    ].filter(u => u && u !== first)
    return [first, ...rest].filter(Boolean).slice(0, 4)
  }, [aiSettings.heroPanels, aiSettings.lifestyleGallery, bannerUrls, fallbackSettings.heroPanels, store.products])

  const bannerTitle = aiSettings.bannerTitle || fallbackSettings.bannerTitle || `Bienvenido a ${store.name}`
  const bannerSubtitle =
    aiSettings.bannerSubtitle ||
    fallbackSettings.bannerSubtitle ||
    'Explora nuestro catálogo oficial y realiza tu pedido de forma rápida y segura.'

  const announcement = aiSettings.announcement || fallbackSettings.announcement || {
    enabled: true,
    text: 'Envíos rápidos a todo el país | Atención inmediata por WhatsApp',
    bgColor: colors.acento || '#8CE5A7',
    textColor: '#111111',
  }

  const bannerButton = aiSettings.bannerButton || fallbackSettings.bannerButton || {
    text: 'Comprar ahora',
    action: 'scroll' as const,
    link: '',
  }

  const benefits = aiSettings.benefits || fallbackSettings.benefits || {
    items: [
      { icon: 'Truck' as const, label: 'Envíos rápidos', desc: 'Despacho ágil con guía' },
      { icon: 'ShieldCheck' as const, label: 'Compra protegida', desc: 'Pagos 100% verificados' },
      { icon: 'Clock' as const, label: 'Atención humana', desc: 'Soporte directo en WhatsApp' },
    ],
  }

  const socialsShowInCatalog = aiSettings.socialsShowInCatalog !== false

  const schedule = aiSettings.schedule || {
    enabled: false,
    text: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: true,
  }

  const heroType = aiSettings.heroType || 'image'
  const heroVideoUrl = aiSettings.heroVideoUrl || ''

  const ingredientsSection = aiSettings.ingredientsSection || {
    title: 'Calidad en Cada Detalle',
    leftTitle: 'Selección Cuidada',
    leftDesc: 'Materiales e insumos verificados para garantizar excelencia en cada entrega.',
    centerImageUrl: fallbackSettings.bannerUrl || '',
    rightTitle: 'Respaldo Garantizado',
    rightDesc: 'Acompañamiento directo antes, durante y después de tu compra.',
  }

  const freeShipping = aiSettings.freeShipping || fallbackSettings.freeShipping || {
    enabled: true,
    threshold: 120000,
  }

  const paymentMethods = {
    enabled: aiSettings.paymentMethods?.enabled !== false,
    nequi: aiSettings.paymentMethods?.nequi !== false,
    bancolombia: aiSettings.paymentMethods?.bancolombia !== false,
    contraEntrega: aiSettings.paymentMethods?.contraEntrega !== false,
    pse: aiSettings.paymentMethods?.pse !== false,
    tarjetas: aiSettings.paymentMethods?.tarjetas !== false,
    customNote:
      aiSettings.paymentMethods?.customNote ||
      fallbackSettings.paymentMethods?.customNote ||
      'Pagos 100% seguros con confirmación inmediata por WhatsApp',
  }

  const testimonials = {
    enabled: aiSettings.testimonials?.enabled !== false,
    title: aiSettings.testimonials?.title || fallbackSettings.testimonials?.title || `Clientes felices en ${store.name}`,
    subtitle: aiSettings.testimonials?.subtitle || fallbackSettings.testimonials?.subtitle || 'Calificado 4.9/5 por compradores verificados en todo el país.',
    items: aiSettings.testimonials?.items || fallbackSettings.testimonials?.items || [],
  }

  const faqs = {
    enabled: aiSettings.faqs?.enabled !== false,
    title: aiSettings.faqs?.title || fallbackSettings.faqs?.title || 'Preguntas Frecuentes',
    items: aiSettings.faqs?.items || fallbackSettings.faqs?.items || [],
  }

  const floatingWhatsApp = {
    enabled: aiSettings.floatingWhatsApp?.enabled !== false,
    message:
      aiSettings.floatingWhatsApp?.message ||
      fallbackSettings.floatingWhatsApp?.message ||
      '¿Tienes dudas con tu pedido? Chatea con un asesor aquí 👋',
    agentName:
      aiSettings.floatingWhatsApp?.agentName ||
      fallbackSettings.floatingWhatsApp?.agentName ||
      `Asesor de ${store.name}`,
  }

  const bentoHighlights = aiSettings.bentoHighlights || fallbackSettings.bentoHighlights || {
    title: 'Por Qué Elegirnos',
    items: [],
  }

  const accordionSpecs = aiSettings.accordionSpecs?.tabs || fallbackSettings.accordionSpecs?.tabs || []

  const brandStory = aiSettings.brandStory || fallbackSettings.brandStory || {
    title: `Sobre ${store.name}`,
    desc: store.bio || 'Calidad y atención cercana en cada pedido.',
    bgUrl: '',
    btnText: 'Conocer más',
    btnLink: '',
  }

  const brandStoryPage = aiSettings.brandStoryPage || fallbackSettings.brandStoryPage || {
    headerTrayectoria: 'Nuestra Esencia',
    headerPerfil: `Sobre ${store.name}`,
    narrativeP1: store.bio || '',
    narrativeP2: '',
    imageHeritage: '',
    pillarsTitle: 'Nuestros Pilares',
    pillar1Icon: '🌟',
    pillar1Title: 'Calidad',
    pillar1Desc: '',
    pillar2Icon: '📲',
    pillar2Title: 'Servicio',
    pillar2Desc: '',
  }

  const visualCategories = aiSettings.visualCategories || fallbackSettings.visualCategories || []

  const processTimeline = {
    headline:
      aiSettings.processTimeline?.headline ||
      fallbackSettings.processTimeline?.headline ||
      store.bio ||
      bannerSubtitle,
    title: aiSettings.processTimeline?.title || fallbackSettings.processTimeline?.title || `Así funciona ${store.name}`,
    items: (aiSettings.processTimeline?.items || fallbackSettings.processTimeline?.items || []).map((it, idx) => ({
      step: it.step || `0${idx + 1}`,
      title: it.title,
      desc: it.desc,
      imageUrl: it.imageUrl || fallbackSettings.processTimeline?.items?.[idx]?.imageUrl || bannerUrls[0] || '',
    })),
  }

  const ambassadors = {
    title: aiSettings.ambassadors?.title || fallbackSettings.ambassadors?.title || 'Recomendado por nuestra comunidad',
    subtitle: aiSettings.ambassadors?.subtitle || fallbackSettings.ambassadors?.subtitle || '',
    items: aiSettings.ambassadors?.items || fallbackSettings.ambassadors?.items || [],
  }

  const pressLogos = aiSettings.pressLogos || fallbackSettings.pressLogos || []

  const retailers = {
    title: aiSettings.retailers?.title || fallbackSettings.retailers?.title || 'Cobertura & Canales Oficiales',
    subtitle: aiSettings.retailers?.subtitle || fallbackSettings.retailers?.subtitle || '',
    ctaText: aiSettings.retailers?.ctaText || fallbackSettings.retailers?.ctaText || 'Consultar cobertura',
    items: aiSettings.retailers?.items || fallbackSettings.retailers?.items || [],
  }

  const lifestyleGallery = aiSettings.lifestyleGallery || fallbackSettings.lifestyleGallery || []
  const ugcGallery = aiSettings.ugcGallery || fallbackSettings.ugcGallery || lifestyleGallery

  const newsletterWidget = aiSettings.newsletterWidget || fallbackSettings.newsletterWidget || {
    title: `Promociones y novedades de ${store.name}`,
    subtitle: 'Recibe acceso anticipado a lanzamientos y beneficios exclusivos.',
    placeholder: 'Tu correo electrónico',
    btnText: 'Suscribirme ahora',
    bgColor: colors.primario,
    textColor: '#FFFFFF',
  }

  const policies = {
    terms: aiSettings.policies?.terms || '',
    refunds: aiSettings.policies?.refunds || '',
  }

  const navbarLinks: NavLink[] = aiSettings.navbarLinks || [
    { label: 'Inicio', action: 'scroll-banner', link: '' },
    { label: 'Productos', action: 'scroll-products', link: '' },
    { label: 'Historia', action: 'scroll-story', link: '' },
    { label: 'Contacto', action: 'whatsapp', link: '' },
  ]

  const rawSec = aiSettings.sections || {}
  const testimonialsVisible =
    rawSec.testimonials !== undefined ? rawSec.testimonials !== false : rawSec.testimonios !== false
  const newsletterVisible =
    rawSec.newsletterWidget !== undefined ? rawSec.newsletterWidget !== false : rawSec.newsletter !== false

  const sections = {
    banner: rawSec.banner !== false,
    destacados: rawSec.destacados !== false,
    categorias: rawSec.categorias !== false,
    editorialCategories: rawSec.editorialCategories !== false,
    beneficios: rawSec.beneficios !== false,
    processTimeline: rawSec.processTimeline !== false,
    pressLogos: rawSec.pressLogos !== false,
    ambassadors: rawSec.ambassadors !== false,
    ugcGallery: rawSec.ugcGallery !== false,
    retailers: rawSec.retailers !== false,
    testimonials: testimonialsVisible,
    newsletterWidget: newsletterVisible,
    paymentMethods: rawSec.paymentMethods !== false,
    faqs: rawSec.faqs !== false,
    floatingWhatsApp: rawSec.floatingWhatsApp !== false,
    bentoHighlights: rawSec.bentoHighlights === true,
    accordionSpecs: rawSec.accordionSpecs === true,
    brandStory: rawSec.brandStory === true,
    visualCategories: rawSec.visualCategories === true,
    lifestyleGallery: rawSec.lifestyleGallery === true,
    ingredientsSection: rawSec.ingredientsSection === true,
  }

  const formattedStoreName = store.name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    aiSettings,
    colors,
    typography,
    resolvedFontFamily,
    borderRadius,
    radiusCard,
    radiusButton,
    radiusBadge,
    radiusImage,
    shadowCard,
    cardBgStyle,
    getBadgeStyle,
    headerStyle,
    heroStyle,
    heroBadge,
    heroPanels,
    heroType,
    heroVideoUrl,
    cardStyle,
    cardAspectRatio,
    badgeStyle,
    catalogColumns,
    showVariantSwatches,
    bannerUrls,
    bannerTitle,
    bannerSubtitle,
    announcement,
    bannerButton,
    benefits,
    socialsShowInCatalog,
    schedule,
    ingredientsSection,
    freeShipping,
    paymentMethods,
    testimonials,
    faqs,
    floatingWhatsApp,
    bentoHighlights,
    accordionSpecs,
    brandStory,
    brandStoryPage,
    visualCategories,
    processTimeline,
    ambassadors,
    pressLogos,
    retailers,
    ugcGallery,
    lifestyleGallery,
    newsletterWidget,
    policies,
    navbarLinks,
    sections,
    formattedStoreName,
  }
}

export type CatalogResolvedSettings = ReturnType<typeof useCatalogSettings>
