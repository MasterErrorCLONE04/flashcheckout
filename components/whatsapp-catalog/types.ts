import type { ComponentType } from 'react'
import {
  Truck,
  ShieldCheck,
  Award,
  Clock,
  Gift,
  Star,
  Sprout,
  ShoppingBag,
  Zap,
  Home,
  Smartphone,
  Shirt,
  Sparkles,
  Tag
} from 'lucide-react'
import type { PublicCheckoutStore, PublicCheckoutProduct } from '@/lib/checkout/types'

export type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc'
export type CatalogIconName = 'Truck' | 'ShieldCheck' | 'Award' | 'Clock' | 'Gift' | 'Star'
export type CatalogNavAction = 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link'

export type ProductOption = {
  name: string
  values: string[]
}

export type Product = PublicCheckoutProduct

export type CatalogSettings = {
  colors?: {
    primario?: string
    secundario?: string
    acento?: string
    fondo?: string
    texto?: string
  }
  typography?: string
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
    items?: Array<{ icon: CatalogIconName; label: string; desc: string }>
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
  bentoHighlights?: {
    title?: string
    items?: Array<{ emoji: string; title: string; desc: string }>
  }
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
  navbarLinks?: Array<{ label: string; action: CatalogNavAction; link?: string }>
  sections?: Record<string, boolean | undefined>
  socials?: {
    instagram?: string
    facebook?: string
    tiktok?: string
    twitter?: string
    web?: string
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
  paymentMethods?: {
    enabled?: boolean
    nequi?: boolean
    bancolombia?: boolean
    contraEntrega?: boolean
    pse?: boolean
    tarjetas?: boolean
    customNote?: string
  }
  testimonials?: {
    enabled?: boolean
    title?: string
    subtitle?: string
    items?: Array<{ name: string; city: string; stars: number; comment: string }>
  }
  faqs?: {
    enabled?: boolean
    title?: string
    items?: Array<{ q: string; a: string }>
  }
  floatingWhatsApp?: {
    enabled?: boolean
    message?: string
    agentName?: string
  }
}

export type Store = PublicCheckoutStore

export type NavLink = {
  label: string
  action: CatalogNavAction
  link?: string
}

export type CatalogIcon = ComponentType<{ className?: string }>

export function getCartKey(productId: string, selectedOpts: Record<string, string>) {
  const sortedKeys = Object.keys(selectedOpts).sort()
  if (sortedKeys.length === 0) return productId
  const parts = sortedKeys.map(k => `${k}-${selectedOpts[k]}`)
  return `${productId}:${parts.join('|')}`
}

export function parseCartKey(cartKey: string) {
  if (!cartKey.includes(':')) {
    return { productId: cartKey, variations: {} as Record<string, string> }
  }
  const [productId, variationsStr] = cartKey.split(':')
  const variations: Record<string, string> = {}
  variationsStr.split('|').forEach(p => {
    if (p.includes('-')) {
      const [k, v] = p.split('-')
      variations[k] = v
    }
  })
  return { productId, variations }
}

export function normalizeProductOptions(options: unknown): ProductOption[] {
  if (!options) return []

  const parsed = typeof options === 'string'
    ? (() => {
        try {
          return JSON.parse(options)
        } catch {
          return null
        }
      })()
    : options

  if (!Array.isArray(parsed)) return []

  return parsed.filter((opt): opt is ProductOption => (
    !!opt &&
    typeof opt.name === 'string' &&
    Array.isArray(opt.values)
  ))
}

export const IconMap: Record<CatalogIconName, CatalogIcon> = {
  Truck,
  ShieldCheck,
  Award,
  Clock,
  Gift,
  Star
}

export function getCategoryIcon(cat: string): ComponentType<{ className?: string }> {
  const c = cat.toLowerCase()
  if (c.includes('caf') || c.includes('beb') || c.includes('alimen')) return Sprout
  if (c.includes('grano') || c.includes('semilla')) return Sprout
  if (c.includes('accesor') || c.includes('metod') || c.includes('equipo')) return ShoppingBag
  if (c.includes('edici') || c.includes('especial') || c.includes('pack')) return Zap
  if (c.includes('hogar') || c.includes('casa')) return Home
  if (c.includes('tec') || c.includes('gadget')) return Smartphone
  if (c.includes('ropa') || c.includes('moda')) return Shirt
  if (c.includes('regalo') || c.includes('combo')) return Gift
  if (c.includes('destac') || c.includes('top')) return Sparkles
  return Tag
}
