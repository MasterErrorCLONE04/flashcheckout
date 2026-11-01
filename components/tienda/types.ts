export interface Product {
  id: string
  name: string
  price: number
  imageUrl: string | null
  stock: number
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
  headerStyle?: 'floating-glass' | 'clean-border' | 'editorial-centered'
  heroStyle?: 'cinematic-overlay' | 'split-hero' | 'minimal-banner'
  heroBadge?: string
  cardStyle?: 'minimal-elevated' | 'clean-border' | 'glass-card'
  cardAspectRatio?: 'square' | 'portrait'
  badgeStyle?: 'pill' | 'solid' | 'outline'
  catalogColumns?: '3' | '4' | '5'
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
  headerStyle: 'floating-glass' | 'clean-border' | 'editorial-centered'
  heroStyle: 'cinematic-overlay' | 'split-hero' | 'minimal-banner'
  cardStyle: 'minimal-elevated' | 'clean-border' | 'glass-card'
  cardAspectRatio: 'square' | 'portrait'
  badgeStyle: 'pill' | 'solid' | 'outline'
  colorPills: string[]
}

export const PRESETS: ThemePreset[] = [
  {
    id: 'luxe',
    name: 'Minimalist Luxe',
    badge: 'Recomendado',
    desc: 'Limpio, espacioso y nórdico con acentos esmeralda',
    colors: {
      primario: '#18181B',
      secundario: '#71717A',
      acento: '#10B981',
      fondo: '#FAFAFA',
      texto: '#09090B'
    },
    typography: 'Outfit',
    borderRadius: 'smooth',
    shadowStyle: 'soft',
    headerStyle: 'floating-glass',
    heroStyle: 'cinematic-overlay',
    cardStyle: 'minimal-elevated',
    cardAspectRatio: 'square',
    badgeStyle: 'pill',
    colorPills: ['#18181B', '#71717A', '#10B981', '#FAFAFA']
  },
  {
    id: 'midnight',
    name: 'Modern Midnight',
    badge: 'Dark Mode',
    desc: 'Dark mode elegante con reflejos esmeralda y cristal',
    colors: {
      primario: '#10B981',
      secundario: '#6366F1',
      acento: '#22D3EE',
      fondo: '#0B0F19',
      texto: '#F3F4F6'
    },
    typography: 'Plus Jakarta Sans',
    borderRadius: 'smooth',
    shadowStyle: 'floating',
    headerStyle: 'floating-glass',
    heroStyle: 'cinematic-overlay',
    cardStyle: 'glass-card',
    cardAspectRatio: 'square',
    badgeStyle: 'solid',
    colorPills: ['#0B0F19', '#10B981', '#6366F1', '#22D3EE']
  },
  {
    id: 'artisan',
    name: 'Artisan & Gourmet',
    badge: 'Cálido',
    desc: 'Cálido, orgánico y sofisticado con tonos tierra',
    colors: {
      primario: '#78350F',
      secundario: '#D97706',
      acento: '#B45309',
      fondo: '#FDFBF7',
      texto: '#292524'
    },
    typography: 'Playfair Display',
    borderRadius: 'smooth',
    shadowStyle: 'soft',
    headerStyle: 'clean-border',
    heroStyle: 'split-hero',
    cardStyle: 'clean-border',
    cardAspectRatio: 'square',
    badgeStyle: 'pill',
    colorPills: ['#78350F', '#D97706', '#FDFBF7', '#292524']
  },
  {
    id: 'streetwear',
    name: 'Streetwear & Bold',
    badge: 'Urbano',
    desc: 'Alto impacto, bordes marcados y estética pasarela',
    colors: {
      primario: '#000000',
      secundario: '#27272A',
      acento: '#E11D48',
      fondo: '#FFFFFF',
      texto: '#09090B'
    },
    typography: 'Space Grotesk',
    borderRadius: 'sharp',
    shadowStyle: 'flat',
    headerStyle: 'clean-border',
    heroStyle: 'cinematic-overlay',
    cardStyle: 'clean-border',
    cardAspectRatio: 'portrait',
    badgeStyle: 'solid',
    colorPills: ['#000000', '#27272A', '#E11D48', '#FFFFFF']
  },
  {
    id: 'pastel',
    name: 'Pastel Boutique',
    badge: 'Suave',
    desc: 'Tonos rosa palo, marfil y acabados ultra-suaves',
    colors: {
      primario: '#BE185D',
      secundario: '#F472B6',
      acento: '#EC4899',
      fondo: '#FDF2F8',
      texto: '#831843'
    },
    typography: 'Outfit',
    borderRadius: 'pill',
    shadowStyle: 'soft',
    headerStyle: 'floating-glass',
    heroStyle: 'minimal-banner',
    cardStyle: 'minimal-elevated',
    cardAspectRatio: 'portrait',
    badgeStyle: 'pill',
    colorPills: ['#BE185D', '#F472B6', '#FDF2F8', '#831843']
  }
]
