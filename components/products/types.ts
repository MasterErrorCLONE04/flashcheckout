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
}

export interface ProductManagerProps {
  initialProducts: Product[]
  storeId: string
  storeSlug: string
  isPro: boolean
}
