import { useMemo } from 'react'
import { Store, CatalogSettings, NavLink } from '../types'
import { cn } from '@/lib/utils'

export function useCatalogSettings(store: Store) {
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
    primario: aiSettings.colors?.primario || '#059669',
    secundario: aiSettings.colors?.secundario || '#047857',
    acento: aiSettings.colors?.acento || '#10B981',
    fondo: aiSettings.colors?.fondo || '#FAFAFA',
    texto: aiSettings.colors?.texto || '#18181B',
  }

  const typography = aiSettings.typography || 'Inter'
  const borderRadius = aiSettings.borderRadius || 'smooth'
  const shadowStyle = aiSettings.shadowStyle || 'soft'
  const headerStyle = aiSettings.headerStyle || 'clean-border'
  const heroStyle = aiSettings.heroStyle || 'cinematic-overlay'
  const heroBadge = aiSettings.heroBadge || ''
  const cardStyle = aiSettings.cardStyle || 'minimal-elevated'
  const cardAspectRatio = aiSettings.cardAspectRatio || 'square'
  const badgeStyle = aiSettings.badgeStyle || 'pill'
  const catalogColumns = aiSettings.catalogColumns || '4'

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
      case 'Inter':
      default:
        return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }
  }, [typography])

  const radiusCard = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-3xl' : 'rounded-2xl'
  const radiusButton = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-full' : 'rounded-xl'
  const radiusBadge = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-full' : 'rounded-lg'
  const radiusImage = borderRadius === 'sharp' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-2xl' : 'rounded-xl'

  const shadowCard = shadowStyle === 'flat' 
    ? 'shadow-none' 
    : shadowStyle === 'floating' 
      ? 'shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1' 
      : 'shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:-translate-y-0.5'

  const cardBgStyle = cardStyle === 'glass-card'
    ? 'bg-white/85 backdrop-blur-md border border-white/70'
    : cardStyle === 'clean-border'
      ? 'bg-white border border-zinc-200'
      : 'bg-white border border-zinc-150/80 hover:border-zinc-300'

  const getBadgeStyle = (category: string) => {
    if (badgeStyle === 'solid') {
      return {
        className: cn("px-2.5 py-1 text-[9px] font-black uppercase tracking-wider", radiusBadge),
        style: { backgroundColor: colors.primario, color: '#FFFFFF' }
      }
    }
    if (badgeStyle === 'outline') {
      return {
        className: cn("px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border", radiusBadge),
        style: { borderColor: `${colors.primario}60`, color: colors.primario, backgroundColor: `${colors.fondo}` }
      }
    }
    return {
      className: cn("px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide backdrop-blur-sm", radiusBadge),
      style: { backgroundColor: `${colors.primario}18`, color: colors.primario }
    }
  }

  const rawBannerUrl = store.bannerUrl || aiSettings.bannerUrl || ''
  const bannerUrls = rawBannerUrl.split(',').map(u => u.trim()).filter(Boolean)
  const bannerTitle = aiSettings.bannerTitle || 'El mejor café, directo a tu puerta'
  const bannerSubtitle = aiSettings.bannerSubtitle || 'Descubre nuestros productos de especialidad cultivados con amor y tostados frescos.'

  const announcement = aiSettings.announcement || {
    enabled: false,
    text: '',
    bgColor: '#059669',
    textColor: '#FFFFFF'
  }

  const bannerButton = aiSettings.bannerButton || {
    text: 'Ver productos',
    action: 'scroll' as const,
    link: ''
  }

  const benefits = aiSettings.benefits || {
    items: [
      { icon: 'Truck' as const, label: 'Envíos rápidos', desc: 'A todo el país' },
      { icon: 'ShieldCheck' as const, label: 'Pagos seguros', desc: 'Múltiples métodos' },
      { icon: 'Award' as const, label: 'Café de calidad', desc: 'Granos seleccionados' },
      { icon: 'Clock' as const, label: 'Atención 24/7', desc: 'Siempre disponibles' }
    ]
  }

  const socialsShowInCatalog = aiSettings.socialsShowInCatalog !== false

  const schedule = aiSettings.schedule || {
    enabled: false,
    text: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: true
  }

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
    enabled: true,
    threshold: 100000
  }

  const paymentMethods = {
    enabled: aiSettings.paymentMethods?.enabled !== false,
    nequi: aiSettings.paymentMethods?.nequi !== false,
    bancolombia: aiSettings.paymentMethods?.bancolombia !== false,
    contraEntrega: aiSettings.paymentMethods?.contraEntrega !== false,
    pse: aiSettings.paymentMethods?.pse !== false,
    tarjetas: aiSettings.paymentMethods?.tarjetas !== false,
    customNote: aiSettings.paymentMethods?.customNote || 'Pagos 100% seguros con confirmación instantánea por WhatsApp'
  }

  const testimonials = {
    enabled: aiSettings.testimonials?.enabled !== false,
    title: aiSettings.testimonials?.title || 'Lo que dicen nuestros clientes',
    subtitle: aiSettings.testimonials?.subtitle || 'Compradores reales que confían en nosotros día a día',
    items: aiSettings.testimonials?.items || [
      { name: 'Carolina Martínez', city: 'Bogotá', stars: 5, comment: 'Excelente calidad y la atención por WhatsApp fue de 10. Mi pedido llegó al día siguiente.' },
      { name: 'Andrés Rincón', city: 'Medellín', stars: 5, comment: 'Súper rápido y confiable. Pagué contra entrega y el producto venía perfectamente empacado.' },
      { name: 'Mariana Gómez', city: 'Cali', stars: 5, comment: 'Tenía dudas sobre mi talla y me asesoraron súper bien por chat. Ya he comprado 3 veces.' }
    ]
  }

  const faqs = {
    enabled: aiSettings.faqs?.enabled !== false,
    title: aiSettings.faqs?.title || 'Preguntas Frecuentes',
    items: aiSettings.faqs?.items || [
      { q: '¿Cómo realizo mi pedido y pago?', a: 'Elige tus productos, añade tu dirección y al confirmar se abrirá tu WhatsApp con el pedido listo. Puedes pagar por Nequi, Bancolombia, PSE, tarjeta o pago contra entrega según cobertura.' },
      { q: '¿Cuánto tiempo tarda en llegar?', a: 'Despachamos en 24 a 48 horas hábiles a ciudades principales. Te compartimos la guía de rastreo por WhatsApp.' },
      { q: '¿Tienen garantía los productos?', a: 'Sí, todos nuestros artículos cuentan con garantía directa de satisfacción. Si tienes cualquier inconveniente, te respondemos de inmediato.' }
    ]
  }

  const floatingWhatsApp = {
    enabled: aiSettings.floatingWhatsApp?.enabled !== false,
    message: aiSettings.floatingWhatsApp?.message || '¿Tienes dudas con tu pedido? Chatea con un asesor aquí 👋',
    agentName: aiSettings.floatingWhatsApp?.agentName || 'Asesor en línea'
  }

  const bentoHighlights = aiSettings.bentoHighlights || {
    title: 'Nuestros Ingredientes Premium',
    items: [
      { emoji: '🌴', title: 'Dátiles de Faraón', desc: 'Dulces, carnosos y naturales' },
      { emoji: '🥜', title: 'Almendras Tostadas', desc: 'Crujientes y seleccionadas a mano' },
      { emoji: '🍫', title: 'Chocolate Belga', desc: 'Cobertura suave de cacao puro' }
    ]
  }

  const accordionSpecs = aiSettings.accordionSpecs?.tabs || [
    { title: 'Ficha Nutricional', content: 'Calorías: 140 kcal | Grasas: 4g | Carbohidratos: 22g | Proteínas: 2g por porción.' },
    { title: 'Método de Envío', content: 'Empacado con tecnología térmica para conservar el chocolate fresco hasta tu puerta.' }
  ]

  const brandStory = aiSettings.brandStory || {
    title: 'Nuestra Historia de Sabor',
    desc: 'Fundada con la visión de combinar frutos del desierto y chocolate fino, creamos una experiencia única de confitería artesanal.',
    bgUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=800&auto=format&fit=crop',
    btnText: 'Saber más',
    btnLink: ''
  }

  const brandStoryPage = aiSettings.brandStoryPage || {
    headerTrayectoria: 'Nuestra Trayectoria',
    headerPerfil: 'Perfil de la Empresa',
    narrativeP1: 'Fundada en 1992 por el visionario Fawaz Masri, Chocodate nació en el corazón de los Emiratos Árabes Unidos con una misión singular: elevar la humilde y nutritiva fruta del dátil de Arabia a una experiencia de confitería de clase mundial.',
    narrativeP2: 'Al combinar el dulzor natural y la riqueza en fibra de los mejores dátiles seleccionados a mano con el crujido de una almendra tostada en su interior, y envolverlo todo en una generosa capa de chocolate belga prémium, creamos una golosina única que trasciende fronteras. Hoy en día, nuestros productos se disfrutan en más de 50 países alrededor del mundo.',
    imageHeritage: 'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=800&auto=format&fit=crop',
    pillarsTitle: 'Nuestras Dos Grandes Columnas',
    pillar1Icon: '🏭',
    pillar1Title: 'Fábrica La Ronda (Dubái, EAU)',
    pillar1Desc: 'Nuestra planta principal con tecnología de punta dedicada exclusivamente al procesamiento de dátiles frescos, tostado de almendras y la formulación del chocolate belga. Cumple con las más estrictas certificaciones internacionales de calidad alimentaria (HACCP, ISO 22000 y Halal).',
    pillar2Icon: '🌴',
    pillar2Title: 'Star Foods (KSA)',
    pillar2Desc: 'Nuestra sucursal agrícola y de procesamiento ubicada en Arabia Saudita, encargada de la recolección y selección de los dátiles en su momento justo de maduración, garantizando una cadena de suministro sostenible y local.',
  }

  const visualCategories = aiSettings.visualCategories || [
    { category: 'Café', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop' },
    { category: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop' },
    { category: 'Combos', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop' }
  ]

  const processTimeline = aiSettings.processTimeline || {
    title: '¿Cómo Comprar en Flashcheckouts?',
    items: [
      { step: '1', title: 'Explora y Agrega', desc: 'Selecciona tus productos favoritos del catálogo y agrégalos al carrito.' },
      { step: '2', title: 'Datos de Envío', desc: 'Ingresa tu dirección de entrega y ubícate en el mapa interactivo.' },
      { step: '3', title: 'Completa en WhatsApp', desc: 'Finaliza el pedido enviando el mensaje estructurado de WhatsApp al vendedor.' }
    ]
  }

  const lifestyleGallery = aiSettings.lifestyleGallery || [
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop'
  ]

  const newsletterWidget = aiSettings.newsletterWidget || {
    title: 'Únete a Nuestro Club Gourmet',
    subtitle: 'Entérate antes que nadie de nuestros lanzamientos, descuentos exclusivos y recetas especiales.',
    placeholder: 'Ingresa tu correo electrónico',
    btnText: 'Suscribirme',
    bgColor: '#111827',
    textColor: '#FFFFFF'
  }

  const navbarLinks: NavLink[] = aiSettings.navbarLinks || [
    { label: 'Inicio', action: 'scroll-banner', link: '' },
    { label: 'Productos', action: 'scroll-products', link: '' },
    { label: 'Historia', action: 'scroll-story', link: '' },
    { label: 'Contacto', action: 'whatsapp', link: '' }
  ]

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
    ingredientsSection: aiSettings.sections?.ingredientsSection === true,
    paymentMethods: aiSettings.sections?.paymentMethods !== false,
    testimonials: aiSettings.sections?.testimonials !== false,
    faqs: aiSettings.sections?.faqs !== false,
    floatingWhatsApp: aiSettings.sections?.floatingWhatsApp !== false
  }

  const formattedStoreName = store.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

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
    heroType,
    heroVideoUrl,
    cardStyle,
    cardAspectRatio,
    badgeStyle,
    catalogColumns,
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
    lifestyleGallery,
    newsletterWidget,
    navbarLinks,
    sections,
    formattedStoreName
  }
}

export type CatalogResolvedSettings = ReturnType<typeof useCatalogSettings>
