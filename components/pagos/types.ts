import type { ComponentType } from 'react'

export interface Payment {
  id: string
  ref: string
  cliente: { name: string; phone: string; initials: string; bg: string }
  pedido: string
  prodCount: number
  metodo: { label: string; icon: ComponentType<{ className?: string }>; iconBg: string; iconColor: string }
  estado: 'Exitoso' | 'Pendiente' | 'Fallido'
  fecha: string
  monto: number
}

export interface Refund {
  name: string
  ref: string
  time: string
  monto: number
}

export type PaymentOrder = {
  id: string
  customerName: string | null
  customerPhone: string | null
  status: string
  paymentStatus: string
  stripeCheckoutSessionId: string | null
  mpPaymentId: string | null
  mpPreferenceId: string | null
  proofImageUrl: string | null
  items: Array<{ qty?: number }>
  createdAt: string
  total: number
}
