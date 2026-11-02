import type { TiendaSettings } from '@/components/tienda/types'

export type BusinessCategoryId =
  | 'Moda'
  | 'Comida'
  | 'Belleza'
  | 'Tecnología'
  | 'Hogar'
  | 'Joyería'
  | 'Deportes'
  | 'Mascotas'
  | 'Otros'

export type GeneratedBusinessProfile = {
  niche: string
  targetAudience: string
  brandTone: string
  coreProposition: string
}

export type GeneratedStorePackage = {
  bio: string
  welcomeMessage: string
  systemPrompt: string
  businessProfile: GeneratedBusinessProfile
  aiSettings: TiendaSettings
}

export type IndustryTemplate = {
  presetId: string
  heroBadge: string
  bannerUrl: string
  bannerTitle: (name: string) => string
  bannerSubtitle: (name: string, desc?: string) => string
  announcementText: string
  bio: (name: string, desc?: string) => string
  brandTone: string
  targetAudience: string
  nicheFallback: string
  bentoTitle: string
  bentoItems: Array<{ emoji: string; title: string; desc: string }>
  benefits: Array<{
    icon: 'Truck' | 'ShieldCheck' | 'Award' | 'Clock' | 'Gift' | 'Star'
    label: string
    desc: string
  }>
  visualCategories: Array<{ category: string; imageUrl: string }>
  lifestyleGallery: string[]
  accordionTabs: Array<{ title: string; content: string }>
  brandStoryBg: string
  brandStoryTitle: (name: string) => string
  brandStoryDesc: (name: string, desc?: string) => string
  heritageImg: string
  pillar1: { icon: string; title: string; desc: string }
  pillar2: { icon: string; title: string; desc: string }
  values: Array<{ title: string; desc: string }>
  newsletterTitle: (name: string) => string
  newsletterSubtitle: string
  faqs: Array<{ q: string; a: string }>
  testimonials: Array<{ name: string; city: string; stars: number; comment: string }>
}

