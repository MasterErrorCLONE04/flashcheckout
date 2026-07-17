export type CheckoutMediaSettings = {
  bannerUrl?: string | null
}

export type PublicCheckoutProduct = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category?: string | null
  description?: string | null
  options?: unknown
}

export type PublicCheckoutStore = {
  id: string
  name: string
  whatsapp: string
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
