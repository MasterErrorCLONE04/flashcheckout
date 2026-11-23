export type CustomerSegment = 'Frecuente' | 'Comprador' | 'Intención'

export type CustomerRecord = {
  id: string | null
  customerKey: string
  phone: string
  name: string
  email: string
  paidOrders: number
  intentOrders: number
  totalOrders: number
  totalSpent: number
  intentAmount: number
  intentDetail: string
  lastOrderDate: string
  status: 'Pagado' | 'Intención'
  segment: CustomerSegment
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
  paymentStatus: string
  isPaid: boolean
  itemsSummary: string
  createdAt: string
}

export interface CustomerCRMProps {
  initialCustomers: CustomerRecord[]
  initialOrders: SerializedOrder[]
  storeName?: string
}
