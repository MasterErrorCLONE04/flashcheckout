export type CheckoutProduct = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
}

export type CheckoutStore = {
  id: string
  name: string
  whatsapp: string
  products: CheckoutProduct[]
  logoUrl: string | null
  cardPaymentsEnabled: boolean
}

export type CheckoutFormValues = {
  customerName: string
  address: string
  city: string
  lat: number | null
  lng: number | null
}

export type CheckoutLoadingAction = null | 'whatsapp' | 'card'

export interface CheckoutFormProps {
  store: CheckoutStore
  initialPhone?: string
}

