export type OrderItem = {
  name: string
  qty: number
  price: number
}

export type OrderDriver = {
  id: string
  name: string
  phoneNumber: string
  active: boolean
  available: boolean
  rating: number
  ordersDelivered: number
}

export type Order = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  deliveryRequested: boolean
  source: string
  driverId: string | null
  driver: OrderDriver | null
}

export interface OrderListProps {
  initialOrders: Order[]
  storeName: string
}

export const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Esperando Pago', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'payment_review', label: 'Comprobante Subido', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { value: 'confirmed', label: 'Confirmado', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { value: 'in_transit', label: 'En Camino (Flash)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { value: 'shipped_external', label: 'Enviado Externo', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'delivered', label: 'Entregado', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelado', color: 'text-rose-700 bg-rose-50 border-rose-200' },
] as const

export const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`

export const formatOrderDate = (value: string) =>
  new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

