import { TiendaSettings } from './types'

export function getInitialSections(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  const src = parsedSettings.sections || fallback?.sections || {}
  const testimonialsOn =
    src.testimonials !== undefined ? src.testimonials !== false : src.testimonios !== false
  const newsletterOn =
    src.newsletterWidget !== undefined ? src.newsletterWidget !== false : src.newsletter !== false

  return {
    banner: src.banner !== false,
    destacados: src.destacados !== false,
    categorias: src.categorias !== false,
    editorialCategories: src.editorialCategories !== false,
    beneficios: src.beneficios !== false,
    processTimeline: src.processTimeline !== false,
    pressLogos: src.pressLogos !== false,
    ambassadors: src.ambassadors !== false,
    ugcGallery: src.ugcGallery !== false,
    retailers: src.retailers !== false,
    testimonials: testimonialsOn,
    newsletterWidget: newsletterOn,
    paymentMethods: src.paymentMethods !== false,
    faqs: src.faqs !== false,
    floatingWhatsApp: src.floatingWhatsApp !== false,
    bentoHighlights: src.bentoHighlights === true,
    accordionSpecs: src.accordionSpecs === true,
    brandStory: src.brandStory === true,
    visualCategories: src.visualCategories === true,
    lifestyleGallery: src.lifestyleGallery === true,
    ingredientsSection: src.ingredientsSection === true,
  }
}

export function getInitialBentoHighlights(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    title: parsedSettings.bentoHighlights?.title || fallback?.bentoHighlights?.title || 'Por Qué Elegirnos',
    items: parsedSettings.bentoHighlights?.items || fallback?.bentoHighlights?.items || [
      { emoji: '✨', title: 'Calidad Seleccionada', desc: 'Productos verificados con altos estándares' },
      { emoji: '💬', title: 'Asesoría en Vivo', desc: 'Atención cercana y rápida por WhatsApp' },
      { emoji: '🚀', title: 'Despacho Ágil', desc: 'Entrega segura directo hasta tu puerta' },
    ],
  }
}

export function getInitialVisualCategories(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return parsedSettings.visualCategories || fallback?.visualCategories || [
    { category: 'Destacados', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop' },
    { category: 'Novedades', imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=500&auto=format&fit=crop' },
    { category: 'Especiales', imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=500&auto=format&fit=crop' },
  ]
}

export function getInitialProcessTimeline(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  const fb = fallback?.processTimeline
  const defaultImgs = [
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop',
  ]
  const rawItems = parsedSettings.processTimeline?.items || fb?.items || [
    { step: '01', title: 'Explora', desc: 'Elige tus favoritos del catálogo con disponibilidad real.', imageUrl: defaultImgs[0] },
    { step: '02', title: 'Personaliza', desc: 'Selecciona tus variantes ideales o recibe guía al instante.', imageUrl: defaultImgs[1] },
    { step: '03', title: 'Disfruta', desc: 'Recibe rápido en tu dirección con compra 100% protegida.', imageUrl: defaultImgs[2] },
  ]

  return {
    headline:
      parsedSettings.processTimeline?.headline ||
      fb?.headline ||
      'Diseño, calidad real y atención directa para transformar cada compra en una experiencia simple.',
    title: parsedSettings.processTimeline?.title || fb?.title || '¿Cómo funciona?',
    items: rawItems.map((it, idx) => ({
      step: it.step || `0${idx + 1}`,
      title: it.title,
      desc: it.desc,
      imageUrl: it.imageUrl || fb?.items?.[idx]?.imageUrl || defaultImgs[idx % defaultImgs.length],
    })),
  }
}

export function getInitialAmbassadors(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  const fb = fallback?.ambassadors
  return {
    title: parsedSettings.ambassadors?.title || fb?.title || 'Recomendado por nuestra comunidad',
    subtitle: parsedSettings.ambassadors?.subtitle || fb?.subtitle || 'Clientes y especialistas que confían en nosotros día a día',
    items: parsedSettings.ambassadors?.items || fb?.items || [
      { name: 'Valentina Restrepo', role: 'Medellín', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
      { name: 'Sebastián Pardo', role: 'Bogotá', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
      { name: 'Camila Osorio', role: 'Cali', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
      { name: 'Mateo Rivera', role: 'Barranquilla', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
    ],
  }
}

export function getInitialPressLogos(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return parsedSettings.pressLogos || fallback?.pressLogos || [
    { name: 'VOGUE', subtitle: 'Selección Editorial' },
    { name: 'FORBES', subtitle: 'Comercio Digital' },
    { name: 'GQ', subtitle: 'Diseño & Calidad' },
    { name: 'ELLE', subtitle: 'Tendencia Local' },
    { name: 'TRUSTED', subtitle: '4.9★ Verificado' },
  ]
}

export function getInitialRetailers(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  const fb = fallback?.retailers
  return {
    title: parsedSettings.retailers?.title || fb?.title || 'Cobertura & Canales Oficiales',
    subtitle: parsedSettings.retailers?.subtitle || fb?.subtitle || 'Despacho prioritario con guía de seguimiento a todo el país.',
    ctaText: parsedSettings.retailers?.ctaText || fb?.ctaText || 'Consultar cobertura por WhatsApp',
    items: parsedSettings.retailers?.items || fb?.items || [
      { name: 'Bogotá & Sabana', badge: 'Entrega 24h' },
      { name: 'Medellín & Área Met.', badge: 'Entrega 24h' },
      { name: 'Cali, Eje & Costa', badge: '24–48h Express' },
      { name: 'WhatsApp Oficial', badge: 'Atención VIP' },
    ],
  }
}

export function getInitialUgcGallery(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return (
    parsedSettings.ugcGallery ||
    fallback?.ugcGallery || [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop',
    ]
  )
}

export function getInitialLifestyleGallery(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return parsedSettings.lifestyleGallery || fallback?.lifestyleGallery || [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=500&auto=format&fit=crop',
  ]
}

export function getInitialNewsletterWidget(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    title: parsedSettings.newsletterWidget?.title || fallback?.newsletterWidget?.title || 'Promociones y novedades en tu correo',
    subtitle: parsedSettings.newsletterWidget?.subtitle || fallback?.newsletterWidget?.subtitle || 'Suscríbete para recibir lanzamientos anticipados y beneficios exclusivos.',
    placeholder: parsedSettings.newsletterWidget?.placeholder || fallback?.newsletterWidget?.placeholder || 'Tu correo electrónico',
    btnText: parsedSettings.newsletterWidget?.btnText || fallback?.newsletterWidget?.btnText || 'Suscribirme ahora',
    bgColor: parsedSettings.newsletterWidget?.bgColor || fallback?.newsletterWidget?.bgColor || '#111111',
    textColor: parsedSettings.newsletterWidget?.textColor || fallback?.newsletterWidget?.textColor || '#FFFFFF',
  }
}

export function getInitialNavbarLinks(
  parsedSettings: TiendaSettings
): Array<{ label: string; action: 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link'; link: string }> {
  return parsedSettings.navbarLinks || [
    { label: 'Inicio', action: 'scroll-banner', link: '' },
    { label: 'Productos', action: 'scroll-products', link: '' },
    { label: 'Historia', action: 'scroll-story', link: '' },
    { label: 'Contacto', action: 'whatsapp', link: '' },
  ]
}

export function getInitialAccordionSpecs(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return parsedSettings.accordionSpecs?.tabs || fallback?.accordionSpecs?.tabs || [
    { title: 'Información de Compra', content: 'Atención directa por WhatsApp y múltiples medios de pago seguros.' },
    { title: 'Envíos y Entregas', content: 'Despachos cuidados con seguimiento hasta tu dirección.' },
  ]
}

export function getInitialBrandStory(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    title: parsedSettings.brandStory?.title || fallback?.brandStory?.title || 'Sobre Nuestro Negocio',
    desc: parsedSettings.brandStory?.desc || fallback?.brandStory?.desc || 'Trabajamos cada día para ofrecerte calidad real, atención cercana y una experiencia de compra ágil y confiable.',
    bgUrl: parsedSettings.brandStory?.bgUrl || fallback?.brandStory?.bgUrl || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=900&auto=format&fit=crop',
    btnText: parsedSettings.brandStory?.btnText || fallback?.brandStory?.btnText || 'Conocer más',
    btnLink: parsedSettings.brandStory?.btnLink || fallback?.brandStory?.btnLink || '',
  }
}

export function getInitialBrandStoryPage(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  const fb = fallback?.brandStoryPage
  return {
    headerTrayectoria: parsedSettings.brandStoryPage?.headerTrayectoria || fb?.headerTrayectoria || 'Nuestra Esencia',
    headerPerfil: parsedSettings.brandStoryPage?.headerPerfil || fb?.headerPerfil || 'Sobre Nosotros',
    narrativeP1: parsedSettings.brandStoryPage?.narrativeP1 || fb?.narrativeP1 || 'Nacimos con el propósito de brindar productos seleccionados y atención humana directa en cada compra.',
    narrativeP2: parsedSettings.brandStoryPage?.narrativeP2 || fb?.narrativeP2 || 'Combinamos un catálogo digital intuitivo con asesoría inmediata por WhatsApp para acompañarte de principio a fin.',
    imageHeritage: parsedSettings.brandStoryPage?.imageHeritage || fb?.imageHeritage || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=900&auto=format&fit=crop',
    pillarsTitle: parsedSettings.brandStoryPage?.pillarsTitle || fb?.pillarsTitle || 'Nuestros Pilares',
    pillar1Icon: parsedSettings.brandStoryPage?.pillar1Icon || fb?.pillar1Icon || '🌟',
    pillar1Title: parsedSettings.brandStoryPage?.pillar1Title || fb?.pillar1Title || 'Compromiso de Calidad',
    pillar1Desc: parsedSettings.brandStoryPage?.pillar1Desc || fb?.pillar1Desc || 'Revisamos cada detalle antes de entregar tu pedido para garantizar tu satisfacción.',
    pillar2Icon: parsedSettings.brandStoryPage?.pillar2Icon || fb?.pillar2Icon || '📲',
    pillar2Title: parsedSettings.brandStoryPage?.pillar2Title || fb?.pillar2Title || 'Cercanía Digital',
    pillar2Desc: parsedSettings.brandStoryPage?.pillar2Desc || fb?.pillar2Desc || 'Compra en segundos desde cualquier dispositivo con respaldo directo por WhatsApp.',
    leadership: parsedSettings.brandStoryPage?.leadership || fb?.leadership || [],
    values: parsedSettings.brandStoryPage?.values || fb?.values || [
      { title: 'Calidad', desc: 'Estándares exigentes en cada referencia de nuestro catálogo.' },
      { title: 'Confianza', desc: 'Comunicación clara, precios transparentes y pagos seguros.' },
      { title: 'Servicio', desc: 'Acompañamiento cercano antes y después de tu compra.' },
    ],
  }
}

export function getInitialIngredientsSection(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    title: parsedSettings.ingredientsSection?.title || 'Calidad en Cada Detalle',
    leftTitle: parsedSettings.ingredientsSection?.leftTitle || 'Selección Cuidada',
    leftDesc: parsedSettings.ingredientsSection?.leftDesc || 'Materiales e insumos verificados para garantizar excelencia en cada entrega.',
    centerImageUrl: parsedSettings.ingredientsSection?.centerImageUrl || fallback?.bannerUrl || '',
    rightTitle: parsedSettings.ingredientsSection?.rightTitle || 'Respaldo Garantizado',
    rightDesc: parsedSettings.ingredientsSection?.rightDesc || 'Acompañamiento cercano antes, durante y después de tu compra.',
  }
}

export function getInitialPaymentMethods(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    enabled: parsedSettings.paymentMethods?.enabled !== false,
    nequi: parsedSettings.paymentMethods?.nequi !== false,
    bancolombia: parsedSettings.paymentMethods?.bancolombia !== false,
    contraEntrega: parsedSettings.paymentMethods?.contraEntrega !== false,
    pse: parsedSettings.paymentMethods?.pse !== false,
    tarjetas: parsedSettings.paymentMethods?.tarjetas !== false,
    customNote: parsedSettings.paymentMethods?.customNote || fallback?.paymentMethods?.customNote || 'Aceptamos transferencias, tarjetas y pago contra entrega en Colombia.',
  }
}

export function getInitialTestimonials(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    enabled: parsedSettings.testimonials?.enabled !== false,
    title: parsedSettings.testimonials?.title || fallback?.testimonials?.title || 'Miles de clientes felices',
    subtitle: parsedSettings.testimonials?.subtitle || fallback?.testimonials?.subtitle || 'Compradores verificados que confían en nosotros día a día',
    items: parsedSettings.testimonials?.items || fallback?.testimonials?.items || [
      { name: 'Carolina Martínez', city: 'Bogotá', stars: 5, comment: 'Excelente calidad y la atención por WhatsApp fue de 10. Llegó al día siguiente.' },
      { name: 'Andrés Rincón', city: 'Medellín', stars: 5, comment: 'Súper rápido y confiable. El producto venía perfectamente empacado.' },
      { name: 'Mariana Gómez', city: 'Cali', stars: 5, comment: 'Me asesoraron súper bien antes de comprar. Ya he pedido varias veces.' },
    ],
  }
}

export function getInitialFaqs(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    enabled: parsedSettings.faqs?.enabled !== false,
    title: parsedSettings.faqs?.title || 'Preguntas Frecuentes',
    items: parsedSettings.faqs?.items || fallback?.faqs?.items || [
      { q: '¿Cómo realizo mi pedido y pago?', a: 'Elige tus productos, añade tu dirección y confirma hacia WhatsApp o paga en línea de forma segura.' },
      { q: '¿Cuánto tiempo tarda en llegar?', a: 'Despachamos en 24 a 48 horas hábiles a ciudades principales con guía de rastreo.' },
      { q: '¿Tienen garantía los productos?', a: 'Sí, todos nuestros artículos cuentan con garantía directa de satisfacción.' },
    ],
  }
}

export function getInitialBenefits(parsedSettings: TiendaSettings, fallback?: TiendaSettings) {
  return {
    items: parsedSettings.benefits?.items || fallback?.benefits?.items || [
      { icon: 'Truck' as const, label: 'Envíos rápidos', desc: 'A todo el país' },
      { icon: 'ShieldCheck' as const, label: 'Pagos seguros', desc: 'Múltiples métodos' },
      { icon: 'Award' as const, label: 'Calidad real', desc: 'Selección verificada' },
      { icon: 'Clock' as const, label: 'Atención directa', desc: 'Soporte en vivo' },
    ],
  }
}
