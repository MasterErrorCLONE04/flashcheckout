export type StepType = {
  num: number
  label: string
  shortLabel: string
  category: string
  desc: string
}

export const STEPS: StepType[] = [
  { num: 1, label: 'Bienvenido', shortLabel: 'Inicio', category: 'Introducción', desc: 'Conoce cómo Nova venderá por ti' },
  { num: 2, label: 'Información del negocio', shortLabel: 'Negocio', category: 'Identidad Comercial', desc: 'Nombre, slug público y número' },
  { num: 3, label: 'Conecta WhatsApp', shortLabel: 'WhatsApp', category: 'Canal de Ventas', desc: 'Vincula tu WhatsApp Business con QR' },
  { num: 4, label: 'Catálogo de productos', shortLabel: 'Productos', category: 'Inventario', desc: 'Añade tus artículos estrella' },
  { num: 5, label: 'Métodos de pago', shortLabel: 'Pagos', category: 'Cobranza', desc: 'Nequi, Daviplata y Mercado Pago' },
  { num: 6, label: 'Preferencias de Nova', shortLabel: 'Agente IA', category: 'Memoria & Bot', desc: 'Personaliza tono y bienvenida' },
  { num: 7, label: 'Revisa y confirma', shortLabel: 'Resumen', category: 'Verificación', desc: 'Comprueba los detalles de tu tienda' },
  { num: 8, label: '¡Lanzamiento!', shortLabel: 'Listo', category: 'En producción', desc: 'Tu tienda está en vivo' }
]

export type WhatsAppStatus = 'DISCONNECTED' | 'LOADING' | 'QRCODE' | 'CONNECTED' | 'ERROR'

export interface StoreForm {
  name: string
  slug: string
  whatsapp: string
  category: string
  businessDescription: string
}

export interface ProductForm {
  name: string
  price: string
  stock: string
  description: string
  imageUrl: string
}

export interface AddedProduct {
  id?: string
  name: string
  price: number
  stock: number
  description?: string
  imageUrl?: string
  active?: boolean
}

export interface PaymentsState {
  mercadopago: boolean
  manual: boolean
}

export interface PreferencesState {
  welcomeMessage: string
  systemPrompt: string
  businessHours: string
  themeColor: string
}

export interface BusinessProfileState {
  niche: string
  targetAudience: string
  brandTone: string
  coreProposition: string
}

export interface StoreWizardProps {
  isNewStore?: boolean
  isPro?: boolean
  hasExistingStores?: boolean
}
