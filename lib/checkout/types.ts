export type CheckoutMediaSettings = {
  bannerUrl?: string | null
}

export type PublicCheckoutProduct = {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  badge?: string | null
  stock: number
  imageUrl: string | null
  category?: string | null
  description?: string | null
  options?: unknown
}

export type PublicCheckoutStore = {
  id: string
  slug?: string
  name: string
  whatsapp: string
  category?: string | null
  products: PublicCheckoutProduct[]
  logoUrl: string | null
  bio: string | null
  cardPaymentsEnabled: boolean
  aiSettings: Record<string, unknown>
  bannerUrl: string | null
}

export type InitialCheckoutSessionData = {
  customerName: string
  address: string
}
