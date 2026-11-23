import { PRESETS, SectionId } from '@/components/tienda/types'
import {
  buildIndustryStoreBlueprint,
  type GeneratedStorePackage,
} from './store-blueprints'
import { detectNicheFromPrompt } from './store-blueprints/demo-products'

interface AiStoreCopyPayload {
  presetId?: string
  bio?: string
  heroBadge?: string
  bannerTitle?: string
  bannerSubtitle?: string
  bannerButtonText?: string
  announcementText?: string
  bentoTitle?: string
  bentoItems?: Array<{ emoji?: string; title?: string; desc?: string }>
  visualCategories?: Array<{ category?: string; desc?: string }>
  processTitle?: string
  processHeadline?: string
  processSteps?: Array<{ step?: string; title?: string; desc?: string }>
  ingredientsTitle?: string
  ingredientsLeftTitle?: string
  ingredientsLeftDesc?: string
  ingredientsRightTitle?: string
  ingredientsRightDesc?: string
  brandStoryTitle?: string
  brandStoryDesc?: string
  narrativeP1?: string
  narrativeP2?: string
  pillar1Icon?: string
  pillar1Title?: string
  pillar1Desc?: string
  pillar2Icon?: string
  pillar2Title?: string
  pillar2Desc?: string
  faqs?: Array<{ q?: string; a?: string }>
  testimonials?: Array<{ name?: string; city?: string; comment?: string; stars?: number }>
  welcomeMessage?: string
  niche?: string
  targetAudience?: string
  brandTone?: string
  typography?: string
  heroStyle?: 'waterdrop-collage' | 'cinematic-overlay' | 'split-hero' | 'minimal-banner'
  cardStyle?: 'waterdrop-studio' | 'clean-border' | 'minimal-elevated' | 'glass-card'
  headerStyle?: 'clean-border' | 'editorial-centered' | 'floating-glass'
  colors?: {
    primario?: string
    secundario?: string
    acento?: string
    fondo?: string
    texto?: string
  }
}

export interface StoreInventoryProductInput {
  id?: string
  name: string
  price: number
  stock: number
  category?: string | null
  description?: string | null
  imageUrl?: string | null
  options?: unknown
}

const ALLOWED_FONTS = [
  'Plus Jakarta Sans',
  'Outfit',
  'Inter',
  'Sora',
  'DM Sans',
  'Manrope',
  'Space Grotesk',
  'Syne',
  'Playfair Display',
  'Cormorant Garamond',
  'Cinzel',
  'Montserrat',
]

// Curated high-resolution Unsplash collections per niche for full page visual coherence
interface NicheVisualKit {
  heroPanels: string[]
  bannerUrl: string
  visualCategories: Array<{ category: string; imageUrl: string }>
  lifestyleGallery: string[]
  ingredientsImage: string
  heritageImg: string
  storyBg: string
  presetId: string
  colors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
}

const NICHE_VISUAL_KITS: Record<string, NicheVisualKit> = {
  cafe: {
    presetId: 'artisan-warm',
    bannerUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Café de Origen', imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=400&auto=format&fit=crop' },
      { category: 'Tueste por Lotes', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop' },
      { category: 'Métodos de Filtrado', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop' },
      { category: 'Kits & Degustación', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#38220F',
      secundario: '#593D28',
      acento: '#C99765',
      fondo: '#FAF8F5',
      texto: '#23160B',
    },
  },
  streetwear: {
    presetId: 'street-bold',
    bannerUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Hoodies Oversize', imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop' },
      { category: 'Graphic Tees', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop' },
      { category: 'Pantalones Cargo', imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=400&auto=format&fit=crop' },
      { category: 'Accesorios & Caps', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#0F0F11',
      secundario: '#222328',
      acento: '#00F0FF',
      fondo: '#F7F8FA',
      texto: '#0F0F11',
    },
  },
  skincare: {
    presetId: 'botanical-beauty',
    bannerUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508759072017-b6f724bc08e7?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Sueros Botánicos', imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=400&auto=format&fit=crop' },
      { category: 'Limpieza Facial', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop' },
      { category: 'Hidratación Profunda', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400&auto=format&fit=crop' },
      { category: 'Protección Solar', imageUrl: 'https://images.unsplash.com/photo-1508759072017-b6f724bc08e7?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508759072017-b6f724bc08e7?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1508759072017-b6f724bc08e7?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#27342B',
      secundario: '#415246',
      acento: '#C99E74',
      fondo: '#FCFAF7',
      texto: '#1A231D',
    },
  },
  joyeria: {
    presetId: 'emerald-fine',
    bannerUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Anillos de Oro', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop' },
      { category: 'Collares & Dijes', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop' },
      { category: 'Aretes Minimal', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop' },
      { category: 'Pulseras Finas', imageUrl: 'https://images.unsplash.com/photo-1611591475819-79b8b73ff784?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#161616',
      secundario: '#2C2C2C',
      acento: '#D4AF37',
      fondo: '#FAF8F5',
      texto: '#161616',
    },
  },
  tecnologia: {
    presetId: 'cyber-tech',
    bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Audio & Auriculares', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' },
      { category: 'Productividad & Setup', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop' },
      { category: 'Smartwatches', imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=400&auto=format&fit=crop' },
      { category: 'Carga & Energía', imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#0F172A',
      secundario: '#1E293B',
      acento: '#2563EB',
      fondo: '#F8FAFC',
      texto: '#0F172A',
    },
  },
  comida: {
    presetId: 'artisan-warm',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Platos Estrella', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop' },
      { category: 'Combos Gourmet', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop' },
      { category: 'Entradas & Snacks', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' },
      { category: 'Bebidas de Autor', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#1E1B18',
      secundario: '#3A322C',
      acento: '#E65100',
      fondo: '#FDFBF7',
      texto: '#1A1815',
    },
  },
  hogar: {
    presetId: 'artisan-warm',
    bannerUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Aromas & Velas', imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400&auto=format&fit=crop' },
      { category: 'Cerámica & Floreros', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop' },
      { category: 'Textiles de Lino', imageUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?q=80&w=400&auto=format&fit=crop' },
      { category: 'Iluminación Cálida', imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#2A2521',
      secundario: '#453E38',
      acento: '#A38F7A',
      fondo: '#FAF9F6',
      texto: '#201C18',
    },
  },
  mascotas: {
    presetId: 'coastal-breeze',
    bannerUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Nutrición Natural', imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&auto=format&fit=crop' },
      { category: 'Camas Antiestrés', imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400&auto=format&fit=crop' },
      { category: 'Paseo & Seguridad', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop' },
      { category: 'Snacks & Premios', imageUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#1E293B',
      secundario: '#334155',
      acento: '#F97316',
      fondo: '#F8FAFC',
      texto: '#0F172A',
    },
  },
  deportes: {
    presetId: 'street-bold',
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Proteínas & Aisladas', imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop' },
      { category: 'Creatina & Energía', imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=400&auto=format&fit=crop' },
      { category: 'Equipamiento & Bandas', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop' },
      { category: 'Shakers & Accesorios', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#09090B',
      secundario: '#18181B',
      acento: '#2563EB',
      fondo: '#FAFAFA',
      texto: '#09090B',
    },
  },
  moda: {
    presetId: 'minimalist-luxe',
    bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    heroPanels: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop',
    ],
    visualCategories: [
      { category: 'Vestidos & Enterizos', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=400&auto=format&fit=crop' },
      { category: 'Camisas & Lino', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop' },
      { category: 'Sastrería & Pantalones', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400&auto=format&fit=crop' },
      { category: 'Bolsos & Calzado', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop',
    ],
    ingredientsImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    heritageImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    storyBg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
    colors: {
      primario: '#18181B',
      secundario: '#27272A',
      acento: '#A1A1AA',
      fondo: '#FAFAFA',
      texto: '#18181B',
    },
  },
}

function detectNicheKey(text: string): string {
  return detectNicheFromPrompt(text)
}

function extractJsonObject(raw: string): AiStoreCopyPayload | null {
  try {
    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null
    }

    const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
    return parsed && typeof parsed === 'object' ? (parsed as AiStoreCopyPayload) : null
  } catch {
    return null
  }
}

export async function generateStorefrontPackage(params: {
  name: string
  category?: string | null
  description?: string | null
  prompt?: string | null
  scope?: 'all' | 'copy' | 'style'
  products?: StoreInventoryProductInput[]
}): Promise<GeneratedStorePackage> {
  const realProducts = Array.isArray(params.products) ? params.products : []
  const productNamesSummary = realProducts
    .slice(0, 12)
    .map(p => `${p.name} (${p.category || 'General'})`)
    .join(', ')

  const combinedText = [
    params.prompt?.trim(),
    params.description?.trim(),
    params.name?.trim(),
    productNamesSummary,
  ]
    .filter(Boolean)
    .join('. ')

  const detectedKey = detectNicheKey(combinedText)
  const visualKit = NICHE_VISUAL_KITS[detectedKey] || NICHE_VISUAL_KITS.cafe

  // Extract real inventory intelligence
  const activeStockProducts = realProducts.filter(p => Number(p.stock) > 0)
  const sortedByStock = [...(activeStockProducts.length > 0 ? activeStockProducts : realProducts)].sort(
    (a, b) => Number(b.stock) - Number(a.stock)
  )
  const topStarProducts = sortedByStock.slice(0, 6)
  const realCategoriesMap = new Map<string, { count: number; totalStock: number; sampleImage?: string }>()
  for (const p of realProducts) {
    const cat = (p.category || 'General').trim()
    const firstImg = p.imageUrl?.split(',')[0]?.trim()
    const existing = realCategoriesMap.get(cat) || { count: 0, totalStock: 0, sampleImage: undefined }
    existing.count += 1
    existing.totalStock += Math.max(0, Number(p.stock) || 0)
    if (!existing.sampleImage && firstImg) existing.sampleImage = firstImg
    realCategoriesMap.set(cat, existing)
  }
  const realCategoriesList = Array.from(realCategoriesMap.entries()).map(([category, info]) => ({
    category,
    ...info,
  }))

  const realProductPhotos = realProducts
    .flatMap(p =>
      (p.imageUrl || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    )
    .slice(0, 8)

  const avgPrice =
    realProducts.length > 0
      ? Math.round(realProducts.reduce((acc, p) => acc + Number(p.price || 0), 0) / realProducts.length)
      : 75000
  const smartFreeShippingThreshold = Math.max(
    60000,
    Math.min(350000, Math.round((avgPrice * 1.6) / 10000) * 10000)
  )

  const inventoryPromptBlock =
    realProducts.length > 0
      ? `CONTEXTO REAL DE INVENTARIO Y STOCK DE LA TIENDA (ÚSALO OBLIGATORIAMENTE):
- Total productos en catálogo: ${realProducts.length} (${activeStockProducts.reduce((s, p) => s + Number(p.stock || 0), 0)} unidades totales en stock).
- Categorías reales disponibles: ${realCategoriesList.map(c => `"${c.category}" (${c.count} prod, ${c.totalStock} en stock)`).join(', ')}.
- Productos estrella con mayor stock: ${topStarProducts.map(p => `"${p.name}" ($${Number(p.price).toLocaleString('es-CO')}, stock: ${p.stock} uds${p.description ? `, detalle: ${p.description.slice(0, 70)}` : ''})`).join(' | ')}.
- Meta sugerida de envío gratis según ticket promedio: $${smartFreeShippingThreshold.toLocaleString('es-CO')}.
INSTRUCCIÓN DE INVENTARIO: Menciona los productos estrella reales y categorías reales en los titulares, subtítulos, diferenciales Bento, pasos del ritual y preguntas frecuentes.`
      : `La tienda aún está configurando su catálogo inicial en el nicho "${detectedKey}". Redacta textos inspiradores y listos para vender.`

  const base = buildIndustryStoreBlueprint({
    name: params.name,
    category: params.category,
    description: combinedText,
  })

  // Full default active sections sequence
  const fullSectionOrder: SectionId[] = [
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
  ]

  const fullActiveSections = {
    banner: true,
    destacados: true,
    categorias: true,
    editorialCategories: true,
    beneficios: true,
    bentoHighlights: true,
    accordionSpecs: true,
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
  }

  const apiKey = (process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY)?.trim()
  const hasRealKey = Boolean(apiKey && !apiKey.includes('placeholder'))

  let ai: AiStoreCopyPayload | null = null

  if (hasRealKey) {
    const isDeepSeek = !process.env.OPENROUTER_API_KEY && Boolean(process.env.DEEPSEEK_API_KEY)
    const apiUrl = isDeepSeek
      ? 'https://api.deepseek.com/v1'
      : process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1'
    const model = isDeepSeek
      ? 'deepseek-chat'
      : 'nvidia/nemotron-3.5-lightning:free'

    const systemPrompt = [
      'Eres el director de arte y redactor de marcas e-commerce líder en Latinoamérica.',
      'Diseña y redacta TODOS los componentes de la tienda con base estricta en lo que pide el usuario y en su inventario/stock real.',
      'Responde ÚNICAMENTE con un JSON válido y completo sin markdown ni explicaciones.',
      `Tipografías válidas: ${ALLOWED_FONTS.map(f => `"${f}"`).join(', ')}.`,
      'Estilos de hero válidos ("heroStyle"): "waterdrop-collage", "cinematic-overlay", "split-hero", "minimal-banner".',
      'Estilos de tarjeta válidos ("cardStyle"): "waterdrop-studio", "clean-border", "minimal-elevated", "glass-card".',
      'Estilos de barra superior válidos ("headerStyle"): "clean-border", "editorial-centered", "floating-glass".',
    ].join(' ')

    const userPrompt = `Transforma COMPLETAMENTE todos los componentes de la tienda con estos requerimientos:
- Nombre: "${params.name.trim()}"
- Giro / Nicho: "${params.category || detectedKey}"
- PETICIÓN EXACTA DEL USUARIO: "${params.prompt?.trim() || params.description?.trim() || 'Tienda moderna de alta conversión'}"
- Alcance: "${params.scope || 'all'}"

${inventoryPromptBlock}

Genera este objeto JSON exhaustivo con textos reales y persuasivos para cada sección (si el usuario pide modo oscuro o colores específicos en su petición, respétalos en el objeto "colors"):
{
  "presetId": "${visualKit.presetId}",
  "typography": "Plus Jakarta Sans",
  "heroStyle": "waterdrop-collage",
  "cardStyle": "waterdrop-studio",
  "headerStyle": "clean-border",
  "colors": {
    "primario": "${visualKit.colors.primario}",
    "secundario": "${visualKit.colors.secundario}",
    "acento": "${visualKit.colors.acento}",
    "fondo": "${visualKit.colors.fondo}",
    "texto": "${visualKit.colors.texto}"
  },
  "bio": "Propuesta de valor memorable de 1 frase (máx 130 caracteres)",
  "heroBadge": "INSIGNIA PERSUASIVA EN MAYÚSCULAS",
  "bannerTitle": "Titular de alto impacto para portada basado en los productos reales (máx 55 caracteres)",
  "bannerSubtitle": "Subtítulo convincente destacando el catálogo en stock y beneficios claros (máx 140 caracteres)",
  "bannerButtonText": "Explorar Catálogo",
  "announcementText": "Envíos gratis desde $${smartFreeShippingThreshold.toLocaleString('es-CO')} | Pagos seguros y contra entrega",
  "bentoTitle": "Diferenciales que Nos Hacen Únicos",
  "bentoItems": [
    { "emoji": "✨", "title": "Diferencial 1 sobre producto estrella", "desc": "Detalle concreto del inventario" },
    { "emoji": "🚀", "title": "Diferencial 2 sobre stock inmediato", "desc": "Detalle concreto de envío" },
    { "emoji": "🛡️", "title": "Diferencial 3 sobre garantía", "desc": "Detalle concreto de respaldo" }
  ],
  "visualCategories": [
    { "category": "${realCategoriesList[0]?.category || 'Categoría 1'}" },
    { "category": "${realCategoriesList[1]?.category || 'Categoría 2'}" },
    { "category": "${realCategoriesList[2]?.category || 'Categoría 3'}" },
    { "category": "${realCategoriesList[3]?.category || 'Categoría 4'}" }
  ],
  "processTitle": "Cómo Vivir la Experiencia en 3 Pasos",
  "processHeadline": "Simple, rápido y garantizado",
  "processSteps": [
    { "step": "01", "title": "Paso 1 del nicho", "desc": "Detalle del paso 1" },
    { "step": "02", "title": "Paso 2 del nicho", "desc": "Detalle del paso 2" },
    { "step": "03", "title": "Paso 3 del nicho", "desc": "Detalle del paso 3" }
  ],
  "ingredientsTitle": "Pureza & Calidad en Cada Detalle",
  "ingredientsLeftTitle": "Selección de Origen",
  "ingredientsLeftDesc": "Explicación detallada de materias primas",
  "ingredientsRightTitle": "Respaldo y Garantía",
  "ingredientsRightDesc": "Explicación del compromiso de calidad",
  "brandStoryTitle": "La Pasión Detrás de Nuestra Marca",
  "brandStoryDesc": "Párrafo emotivo sobre la fundación y misión",
  "narrativeP1": "Historia de cómo nació el proyecto",
  "narrativeP2": "Compromiso de entrega y calidad con el cliente",
  "pillar1Icon": "🌿",
  "pillar1Title": "Pilar de Valor 1",
  "pillar1Desc": "Detalle del pilar 1",
  "pillar2Icon": "🤝",
  "pillar2Title": "Pilar de Valor 2",
  "pillar2Desc": "Detalle del pilar 2",
  "faqs": [
    { "q": "Pregunta frecuente sobre los productos en stock y envíos", "a": "Respuesta clara sobre tiempos de entrega y cobertura" },
    { "q": "Pregunta frecuente sobre métodos de pago", "a": "Respuesta clara sobre pagos contra entrega y transferencias" },
    { "q": "Pregunta frecuente sobre garantías y cambios", "a": "Respuesta clara sobre política de satisfacción y cambios" },
    { "q": "Pregunta frecuente sobre asesoría", "a": "Respuesta sobre atención personalizada directa en WhatsApp" }
  ],
  "testimonials": [
    { "name": "Camila R.", "city": "Medellín", "comment": "Reseña entusiasta y creíble mencionando uno de los productos de la tienda", "stars": 5 },
    { "name": "Sebastián P.", "city": "Bogotá", "comment": "Reseña destacando la rapidez del envío", "stars": 5 },
    { "name": "Valentina M.", "city": "Cali", "comment": "Reseña felicitando la calidad y atención", "stars": 5 }
  ],
  "welcomeMessage": "Saludo personalizado para WhatsApp al recibir compradores",
  "niche": "${detectedKey}",
  "brandTone": "Elegante y persuasivo"
}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 22000)

    try {
      const res = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://flashcheckout.co',
          'X-Title': 'Flashcheckout Store Studio',
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 1600,
          reasoning: { max_tokens: 0 },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const msg = data?.choices?.[0]?.message
        const rawContent =
          (typeof msg?.content === 'string' ? msg.content : '') ||
          (typeof msg?.reasoning === 'string' ? msg.reasoning : '')

        if (rawContent) {
          ai = extractJsonObject(rawContent)
        }
      }
    } catch (e) {
      console.warn('OpenRouter request timed out or failed, using enhanced semantic builder:', e)
    } finally {
      clearTimeout(timeout)
    }
  }

  // Deterministic prompt-based fallbacks for dark mode / specific styles if requested in prompt
  const promptLower = (params.prompt || '').toLowerCase()
  const wantsDarkMode = /oscuro|dark|negro|nocturno|midnight|cyber/i.test(promptLower)
  const wantsSplitHero = /split|50\/50|mitad|dividido/i.test(promptLower)
  const wantsCinematicHero = /cinematic|cinemático|pantalla completa|overlay/i.test(promptLower)
  const wantsFloatingHeader = /flotante|glass|cápsula|capsula/i.test(promptLower)
  const wantsCenteredHeader = /centrado|editorial/i.test(promptLower)

  // Visual Palette and Typography resolution
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const resolvedColors = {
    primario: hexRegex.test(ai?.colors?.primario || '')
      ? ai!.colors!.primario!
      : wantsDarkMode
        ? '#FAFAFA'
        : visualKit.colors.primario,
    secundario: hexRegex.test(ai?.colors?.secundario || '')
      ? ai!.colors!.secundario!
      : wantsDarkMode
        ? '#A1A1AA'
        : visualKit.colors.secundario,
    acento: hexRegex.test(ai?.colors?.acento || '')
      ? ai!.colors!.acento!
      : visualKit.colors.acento,
    fondo: hexRegex.test(ai?.colors?.fondo || '')
      ? ai!.colors!.fondo!
      : wantsDarkMode
        ? '#09090B'
        : visualKit.colors.fondo,
    texto: hexRegex.test(ai?.colors?.texto || '')
      ? ai!.colors!.texto!
      : wantsDarkMode
        ? '#FAFAFA'
        : visualKit.colors.texto,
  }

  const finalPreset = wantsDarkMode
    ? 'midnight'
    : ai?.presetId && PRESETS.some(p => p.id === ai.presetId)
      ? ai.presetId
      : visualKit.presetId

  const finalTypography = ai?.typography && ALLOWED_FONTS.includes(ai.typography)
    ? ai.typography
    : 'Plus Jakarta Sans'

  const finalHeroStyle = wantsSplitHero
    ? 'split-hero'
    : wantsCinematicHero
      ? 'cinematic-overlay'
      : ai?.heroStyle && ['waterdrop-collage', 'cinematic-overlay', 'split-hero', 'minimal-banner'].includes(ai.heroStyle)
        ? ai.heroStyle
        : 'waterdrop-collage'

  const finalHeaderStyle = wantsFloatingHeader
    ? 'floating-glass'
    : wantsCenteredHeader
      ? 'editorial-centered'
      : ai?.headerStyle && ['clean-border', 'editorial-centered', 'floating-glass'].includes(ai.headerStyle)
        ? ai.headerStyle
        : 'clean-border'

  const finalCardStyle =
    ai?.cardStyle && ['waterdrop-studio', 'clean-border', 'minimal-elevated', 'glass-card'].includes(ai.cardStyle)
      ? ai.cardStyle
      : 'waterdrop-studio'

  // Bento Items resolution (incorporating real star products if fallback is used)
  const starProduct = topStarProducts[0]
  const resolvedBentoItems = Array.isArray(ai?.bentoItems) && ai!.bentoItems!.length >= 3
    ? ai!.bentoItems!.slice(0, 3).map((item, idx) => ({
      emoji: item.emoji?.trim() || base.aiSettings.bentoHighlights?.items?.[idx]?.emoji || '✨',
      title: item.title?.trim() || base.aiSettings.bentoHighlights?.items?.[idx]?.title || 'Calidad Superior',
      desc: item.desc?.trim() || base.aiSettings.bentoHighlights?.items?.[idx]?.desc || 'Selección rigurosa.',
    }))
    : [
      {
        emoji: '✨',
        title: starProduct ? `Destacado: ${starProduct.name}` : 'Calidad de Origen',
        desc: starProduct
          ? `Disponible en stock inmediato (${starProduct.stock} uds) por $${Number(starProduct.price).toLocaleString('es-CO')}.`
          : 'Insumos 100% auténticos y seleccionados en origen.',
      },
      {
        emoji: '⚡',
        title: `Stock Activo (${realProducts.length || 'Full'} Referencias)`,
        desc: 'Empaque protegido y despacho prioritario en 24-48 horas a todo el país.',
      },
      {
        emoji: '🤝',
        title: 'Asesoría Directa WhatsApp',
        desc: 'Acompañamiento personalizado en vivo y pago seguro o contra entrega.',
      },
    ]

  // Visual Categories resolution: prioritize REAL store categories & real product photos!
  const resolvedVisualCategories =
    realCategoriesList.length > 0
      ? realCategoriesList.slice(0, 6).map((realCat, idx) => ({
        category: realCat.category,
        imageUrl:
          realCat.sampleImage ||
          visualKit.visualCategories[idx % visualKit.visualCategories.length]?.imageUrl ||
          visualKit.bannerUrl,
      }))
      : Array.isArray(ai?.visualCategories) && ai!.visualCategories!.length >= 2
        ? ai!.visualCategories!.slice(0, 4).map((c, idx) => ({
          category: c.category?.trim() || visualKit.visualCategories[idx]?.category || `Colección ${idx + 1}`,
          imageUrl: visualKit.visualCategories[idx]?.imageUrl || visualKit.bannerUrl,
        }))
        : visualKit.visualCategories

  // Process Timeline (Ritual) resolution
  const resolvedProcessSteps = Array.isArray(ai?.processSteps) && ai!.processSteps!.length >= 3
    ? ai!.processSteps!.slice(0, 3).map((s, idx) => ({
      step: s.step || `0${idx + 1}`,
      title: s.title || `Paso ${idx + 1}`,
      desc: s.desc || 'Experiencia garantizada.',
      imageUrl:
        realProductPhotos[idx] ||
        visualKit.visualCategories[idx]?.imageUrl ||
        visualKit.lifestyleGallery[idx] ||
        visualKit.bannerUrl,
    }))
    : [
      {
        step: '01',
        title: starProduct ? `Elige tu ${starProduct.name}` : 'Selección en Catálogo',
        desc: 'Explora nuestras colecciones con disponibilidad real verificada en inventario.',
        imageUrl: realProductPhotos[0] || visualKit.visualCategories[0]?.imageUrl || visualKit.bannerUrl,
      },
      {
        step: '02',
        title: 'Confirmación Instantánea',
        desc: 'Completa tu bolsa en segundos por WhatsApp o con pago en línea seguro.',
        imageUrl: realProductPhotos[1] || visualKit.visualCategories[1]?.imageUrl || visualKit.lifestyleGallery[0],
      },
      {
        step: '03',
        title: 'Recibe en tu Puerta',
        desc: 'Despachamos de inmediato con guía de seguimiento hasta tus manos.',
        imageUrl: realProductPhotos[2] || visualKit.visualCategories[2]?.imageUrl || visualKit.lifestyleGallery[1],
      },
    ]

  // FAQs resolution
  const resolvedFaqs = Array.isArray(ai?.faqs) && ai!.faqs!.length >= 2
    ? ai!.faqs!.slice(0, 5).map(f => ({ q: f.q!.trim(), a: f.a!.trim() }))
    : base.aiSettings.faqs?.items || [
      { q: '¿Qué medios de pago reciben?', a: 'Aceptamos transferencias Nequi, Bancolombia, PSE, tarjetas de crédito y pago contra entrega en ciudades principales.' },
      { q: '¿Los productos publicados tienen stock inmediato?', a: `Sí, nuestro catálogo de ${realProducts.length || 'todas nuestras'} referencias muestra disponibilidad en tiempo real para despacho en menos de 24 horas.` },
      { q: '¿Tienen garantía de satisfacción?', a: 'Sí, todas tus compras cuentan con garantía de cambio y soporte directo vía WhatsApp.' },
      { q: '¿Cómo obtengo envío gratis?', a: `Todos los pedidos superiores a $${smartFreeShippingThreshold.toLocaleString('es-CO')} incluyen envío gratuito automático.` },
    ]

  // Testimonials resolution
  const resolvedTestimonials = Array.isArray(ai?.testimonials) && ai!.testimonials!.length >= 2
    ? ai!.testimonials!.slice(0, 4).map(t => ({
      name: t.name?.trim() || 'Cliente Verificado',
      city: t.city?.trim() || 'Colombia',
      stars: t.stars || 5,
      comment: t.comment?.trim() || 'Excelente producto y atención por WhatsApp. Muy recomendado.',
    }))
    : base.aiSettings.testimonials?.items || [
      { name: 'Camila Restrepo', city: 'Medellín', stars: 5, comment: starProduct ? `Compré ${starProduct.name} y la calidad superó mis expectativas. Llegó súper rápido.` : 'La calidad superó mis expectativas. El pedido llegó súper rápido y perfectamente empacado.' },
      { name: 'Sebastián Pardo', city: 'Bogotá', stars: 5, comment: 'La atención por WhatsApp es impecable. Resolveron mis dudas y me asesoraron al instante.' },
      { name: 'Valentina Mejía', city: 'Cali', stars: 5, comment: 'Comprar por el catálogo es muy fácil y la experiencia es 10/10.' },
    ]

  const finalBio = ai?.bio?.trim() || base.bio || `Calidad, diseño y atención personalizada en ${params.name.trim()}.`
  const finalBannerTitle =
    ai?.bannerTitle?.trim() ||
    (starProduct ? `${params.name.trim()}: Descubre ${starProduct.name}` : `Descubre lo mejor de ${params.name.trim()}`)
  const finalBannerSubtitle =
    ai?.bannerSubtitle?.trim() ||
    (realProducts.length > 0
      ? `Explora nuestras ${realProducts.length} referencias en stock (${realCategoriesList.map(c => c.category).slice(0, 3).join(', ')}) con envío rápido a todo el país.`
      : 'Productos seleccionados con altos estándares y despacho rápido a todo el país.')

  return {
    bio: finalBio,
    welcomeMessage: ai?.welcomeMessage?.trim() || `¡Hola! Bienvenido a ${params.name.trim()}. ¿En qué te podemos asesorar hoy?`,
    systemPrompt: `Eres Nova, asesor oficial de ${params.name.trim()} (${detectedKey}). Tu tono es "${ai?.brandTone || 'Elegante y persuasivo'}". Guía al cliente y responde dudas amablemente.`,
    businessProfile: {
      niche: ai?.niche || detectedKey,
      targetAudience: ai?.targetAudience || 'Compradores que buscan calidad y servicio ágil',
      brandTone: ai?.brandTone || 'Elegante y persuasivo',
      coreProposition: finalBio,
    },
    aiSettings: {
      ...base.aiSettings,
      sections: fullActiveSections,
      sectionOrder: fullSectionOrder,
      themePreset: finalPreset,
      colors: resolvedColors,
      typography: finalTypography,
      borderRadius: 'smooth',
      shadowStyle: 'flat',
      headerStyle: finalHeaderStyle,
      heroStyle: finalHeroStyle,
      cardStyle: finalCardStyle,
      cardAspectRatio: 'portrait',
      freeShipping: {
        enabled: true,
        threshold: smartFreeShippingThreshold,
      },
      heroBadge: ai?.heroBadge?.trim() || (starProduct ? `✨ DESTACADO: ${starProduct.name.slice(0, 24).toUpperCase()}` : '✨ COLECCIÓN OFICIAL 2026'),
      heroPanels: realProductPhotos.length >= 4 ? realProductPhotos.slice(0, 4) : visualKit.heroPanels,
      bannerUrl: visualKit.bannerUrl,
      bannerTitle: finalBannerTitle,
      bannerSubtitle: finalBannerSubtitle,
      bannerButton: {
        text: ai?.bannerButtonText?.trim() || 'Comprar ahora',
        action: 'scroll',
        link: '',
      },
      announcement: {
        enabled: true,
        text: ai?.announcementText?.trim() || `🚚 Envíos gratis desde $${smartFreeShippingThreshold.toLocaleString('es-CO')} | Pagos seguros y contra entrega`,
        bgColor: wantsDarkMode ? resolvedColors.acento : resolvedColors.primario,
        textColor: wantsDarkMode ? '#111111' : '#FFFFFF',
      },
      bentoHighlights: {
        title: ai?.bentoTitle?.trim() || 'Por Qué Elegirnos',
        items: resolvedBentoItems,
      },
      visualCategories: resolvedVisualCategories,
      processTimeline: {
        headline: ai?.processHeadline?.trim() || 'Experiencia sin complicaciones',
        title: ai?.processTitle?.trim() || `Así se vive la experiencia ${params.name.trim()}`,
        items: resolvedProcessSteps,
      },
      ingredientsSection: {
        title: ai?.ingredientsTitle?.trim() || 'Calidad & Pureza en Cada Detalle',
        leftTitle: ai?.ingredientsLeftTitle?.trim() || 'Selección Rigurosa',
        leftDesc: ai?.ingredientsLeftDesc?.trim() || 'Insumos verificados y estándares de excelencia garantizados en cada entrega.',
        centerImageUrl: realProductPhotos[0] || visualKit.ingredientsImage,
        rightTitle: ai?.ingredientsRightTitle?.trim() || 'Respaldo Absoluto',
        rightDesc: ai?.ingredientsRightDesc?.trim() || 'Acompañamiento cercano antes, durante y después de tu compra por WhatsApp.',
      },
      lifestyleGallery: visualKit.lifestyleGallery,
      ugcGallery: [
        ...realProductPhotos.slice(0, 4),
        ...visualKit.lifestyleGallery,
        ...visualKit.visualCategories.map(v => v.imageUrl),
        visualKit.bannerUrl,
      ],
      brandStory: {
        title: ai?.brandStoryTitle?.trim() || `Nuestra Pasión en ${params.name.trim()}`,
        desc: ai?.brandStoryDesc?.trim() || 'Nacimos con la misión de brindar productos auténticos que eleven tu día a día con honestidad y diseño.',
        bgUrl: visualKit.storyBg,
        btnText: 'Conocer nuestra historia',
        btnLink: '',
      },
      brandStoryPage: {
        headerTrayectoria: 'Nuestra Esencia',
        headerPerfil: `Sobre ${params.name.trim()}`,
        narrativeP1: ai?.narrativeP1?.trim() || 'Combinamos pasión artesanal con estándares modernos para crear una experiencia memorable.',
        narrativeP2: ai?.narrativeP2?.trim() || 'Cada pedido es preparado con dedicación y monitoreado hasta llegar a tus manos.',
        imageHeritage: visualKit.heritageImg,
        pillarsTitle: 'Nuestros Pilares',
        pillar1Icon: ai?.pillar1Icon || '🌿',
        pillar1Title: ai?.pillar1Title?.trim() || 'Calidad Sin Compromisos',
        pillar1Desc: ai?.pillar1Desc?.trim() || 'Trabajamos con las mejores materias primas del mercado.',
        pillar2Icon: ai?.pillar2Icon || '🤝',
        pillar2Title: ai?.pillar2Title?.trim() || 'Servicio Personalizado',
        pillar2Desc: ai?.pillar2Desc?.trim() || 'Atención directa y humana para resolver cualquier duda.',
        leadership: [],
        values: [
          { title: 'Excelencia', desc: 'Cuidado meticuloso en cada entrega.' },
          { title: 'Transparencia', desc: 'Precios justos y envíos con guía clara.' },
          { title: 'Cercanía', desc: 'Comunicación fluida y amable por WhatsApp.' },
        ],
      },
      faqs: {
        enabled: true,
        title: 'Preguntas Frecuentes',
        items: resolvedFaqs,
      },
      testimonials: {
        enabled: true,
        title: `La voz de nuestros clientes`,
        subtitle: 'Opiniones 100% verificadas de compradores en todo el país.',
        items: resolvedTestimonials,
      },
      retailers: {
        title: 'Puntos de Entrega & Cobertura',
        subtitle: `Enviamos a todo el país con despacho prioritario desde nuestras sedes principales.`,
        ctaText: 'Consultar cobertura por WhatsApp',
        items: [
          { name: 'Bogotá & Sabana', badge: 'Entrega 24h' },
          { name: 'Medellín & Área Met.', badge: 'Entrega 24h' },
          { name: 'Cali, Eje & Costa', badge: '24–48h Express' },
          { name: 'WhatsApp Oficial', badge: 'Atención VIP' },
        ],
      },
      pressLogos: [
        { name: 'EDITORIAL', subtitle: 'Selección Oficial' },
        { name: 'FORBES', subtitle: 'Innovación E-commerce' },
        { name: 'VOGUE', subtitle: 'Tendencia 2026' },
        { name: 'VERIFICADO', subtitle: 'Calidad 5★' },
        { name: 'EXPRESS', subtitle: 'Envíos Nacionales' },
      ],
      ambassadors: {
        title: 'Recomendado por nuestra comunidad',
        subtitle: 'Personas y especialistas que eligen nuestra marca día a día.',
        items: [
          { name: 'Camila Restrepo', role: 'Embajadora de Marca', imageUrl: visualKit.heroPanels[1] },
          { name: 'Sebastián Pardo', role: 'Cliente Frecuente', imageUrl: visualKit.heroPanels[2] },
          { name: 'Valentina Mejía', role: 'Creadora de Contenido', imageUrl: visualKit.heroPanels[3] },
        ],
      },
      seo: {
        title: `${params.name.trim()} | Tienda Oficial`,
        desc: finalBio,
      },
    },
  }
}
