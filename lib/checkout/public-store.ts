import 'server-only'

import { cartStateToLines } from '@/lib/whatsapp/session-state'
import type {
  InitialCheckoutSessionData,
  PublicCheckoutProduct,
  PublicCheckoutStore,
} from './types'

type StoreSource = {
  id: string
  name: string
  whatsapp: string
  logoUrl: string | null
  bio: string | null
  aiSettings: unknown
  products: Array<{
    id: string
    name: string
    price: number
    stock: number
    imageUrl: string | null
    category: string | null
    description: string | null
    options: unknown
  }>
}

type SessionCart = unknown

function normalizeAiSettings(aiSettings: unknown): Record<string, unknown> {
  if (!aiSettings || typeof aiSettings !== 'object' || Array.isArray(aiSettings)) {
    return {}
  }

  return aiSettings as Record<string, unknown>
}

function normalizeProducts(products: StoreSource['products']): PublicCheckoutProduct[] {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    stock: Number(product.stock),
    imageUrl: product.imageUrl,
    category: product.category ?? undefined,
    description: product.description ?? undefined,
    options: product.options,
  }))
}

export function buildPublicCheckoutStore(
  store: StoreSource,
  cardPaymentsEnabled = true
): PublicCheckoutStore {
  const aiSettings = normalizeAiSettings(store.aiSettings)

  return {
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp,
    products: normalizeProducts(store.products),
    logoUrl: store.logoUrl,
    bio: store.bio,
    cardPaymentsEnabled,
    aiSettings,
    bannerUrl: typeof aiSettings.bannerUrl === 'string' ? aiSettings.bannerUrl : null,
  }
}

function parseLegacyCart(sessionCart: SessionCart): Record<string, number> {
  if (!sessionCart || typeof sessionCart !== 'object' || Array.isArray(sessionCart)) {
    return {}
  }

  const record = sessionCart as {
    items?: Record<string, unknown>
    productId?: string
  }

  if (record.items && typeof record.items === 'object' && !Array.isArray(record.items)) {
    const normalized: Record<string, number> = {}

    for (const [id, raw] of Object.entries(record.items)) {
      if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
        normalized[id] = raw
        continue
      }

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const entry = raw as { qty?: unknown }
        const qty = Number(entry.qty)
        if (Number.isFinite(qty) && qty > 0) {
          normalized[id] = qty
        }
      }
    }

    return normalized
  }

  if (typeof record.productId === 'string') {
    return { [record.productId]: 1 }
  }

  return {}
}

export function buildInitialCheckoutCart(sessionCart: SessionCart): Record<string, number> {
  const normalized = cartStateToLines(sessionCart).reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = item.qty
    return acc
  }, {})

  if (Object.keys(normalized).length > 0) {
    return normalized
  }

  return parseLegacyCart(sessionCart)
}

export function buildInitialCheckoutSessionData(
  customerName: string | null | undefined,
  address: string | null | undefined
): InitialCheckoutSessionData {
  return {
    customerName: customerName || '',
    address: address || '',
  }
}
