import { PRESETS, type TiendaSettings } from '@/components/tienda/types'
import { LIFESTYLE_TEMPLATES } from './store-blueprints/templates-lifestyle'
import { SPECIALIZED_TEMPLATES } from './store-blueprints/templates-specialized'
import type {
  BusinessCategoryId,
  GeneratedBusinessProfile,
  GeneratedStorePackage,
  IndustryTemplate,
} from './store-blueprints/types'

export type { BusinessCategoryId, GeneratedBusinessProfile, GeneratedStorePackage }

const TEMPLATES: Record<BusinessCategoryId, IndustryTemplate> = {
  ...LIFESTYLE_TEMPLATES,
  ...SPECIALIZED_TEMPLATES,
}

export function resolveBusinessCategory(
  rawCategory?: string | null,
  description?: string | null
): BusinessCategoryId {
  const cat = (rawCategory || '').trim()
  if (cat in TEMPLATES && cat !== 'Otros') {
    return cat as BusinessCategoryId
  }

  const text = `${cat} ${description || ''}`.toLowerCase()
  if (/(ropa|moda|vestido|camis|calzado|zapato|tenis|boutique|streetwear|jean|hoodie)/.test(text)) return 'Moda'
  if (/(comida|restaurante|cafe|café|pastel|postre|panader|hamburgues|pizza|sushi|gourmet|bebida|chocolate|snack)/.test(text)) return 'Comida'
  if (/(belleza|skincare|maquillaje|cosmet|cosmét|perfume|capilar|spa|uñas|barber)/.test(text)) return 'Belleza'
  if (/(tecno|celular|iphone|comput|laptop|audio|audifono|audífono|gadget|gamer|electr)/.test(text)) return 'Tecnología'
  if (/(joya|joyer|anillo|collar|reloj|accesorio|plata|oro|bisuter)/.test(text)) return 'Joyería'
  if (/(hogar|mueble|decora|cocina|sabana|sábana|colchon|colchón|lampara|lámpara|planta)/.test(text)) return 'Hogar'
  if (/(deporte|fitness|gym|gimnasio|suplemento|proteina|proteína|ciclismo|running)/.test(text)) return 'Deportes'
  if (/(mascota|perro|gato|veterinar|pet|concentrado)/.test(text)) return 'Mascotas'

  return cat in TEMPLATES ? (cat as BusinessCategoryId) : 'Otros'
}

export function buildIndustryStoreBlueprint(params: {
  name: string
  category?: string | null
  description?: string | null
}): GeneratedStorePackage {
  const cleanName = params.name.trim() || 'Mi Negocio'
  const cleanDesc = params.description?.trim() || ''
  const resolvedCategory = resolveBusinessCategory(params.category, cleanDesc)
  const tpl = TEMPLATES[resolvedCategory]

  const lowerDesc = cleanDesc.toLowerCase()
  const overridePresetId =
    resolvedCategory === 'Moda' && /(urbano|streetwear|oversize|sneaker|gorra|hoodie)/.test(lowerDesc)
      ? 'streetwear'
      : tpl.presetId === 'midnight'
        ? 'waterdrop'
        : tpl.presetId

  const preset = PRESETS.find(p => p.id === overridePresetId) || PRESETS[0]
  const bio = tpl.bio(cleanName, cleanDesc)
  const niche = cleanDesc || tpl.nicheFallback

  const heroPanels = [
    tpl.bannerUrl,
    tpl.lifestyleGallery[0] || tpl.bannerUrl,
    tpl.visualCategories[0]?.imageUrl || tpl.bannerUrl,
    tpl.lifestyleGallery[1] || tpl.heritageImg,
  ].filter(Boolean)

  const ugcGallery = [
    ...tpl.lifestyleGallery,
    ...tpl.visualCategories.map(v => v.imageUrl),
    tpl.brandStoryBg,
    tpl.heritageImg,
    tpl.bannerUrl,
  ].filter(Boolean)

  const aiSettings: TiendaSettings = {
    themePreset: preset.id,
    colors: { ...preset.colors },
    typography: preset.typography,
    borderRadius: 'pill',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'waterdrop-collage',
    heroBadge: tpl.heroBadge,
    heroPanels,
    cardStyle: 'waterdrop-studio',
    cardAspectRatio: preset.cardAspectRatio,
    badgeStyle: 'pill',
    catalogColumns: '4',
    showVariantSwatches: true,
    heroType: 'image',
    bannerUrl: tpl.bannerUrl,
    bannerTitle: tpl.bannerTitle(cleanName),
    bannerSubtitle: tpl.bannerSubtitle(cleanName, cleanDesc),
    bannerButton: {
      text: 'Comprar ahora',
      action: 'scroll',
      link: '',
    },
    announcement: {
      enabled: true,
      text: `${tpl.announcementText} | Pagos seguros y contra entrega | Atención inmediata por WhatsApp`,
      bgColor: preset.colors.acento || '#8CE5A7',
      textColor: '#111111',
    },
    sections: {
      banner: true,
      destacados: true,
      categorias: true,
      editorialCategories: true,
      beneficios: true,
      bentoHighlights: false,
      accordionSpecs: false,
      brandStory: false,
      visualCategories: false,
      processTimeline: true,
      pressLogos: true,
      ambassadors: true,
      ugcGallery: true,
      retailers: true,
      lifestyleGallery: false,
      newsletterWidget: true,
      ingredientsSection: false,
      paymentMethods: true,
      testimonials: true,
      faqs: true,
      floatingWhatsApp: true,
    },
    benefits: { items: tpl.benefits },
    bentoHighlights: {
      title: tpl.bentoTitle,
      items: tpl.bentoItems,
    },
    visualCategories: tpl.visualCategories,
    processTimeline: {
      headline: tpl.bannerSubtitle(cleanName, cleanDesc),
      title: `Así se vive la experiencia ${cleanName}`,
      items: [
        {
          step: '01',
          title: tpl.bentoItems[0]?.title || '1. Explora',
          desc: tpl.bentoItems[0]?.desc || 'Elige tus favoritos con disponibilidad en tiempo real.',
          imageUrl: tpl.visualCategories[0]?.imageUrl || tpl.lifestyleGallery[0] || tpl.bannerUrl,
        },
        {
          step: '02',
          title: tpl.bentoItems[1]?.title || '2. Personaliza',
          desc: tpl.bentoItems[1]?.desc || 'Selecciona tus opciones ideales con asesoría experta.',
          imageUrl: tpl.visualCategories[1]?.imageUrl || tpl.lifestyleGallery[1] || tpl.heritageImg,
        },
        {
          step: '03',
          title: tpl.bentoItems[2]?.title || '3. Disfruta',
          desc: tpl.bentoItems[2]?.desc || 'Recibe rápido en tu puerta con respaldo garantizado.',
          imageUrl: tpl.visualCategories[2]?.imageUrl || tpl.lifestyleGallery[2] || tpl.brandStoryBg,
        },
      ],
    },
    pressLogos: [
      { name: 'VOGUE', subtitle: 'Selección Editorial' },
      { name: 'FORBES', subtitle: 'Comercio Digital' },
      { name: 'GQ', subtitle: 'Diseño & Calidad' },
      { name: 'ELLE', subtitle: 'Tendencia Local' },
      { name: 'TRUSTED', subtitle: '4.9★ Verificado' },
    ],
    ambassadors: {
      title: 'Recomendado por nuestra comunidad',
      subtitle: 'Personas reales y especialistas que eligen nuestra marca todos los días',
      items: [
        {
          name: tpl.testimonials[0]?.name || 'Camila Restrepo',
          role: tpl.testimonials[0]?.city || 'Medellín',
          imageUrl: tpl.lifestyleGallery[0] || tpl.bannerUrl,
        },
        {
          name: tpl.testimonials[1]?.name || 'Sebastián Pardo',
          role: tpl.testimonials[1]?.city || 'Bogotá',
          imageUrl: tpl.lifestyleGallery[1] || tpl.heritageImg,
        },
        {
          name: tpl.testimonials[2]?.name || 'Valentina Mejía',
          role: tpl.testimonials[2]?.city || 'Cali',
          imageUrl: tpl.lifestyleGallery[2] || tpl.brandStoryBg,
        },
        {
          name: 'Andrés Morales',
          role: 'Cliente frecuente',
          imageUrl: tpl.lifestyleGallery[3] || tpl.visualCategories[0]?.imageUrl || tpl.bannerUrl,
        },
      ],
    },
    ugcGallery,
    retailers: {
      title: 'Cobertura & Canales Oficiales',
      subtitle: `Compra directo en ${cleanName} con despacho prioritario en todo el país.`,
      ctaText: 'Consultar cobertura por WhatsApp',
      items: [
        { name: 'Bogotá & Sabana', badge: 'Entrega 24h' },
        { name: 'Medellín & Área Met.', badge: 'Entrega 24h' },
        { name: 'Cali, Eje & Costa', badge: '24–48h Express' },
        { name: 'WhatsApp Oficial', badge: 'Atención VIP' },
      ],
    },
    lifestyleGallery: tpl.lifestyleGallery,
    accordionSpecs: { tabs: tpl.accordionTabs },
    brandStory: {
      title: tpl.brandStoryTitle(cleanName),
      desc: tpl.brandStoryDesc(cleanName, cleanDesc),
      bgUrl: tpl.brandStoryBg,
      btnText: 'Conocer nuestra historia',
      btnLink: '',
    },
    brandStoryPage: {
      headerTrayectoria: 'Nuestra Esencia',
      headerPerfil: `Sobre ${cleanName}`,
      narrativeP1: tpl.brandStoryDesc(cleanName, cleanDesc),
      narrativeP2: `En ${cleanName} combinamos atención cercana por WhatsApp con un catálogo ágil para que cada cliente disfrute una experiencia confiable de principio a fin.`,
      imageHeritage: tpl.heritageImg,
      pillarsTitle: 'Nuestros Pilares',
      pillar1Icon: tpl.pillar1.icon,
      pillar1Title: tpl.pillar1.title,
      pillar1Desc: tpl.pillar1.desc,
      pillar2Icon: tpl.pillar2.icon,
      pillar2Title: tpl.pillar2.title,
      pillar2Desc: tpl.pillar2.desc,
      leadership: [],
      values: tpl.values,
    },
    newsletterWidget: {
      title: tpl.newsletterTitle(cleanName),
      subtitle: tpl.newsletterSubtitle,
      placeholder: 'Tu correo electrónico',
      btnText: 'Suscribirme ahora',
      bgColor: preset.colors.primario,
      textColor: '#FFFFFF',
    },
    navbarLinks: [
      { label: 'Inicio', action: 'scroll-banner', link: '' },
      { label: 'Productos', action: 'scroll-products', link: '' },
      { label: 'Historia', action: 'scroll-story', link: '' },
      { label: 'Contacto', action: 'whatsapp', link: '' },
    ],
    freeShipping: {
      enabled: true,
      threshold: 120000,
    },
    paymentMethods: {
      enabled: true,
      nequi: true,
      bancolombia: true,
      contraEntrega: true,
      pse: true,
      tarjetas: true,
      customNote: `Pagos verificados y confirmación inmediata con ${cleanName} por WhatsApp.`,
    },
    testimonials: {
      enabled: true,
      title: `Miles de clientes felices en ${cleanName}`,
      subtitle: 'Calificado 4.9/5 por compradores verificados en todo el país.',
      items: tpl.testimonials,
    },
    faqs: {
      enabled: true,
      title: 'Preguntas Frecuentes',
      items: tpl.faqs,
    },
    floatingWhatsApp: {
      enabled: true,
      message: `¿Tienes dudas sobre algún producto de ${cleanName}? Escríbenos aquí 👋`,
      agentName: `Asesor de ${cleanName}`,
    },
    seo: {
      title: `${cleanName} | Tienda Oficial Online`,
      desc: bio,
    },
  }

  const welcomeMessage = `¡Hola! 👋 Bienvenido a *${cleanName}*. ${
    cleanDesc ? `Somos especialistas en ${cleanDesc.charAt(0).toLowerCase() + cleanDesc.slice(1).replace(/\.$/, '')}. ` : ''
  }¿En qué te podemos asesorar hoy?`

  const systemPrompt = `Eres Nova, el asesor comercial oficial de ${cleanName} (${niche}). Tu tono de marca es "${tpl.brandTone}". Ayuda al cliente a resolver dudas sobre el catálogo, recomienda opciones ideales según lo que busca y guíalo de forma amable y concisa a completar su pedido.`

  return {
    bio,
    welcomeMessage,
    systemPrompt,
    businessProfile: {
      niche,
      targetAudience: tpl.targetAudience,
      brandTone: tpl.brandTone,
      coreProposition: bio,
    },
    aiSettings,
  }
}
