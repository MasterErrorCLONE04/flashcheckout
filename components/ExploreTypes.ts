export type ExploreTheme = 'light' | 'dark'

export type ExploreSearchParams = {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  theme?: ExploreTheme
}

export type ExploreStore = {
  id: string
  slug: string
  name: string
  category: string | null
  logoUrl: string | null
  bio: string | null
  verificationLevel: number
  whatsappVerified: boolean
  stripeConnectChargesEnabled: boolean
  mpConnected: boolean
  products: Array<{
    id: string
    name: string
    price: number
    imageUrl: string | null
  }>
  settings?: any
  _count: {
    products: number
  }
}

export type ExploreCategory = {
  name: string
  label: string
}
