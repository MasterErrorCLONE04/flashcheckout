import { TiendaSettings } from './types'

export function getInitialSections(parsedSettings: TiendaSettings) {
  return {
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
  }
}

export function getInitialBentoHighlights(parsedSettings: TiendaSettings) {
  return {
    title: parsedSettings.bentoHighlights?.title || 'Nuestros Ingredientes Premium',
    items: parsedSettings.bentoHighlights?.items || [
      { emoji: '🌴', title: 'Dátiles de Faraón', desc: 'Dulces, carnosos y naturales' },
      { emoji: '🥜', title: 'Almendras Tostadas', desc: 'Crujientes y seleccionadas a mano' },
      { emoji: '🍫', title: 'Chocolate Belga', desc: 'Cobertura suave de cacao puro' }
    ]
  }
}

export function getInitialVisualCategories(parsedSettings: TiendaSettings) {
  return parsedSettings.visualCategories || [
    { category: 'Café', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop' },
    { category: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop' },
    { category: 'Combos', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop' }
  ]
}

export function getInitialProcessTimeline(parsedSettings: TiendaSettings) {
  return {
    title: parsedSettings.processTimeline?.title || '¿Cómo Comprar en Flashcheckouts?',
    items: parsedSettings.processTimeline?.items || [
      { step: '1', title: 'Explora y Agrega', desc: 'Selecciona tus productos favoritos del catálogo y agrégalos al carrito.' },
      { step: '2', title: 'Datos de Envío', desc: 'Ingresa tu dirección de entrega y ubícate en el mapa interactivo.' },
      { step: '3', title: 'Completa en WhatsApp', desc: 'Finaliza el pedido enviando el mensaje estructurado de WhatsApp al vendedor.' }
    ]
  }
}

export function getInitialLifestyleGallery(parsedSettings: TiendaSettings) {
  return parsedSettings.lifestyleGallery || [
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop'
  ]
}

export function getInitialNewsletterWidget(parsedSettings: TiendaSettings) {
  return {
    title: parsedSettings.newsletterWidget?.title || 'Únete a Nuestro Club Gourmet',
    subtitle: parsedSettings.newsletterWidget?.subtitle || 'Entérate antes que nadie de nuestros lanzamientos, descuentos exclusivos y recetas especiales.',
    placeholder: parsedSettings.newsletterWidget?.placeholder || 'Ingresa tu correo electrónico',
    btnText: parsedSettings.newsletterWidget?.btnText || 'Suscribirme',
    bgColor: parsedSettings.newsletterWidget?.bgColor || '#111827',
    textColor: parsedSettings.newsletterWidget?.textColor || '#FFFFFF'
  }
}

export function getInitialNavbarLinks(parsedSettings: TiendaSettings): Array<{ label: string; action: 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link'; link: string }> {
  return parsedSettings.navbarLinks || [
    { label: 'Inicio', action: 'scroll-banner', link: '' },
    { label: 'Productos', action: 'scroll-products', link: '' },
    { label: 'Historia', action: 'scroll-story', link: '' },
    { label: 'Contacto', action: 'whatsapp', link: '' }
  ]
}

export function getInitialAccordionSpecs(parsedSettings: TiendaSettings) {
  return parsedSettings.accordionSpecs?.tabs || [
    { title: 'Ficha Nutricional', content: 'Calorías: 140 kcal | Grasas: 4g | Carbohidratos: 22g | Proteínas: 2g por porción.' },
    { title: 'Método de Envío', content: 'Empacado con tecnología térmica para conservar el chocolate fresco hasta tu puerta.' }
  ]
}

export function getInitialBrandStory(parsedSettings: TiendaSettings) {
  return {
    title: parsedSettings.brandStory?.title || 'Nuestra Historia de Sabor',
    desc: parsedSettings.brandStory?.desc || 'Fundada con la visión de combinar frutos del desierto y chocolate fino, creamos una experiencia única de confitería artesanal.',
    bgUrl: parsedSettings.brandStory?.bgUrl || 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=800&auto=format&fit=crop',
    btnText: parsedSettings.brandStory?.btnText || 'Saber más',
    btnLink: parsedSettings.brandStory?.btnLink || ''
  }
}

export function getInitialBrandStoryPage(parsedSettings: TiendaSettings) {
  return {
    headerTrayectoria: parsedSettings.brandStoryPage?.headerTrayectoria || 'Nuestra Trayectoria',
    headerPerfil: parsedSettings.brandStoryPage?.headerPerfil || 'Perfil de la Empresa',
    narrativeP1: parsedSettings.brandStoryPage?.narrativeP1 || 'Fundada en 1992 por el visionario Fawaz Masri, Chocodate nació en el corazón de los Emiratos Árabes Unidos con una misión singular: elevar la humilde y nutritiva fruta del dátil de Arabia a una experiencia de confitería de clase mundial.',
    narrativeP2: parsedSettings.brandStoryPage?.narrativeP2 || 'Al combinar el dulzor natural y la riqueza en fibra de los mejores dátiles seleccionados a mano con el crujido de una almendra tostada en su interior, y envolverlo todo en una generosa capa de chocolate belga prémium, creamos una golosina única que trasciende fronteras. Hoy en día, nuestros productos se disfrutan en más de 50 países alrededor del mundo.',
    imageHeritage: parsedSettings.brandStoryPage?.imageHeritage || 'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=800&auto=format&fit=crop',
    pillarsTitle: parsedSettings.brandStoryPage?.pillarsTitle || 'Nuestras Dos Grandes Columnas',
    pillar1Icon: parsedSettings.brandStoryPage?.pillar1Icon || '🏭',
    pillar1Title: parsedSettings.brandStoryPage?.pillar1Title || 'Fábrica La Ronda (Dubái, EAU)',
    pillar1Desc: parsedSettings.brandStoryPage?.pillar1Desc || 'Nuestra planta principal con tecnología de punta dedicada exclusivamente al procesamiento de dátiles frescos, tostado de almendras y la formulación del chocolate belga. Cumple con las más estrictas certificaciones internacionales de calidad alimentaria (HACCP, ISO 22000 y Halal).',
    pillar2Icon: parsedSettings.brandStoryPage?.pillar2Icon || '🌴',
    pillar2Title: parsedSettings.brandStoryPage?.pillar2Title || 'Star Foods (KSA)',
    pillar2Desc: parsedSettings.brandStoryPage?.pillar2Desc || 'Nuestra sucursal agrícola y de procesamiento ubicada en Arabia Saudita, encargada de la recolección y selección de los dátiles en su momento justo de maduración, garantizando una cadena de suministro sostenible y local.',
    leadership: parsedSettings.brandStoryPage?.leadership || [
      { name: 'Fawaz Al-Masri', role: 'Fundador & CEO', icon: '👨‍💼' },
      { name: 'Razan Al-Masri', role: 'Directora de Desarrollo (CBDO)', icon: '👩‍💼' },
      { name: 'Omar Al-Masri', role: 'Director de Operaciones (COO)', icon: '👨‍💻' },
      { name: 'Hazem Al-Masri', role: 'Gerente General', icon: '👨‍🔧' }
    ],
    values: parsedSettings.brandStoryPage?.values || [
      { title: 'Razón & Pasión', desc: 'Equilibramos la toma de decisiones basada en datos científicos con la pasión por la repostería fina.' },
      { title: 'Tradición & Modernidad', desc: 'Respetamos el legado histórico del dátil del desierto mientras aplicamos tecnología de punta en empaque y producción.' },
      { title: 'Familia & Comunidad', desc: 'Operamos como una empresa familiar que apoya a los agricultores locales y cuida de sus empleados.' }
    ]
  }
}
