export type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category?: string | null
  description?: string | null
  options?: any
  active: boolean
  aiRecommendation?: boolean
  aiDescription?: string | null
  createdAt?: Date | string
}

export type ProductImageItem = {
  id: string
  file?: File
  url?: string
  preview: string
}

export type ProductOption = {
  name: string
  values: string
}

export type ProductFormData = {
  name: string
  price: string
  stock: string
  category: string
  description: string
  active: boolean
  aiRecommendation: boolean
  aiDescription: string
}

export type ProductStatusFilter = 'all' | 'active' | 'low_stock' | 'out_of_stock' | 'hidden'
export type ProductSortBy = 'recent' | 'price_desc' | 'price_asc' | 'stock_asc' | 'name_asc'
export type ProductViewMode = 'grid' | 'table'

export interface ProductManagerProps {
  initialProducts: Product[]
  storeId: string
  storeSlug: string
  storeName?: string
  isPro: boolean
}
