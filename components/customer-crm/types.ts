export type CustomerRecord = {
  id: string | null
  customerKey: string
  phone: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  status: 'Activo' | 'Inactivo'
  segment: 'Frecuente' | 'Ocasional' | 'Nuevo'
  city: string
  birthDate: string
  notes: string
}

export type SerializedOrder = {
  id: string
  customerKey: string
  customerName: string
  customerPhone: string
  total: number
  status: string
  createdAt: string
}

export interface CustomerCRMProps {
  initialCustomers: CustomerRecord[]
  initialOrders: SerializedOrder[]
}

