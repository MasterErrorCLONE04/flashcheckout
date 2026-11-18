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
  const text = `${description || ''}`.toLowerCase()
  // Si la descripción o prompt tiene palabras clave explícitas, tienen prioridad sobre la categoría guardada
  if (/(comida|restaurante|cafe|café|coffee|pastel|postre|panader|hamburgues|pizza|sushi|gourmet|bebida|chocolate|snack|grano|tostado)/.test(text)) return 'Comida'
  if (/(belleza|skincare|maquillaje|cosmet|cosmét|perfume|capilar|spa|uñas|barber|facial|crema|suero)/.test(text)) return 'Belleza'
  if (/(tecno|celular|iphone|comput|laptop|audio|audifono|audífono|gadget|gamer|electr|auricular|smartwatch)/.test(text)) return 'Tecnología'
  if (/(joya|joyer|anillo|collar|reloj|accesorio|plata|oro|bisuter|diamante|aretes|pulsera)/.test(text)) return 'Joyería'
  if (/(hogar|mueble|decora|cocina|sabana|sábana|colchon|colchón|lampara|lámpara|planta|vajilla)/.test(text)) return 'Hogar'
  if (/(deporte|fitness|gym|gimnasio|suplemento|proteina|proteína|ciclismo|running|entrenam|pesa)/.test(text)) return 'Deportes'
  if (/(mascota|perro|gato|veterinar|pet|concentrado|cachorro)/.test(text)) return 'Mascotas'
  if (/(ropa|moda|vestido|camis|calzado|zapato|tenis|boutique|streetwear|jean|hoodie|textil)/.test(text)) return 'Moda'

  const cat = (rawCategory || '').trim()
  if (cat in TEMPLATES && cat !== 'Otros') {
    return cat as BusinessCategoryId
  }

  return 'Otros'
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
  const isCoffee = /(cafe|café|coffee|tueste|origen|grano|barista|prensa|filtrado)/.test(lowerDesc)
  const isStreetwear = /(urbano|streetwear|oversize|sneaker|gorra|hoodie)/.test(lowerDesc)

  const overridePresetId =
    isCoffee
      ? 'artisan-warm'
      : isStreetwear
        ? 'streetwear'
        : tpl.presetId === 'midnight'
          ? 'waterdrop'
          : tpl.presetId

  const preset = PRESETS.find(p => p.id === overridePresetId) || PRESETS[0]
  const bio = isCoffee
    ? `${cleanName}: café de especialidad de origen colombiano, tueste artesanal y envíos a todo el país.`
    : tpl.bio(cleanName, cleanDesc)
  const niche = cleanDesc || tpl.nicheFallback

  const bannerUrl = isCoffee
    ? 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop'
    : isStreetwear
      ? 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop'
      : tpl.bannerUrl

  const heroPanels = isCoffee
    ? [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop',
      ]
    : isStreetwear
      ? [
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
        ]
      : [
          tpl.bannerUrl,
          tpl.lifestyleGallery[0] || tpl.bannerUrl,
          tpl.visualCategories[0]?.imageUrl || tpl.bannerUrl,
          tpl.lifestyleGallery[1] || tpl.heritageImg,
        ].filter(Boolean)

  const visualCategories = isCoffee
    ? [
        { category: 'Café de Origen', imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=400&auto=format&fit=crop' },
        { category: 'Tueste por Lotes', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop' },
        { category: 'Métodos de Filtrado', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop' },
        { category: 'Kits & Degustación', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop' },
      ]
    : isStreetwear
      ? [
          { category: 'Hoodies Oversize', imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop' },
          { category: 'Graphic Tees', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop' },
          { category: 'Pantalones Cargo', imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=400&auto=format&fit=crop' },
          { category: 'Accesorios & Caps', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop' },
        ]
      : tpl.visualCategories

  const lifestyleGallery = isCoffee
    ? [
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
      ]
    : isStreetwear
      ? [
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop',
        ]
      : tpl.lifestyleGallery

  const brandStoryBg = isCoffee
    ? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop'
    : isStreetwear
      ? 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop'
      : tpl.brandStoryBg

  const heritageImg = isCoffee
    ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop'
    : isStreetwear
      ? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop'
      : tpl.heritageImg

  const ugcGallery = [
    ...lifestyleGallery,
    ...visualCategories.map(v => v.imageUrl),
    brandStoryBg,
    heritageImg,
    bannerUrl,
  ].filter(Boolean)

  const pressLogosByCategory: Record<BusinessCategoryId, Array<{ name: string; subtitle: string }>> = {
    Moda: [
      { name: 'VOGUE', subtitle: 'Selección Editorial' },
      { name: 'FORBES', subtitle: 'Comercio Digital' },
      { name: 'GQ', subtitle: 'Diseño & Calidad' },
      { name: 'ELLE', subtitle: 'Tendencia Local' },
      { name: 'TRUSTED', subtitle: '4.9★ Verificado' },
    ],
    Comida: [
      { name: 'SPECIALTY COFFEE', subtitle: 'Origen Certificado' },
      { name: 'MICHELIN GUIDE', subtitle: 'Recomendación' },
      { name: 'TASTE ATLAS', subtitle: 'Sabor Auténtico' },
      { name: 'FORBES GOURMET', subtitle: 'Selección Premium' },
      { name: '5★ FRESH', subtitle: 'Receta del Día' },
    ],
    Belleza: [
      { name: 'VOGUE BEAUTY', subtitle: 'Fórmula Limpia' },
      { name: 'GLAMOUR', subtitle: 'Eficacia Clínica' },
      { name: 'ELLE', subtitle: 'Rutina Diaria' },
      { name: 'DERMA TEST', subtitle: '100% Seguro' },
      { name: 'CRUELTY FREE', subtitle: 'Ética Certificada' },
    ],
    Joyería: [
      { name: 'VOGUE JEWELS', subtitle: 'Alta Joyería' },
      { name: 'HARPER’S BAZAAR', subtitle: 'Diseño Exclusivo' },
      { name: 'ELLE LUXE', subtitle: 'Piezas Eternas' },
      { name: 'GOLD STANDARD', subtitle: 'Oro & Ley Verificada' },
      { name: 'EDITORIAL 5★', subtitle: 'Garantía Total' },
    ],
    Tecnología: [
      { name: 'WIRED', subtitle: 'Tecnología Top' },
      { name: 'TECHCRUNCH', subtitle: 'Innovación 2026' },
      { name: 'THE VERGE', subtitle: 'Rendimiento Pro' },
      { name: 'XATAKA', subtitle: 'Compra Inteligente' },
      { name: 'GARANTÍA 12M', subtitle: 'Soporte Directo' },
    ],
    Hogar: [
      { name: 'ARCHITECTURAL DIGEST', subtitle: 'Interiorismo' },
      { name: 'ELLE DECOR', subtitle: 'Espacios Vivos' },
      { name: 'DWELL', subtitle: 'Diseño Moderno' },
      { name: 'CASAS & DISEÑO', subtitle: 'Ambientes Cálidos' },
      { name: 'GARANTÍA HOGAR', subtitle: 'Materiales Nobles' },
    ],
    Deportes: [
      { name: 'MEN’S HEALTH', subtitle: 'Nutrición Limpia' },
      { name: 'WOMEN’S HEALTH', subtitle: 'Bienestar Diario' },
      { name: 'FITNESS LAB', subtitle: 'Rendimiento Puro' },
      { name: 'BIO CERTIFIED', subtitle: '0% Aditivos' },
      { name: 'TRUSTED 4.9★', subtitle: 'Comunidad Activa' },
    ],
    Mascotas: [
      { name: 'PET HEALTH', subtitle: 'Nutrición Vet' },
      { name: 'DOG MAGAZINE', subtitle: 'Bienestar Animal' },
      { name: 'CAT LIFE', subtitle: 'Confort Premium' },
      { name: '100% SEGURO', subtitle: 'Libre de Tóxicos' },
      { name: 'HAPPY PETS', subtitle: '5★ Aprobado' },
    ],
    Otros: [
      { name: 'FORBES', subtitle: 'Comercio Digital' },
      { name: 'VOGUE', subtitle: 'Selección Editorial' },
      { name: 'GQ', subtitle: 'Diseño & Calidad' },
      { name: 'TRUSTED', subtitle: '4.9★ Verificado' },
      { name: 'CALIDAD TOTAL', subtitle: 'Compra Segura' },
    ],
  }

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
      bentoHighlights: true,
      accordionSpecs: false,
      brandStory: true,
      visualCategories: true,
      processTimeline: true,
      pressLogos: true,
      ambassadors: true,
      ugcGallery: true,
      retailers: true,
      lifestyleGallery: true,
      newsletterWidget: true,
      ingredientsSection: true,
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
    pressLogos: pressLogosByCategory[resolvedCategory] || pressLogosByCategory.Moda,
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
    ingredientsSection: {
      title: 'Pureza & Calidad en Cada Detalle',
      leftTitle: 'Selección & Materia Prima',
      leftDesc: 'Insumos verificados y estándares de excelencia garantizados en cada pieza.',
      centerImageUrl: tpl.heritageImg || tpl.bannerUrl,
      rightTitle: 'Respaldo & Trazabilidad',
      rightDesc: 'Atención personalizada y acompañamiento en cada etapa de tu pedido.',
    },
    sectionOrder: [
      'hero',
      'pressLogos',
      'bestsellers',
      'visualCategories',
      'bentoHighlights',
      'ritual',
      'ingredientsSection',
      'lifestyleGallery',
      'ugc',
      'retailers',
      'faqs',
      'garantias',
      'story',
      'footer',
    ],
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
