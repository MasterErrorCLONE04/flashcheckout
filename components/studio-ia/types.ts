export interface Product {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category: string
  description: string
}

export interface Coupon {
  id: string
  code: string
  desc: string
  valor: string
  tipoDesc?: string
}

export interface CreationItem {
  id: string
  title: string
  type: string
  videoUrl?: string | null
  thumbnailUrl?: string | null
  copyCaption?: string | null
  createdAt: string
  product?: {
    id: string
    name: string
    price: number
    imageUrl?: string | null
  }
}

export interface StudioIaClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsapp: string | null
    whatsappConnected: boolean
    isPro: boolean
    creditsAvailable: number
  }
  products: Product[]
  coupons: Coupon[]
  initialCreations: any[]
}

export type CreativeMode = 'DYNAMIC_REEL' | 'GENERATIVE_I2V' | 'AVATAR_UGC'
export type CreativeTone = 'urgency' | 'luxury' | 'casual' | 'educational'
export type MusicTrack = 'viral' | 'lofi' | 'luxury' | 'upbeat'
export type AvatarLayout = 'BUBBLE_PIP' | 'SPLIT_UGC' | 'NONE'
export type StudioMainTab = 'video' | 'foto' | 'contenido' | 'creaciones' | 'formatos'
export type PhotoActionType = 'remove-bg' | 'generate-scene' | 'upscale'
export type PhotoScene = 'marble' | 'neon-podium' | 'luxury-wood' | 'sunlight-nature' | 'urban-minimal'

export interface AiAvatar {
  id: string
  name: string
  niche: string
  badge: string
  imageUrl: string
  gender: 'female' | 'male'
  tone: string
}

export interface GeneratedData {
  hook: string
  script: string
  copyInstagram: string
  copyWhatsApp: string
  copyAida?: { attention: string; interest: string; desire: string; action: string }
  copyPas?: { problem: string; agitation: string; solution: string }
  couponRecommendation?: string
  hashtags: string[]
  callToAction: string
}

export const AI_AVATARS: AiAvatar[] = [
  {
    id: 'sofia_ugc',
    name: 'Sofía',
    niche: 'Moda & Tendencias',
    badge: 'Más Popular',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    gender: 'female',
    tone: 'Espontánea & Fresca'
  },
  {
    id: 'carlos_tech',
    name: 'Carlos',
    niche: 'Tech & Gadgets',
    badge: 'Reviewer Pro',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    gender: 'male',
    tone: 'Analítico & Seguro'
  },
  {
    id: 'valentina_sales',
    name: 'Valentina',
    niche: 'Ofertas & Belleza',
    badge: 'Alta Conversión',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    gender: 'female',
    tone: 'Entusiasta & Enérgica'
  },
  {
    id: 'mateo_business',
    name: 'Mateo',
    niche: 'Lujo & Estilo',
    badge: 'Premium',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    gender: 'male',
    tone: 'Elegante & Convincente'
  }
]

export const CHORD_PROGRESSIONS: Record<string, number[][]> = {
  viral: [
    [220, 261.63, 329.63],   // Am
    [174.61, 220, 261.63],   // F
    [130.81, 164.81, 196.00],// C
    [196.00, 246.94, 293.66] // G
  ],
  lofi: [
    [146.83, 174.61, 220, 261.63],     // Dm7
    [196.00, 246.94, 293.66, 349.23],  // G7
    [130.81, 164.81, 196.00, 246.94],  // Cmaj7
    [220.00, 277.18, 329.63, 392.00]   // A7
  ],
  upbeat: [
    [261.63, 329.63, 392.00], // C
    [196.00, 246.94, 293.66], // G
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63]  // F
  ],
  luxury: [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.00, 261.63], // Dm7
    [130.81, 164.81, 196.00, 246.94]  // Cmaj7
  ]
}

export const formatCOP = (num: number) => `$${num.toLocaleString('es-CO')}`
