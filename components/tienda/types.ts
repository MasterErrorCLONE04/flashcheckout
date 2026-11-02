export interface Product {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  badge?: string | null
  imageUrl: string | null
  stock: number
  category?: string | null
  description?: string | null
  options?: unknown
}

export type HeroStyleType = 'waterdrop-collage' | 'cinematic-overlay' | 'split-hero' | 'minimal-banner'
export type CardStyleType = 'waterdrop-studio' | 'minimal-elevated' | 'clean-border' | 'glass-card'
export type HeaderStyleType = 'clean-border' | 'floating-glass' | 'editorial-centered'

export type ProcessStepItem = {
  step: string
  title: string
  desc: string
  imageUrl?: string
}

export type AmbassadorItem = {
  name: string
  role: string
  imageUrl: string
}

export type PressLogoItem = {
  name: string
  subtitle?: string
  imageUrl?: string
}

export type RetailerItem = {
  name: string
  badge?: string
  imageUrl?: string
}

export type TiendaSettings = {
  colors?: {
    primario?: string
    secundario?: string
    acento?: string
    fondo?: string
    texto?: string
  }
  themePreset?: string
  borderRadius?: 'sharp' | 'smooth' | 'pill'
  shadowStyle?: 'flat' | 'soft' | 'floating'
  headerStyle?: HeaderStyleType
  heroStyle?: HeroStyleType
  heroBadge?: string
  heroPanels?: string[]
  cardStyle?: CardStyleType
  cardAspectRatio?: 'square' | 'portrait'
  badgeStyle?: 'pill' | 'solid' | 'outline'
  catalogColumns?: '3' | '4' | '5'
  showVariantSwatches?: boolean
  sections?: Record<string, boolean | undefined>
  bentoHighlights?: {
    title?: string
    items?: Array<{ emoji: string; title: string; desc: string }>
  }
  visualCategories?: Array<{ category: string; imageUrl: string }>
  processTimeline?: {
    headline?: string
    title?: string
    items?: ProcessStepItem[]
  }
  lifestyleGallery?: string[]
  ugcGallery?: string[]
  ambassadors?: {
    title?: string
    subtitle?: string
    items?: AmbassadorItem[]
  }
  pressLogos?: PressLogoItem[]
  retailers?: {
    title?: string
    subtitle?: string
    ctaText?: string
    items?: RetailerItem[]
  }
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
  whatsappTemplate?: string
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
  policies?: {
    terms?: string
    refunds?: string
  }
  typography?: string
  [key: string]: any
}

export interface TiendaClientProps {
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
  }
  products: Product[]
}

export type ActiveTab =
  | 'estilo'
  | 'encabezado'
  | 'productos'
  | 'secciones'
  | 'info'
  | 'dominios'
  | 'seo'
  | 'redes'
  | 'politicas'

export type DeviceType = 'escritorio' | 'tablet' | 'movil'

export interface ThemePreset {
  id: string
  name: string
  badge: string
  desc: string
  colors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
  typography: string
  borderRadius: 'sharp' | 'smooth' | 'pill'
  shadowStyle: 'flat' | 'soft' | 'floating'
  headerStyle: HeaderStyleType
  heroStyle: HeroStyleType
  cardStyle: CardStyleType
  cardAspectRatio: 'square' | 'portrait'
  badgeStyle: 'pill' | 'solid' | 'outline'
  colorPills: string[]
}

export const PRESETS: ThemePreset[] = [
  {
    id: 'waterdrop',
    name: 'Waterdrop Editorial',
    badge: 'Flagship DTC',
    desc: 'Estética limpia europea: hero collage, tarjetas estudio sin bordes, grilla mixta y mural UGC',
    colors: {
      primario: '#111111',
      secundario: '#52525B',
      acento: '#8CE5A7',
      fondo: '#FFFFFF',
      texto: '#111111',
    },
    typography: 'Plus Jakarta Sans',
    borderRadius: 'pill',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'waterdrop-collage',
    cardStyle: 'waterdrop-studio',
    cardAspectRatio: 'portrait',
    badgeStyle: 'pill',
    colorPills: ['#FFFFFF', '#F6F6F5', '#8CE5A7', '#111111'],
  },
  {
    id: 'luxe',
    name: 'Minimalist Luxe',
    badge: 'Elegante',
    desc: 'Blanco puro, tarjetas estudio suaves y acentos esmeralda refinados',
    colors: {
      primario: '#18181B',
      secundario: '#71717A',
      acento: '#A7F3D0',
      fondo: '#FFFFFF',
      texto: '#09090B',
    },
    typography: 'Outfit',
    borderRadius: 'pill',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'waterdrop-collage',
    cardStyle: 'waterdrop-studio',
    cardAspectRatio: 'portrait',
    badgeStyle: 'pill',
    colorPills: ['#FFFFFF', '#18181B', '#A7F3D0', '#71717A'],
  },
  {
    id: 'artisan',
    name: 'Artisan & Warm',
    badge: 'Cálido',
    desc: 'Editorial cálido con tonos arena, terracota suave y fotografía protagonista',
    colors: {
      primario: '#1C1917',
      secundario: '#78716C',
      acento: '#FDE68A',
      fondo: '#FFFFFF',
      texto: '#1C1917',
    },
    typography: 'Plus Jakarta Sans',
    borderRadius: 'pill',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'waterdrop-collage',
    cardStyle: 'waterdrop-studio',
    cardAspectRatio: 'square',
    badgeStyle: 'pill',
    colorPills: ['#FFFFFF', '#FDE68A', '#78716C', '#1C1917'],
  },
  {
    id: 'pastel',
    name: 'Botanical & Beauty',
    badge: 'Skincare',
    desc: 'Minimalismo limpio con barra rosa cuarzo y tarjetas estudio luminosas',
    colors: {
      primario: '#18181B',
      secundario: '#71717A',
      acento: '#FBCFE8',
      fondo: '#FFFFFF',
      texto: '#18181B',
    },
    typography: 'Outfit',
    borderRadius: 'pill',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'waterdrop-collage',
    cardStyle: 'waterdrop-studio',
    cardAspectRatio: 'portrait',
    badgeStyle: 'pill',
    colorPills: ['#FFFFFF', '#FBCFE8', '#71717A', '#18181B'],
  },
  {
    id: 'streetwear',
    name: 'Performance & Bold',
    badge: ' Urbano / Tech',
    desc: 'Alto contraste monocromático, líneas limpias y energía atlética',
    colors: {
      primario: '#09090B',
      secundario: '#3F3F46',
      acento: '#BEF264',
      fondo: '#FFFFFF',
      texto: '#09090B',
    },
    typography: 'Space Grotesk',
    borderRadius: 'smooth',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'waterdrop-collage',
    cardStyle: 'waterdrop-studio',
    cardAspectRatio: 'portrait',
    badgeStyle: 'solid',
    colorPills: ['#FFFFFF', '#BEF264', '#3F3F46', '#09090B'],
  },
  {
    id: 'midnight',
    name: 'Modern Midnight',
    badge: 'Dark Mode',
    desc: 'Modo oscuro sofisticado con contraste limpio y acentos cian/menta',
    colors: {
      primario: '#10B981',
      secundario: '#94A3B8',
      acento: '#22D3EE',
      fondo: '#0B0F19',
      texto: '#F8FAFC',
    },
    typography: 'Plus Jakarta Sans',
    borderRadius: 'smooth',
    shadowStyle: 'soft',
    headerStyle: 'clean-border',
    heroStyle: 'cinematic-overlay',
    cardStyle: 'glass-card',
    cardAspectRatio: 'square',
    badgeStyle: 'solid',
    colorPills: ['#0B0F19', '#10B981', '#22D3EE', '#F8FAFC'],
  },
]
