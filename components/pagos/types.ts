import type { ComponentType } from 'react'

export type PaymentStatusLabel = 'Exitoso' | 'Por Validar' | 'Pendiente' | 'Fallido'

export interface Payment {
  id: string
  ref: string
  gatewayId: string | null
  proofImageUrl: string | null
  source: string
  itemsSummary: string
  cliente: { name: string; phone: string; initials: string }
  pedido: string
  prodCount: number
  metodo: {
    label: 'Transferencia / Bre-B' | 'Mercado Pago' | 'Tarjeta Stripe' | 'Contra Entrega'
    icon: ComponentType<{ className?: string }>
  }
  estado: PaymentStatusLabel
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
  customerWhatsAppId?: string | null
  source?: string | null
  status: string
  paymentStatus: string
  stripeCheckoutSessionId: string | null
  mpPaymentId: string | null
  mpPreferenceId: string | null
  proofImageUrl: string | null
  items: Array<{ name?: string; title?: string; qty?: number; quantity?: number; price?: number }>
  createdAt: string
  total: number
}
