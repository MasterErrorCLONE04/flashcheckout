import type { Transition } from 'framer-motion'

export type DocSection = {
  id: string
  label: string
  items: Array<{ id: string; label: string }>
}

export const pageTransition: {
  initial: { opacity: number; y: number }
  animate: { opacity: number; y: number }
  exit: { opacity: number; y: number }
  transition: Transition
} = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
}

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'primeros-pasos',
    label: 'Primeros Pasos',
    items: [
      { id: 'inicio-rapido', label: 'Inicio rápido' },
      { id: 'acceso-y-login', label: 'Acceso y seguridad' },
    ],
  },
  {
    id: 'agentes-ia-menu',
    label: 'Agentes de IA (Nuevo)',
    items: [{ id: 'agentes-ia', label: 'Copilotos Multitarea' }],
  },
  {
    id: 'cobros-menu',
    label: 'Pasarelas de Pago',
    items: [
      { id: 'stripe-connect', label: 'Stripe Connect' },
      { id: 'mercado-pago', label: 'Mercado Pago' },
      { id: 'verificacion-pagos', label: 'Validar Transferencias' },
    ],
  },
  {
    id: 'automatizaciones-menu',
    label: 'Automatizaciones',
    items: [{ id: 'automatizaciones-whatsapp', label: 'WhatsApp Automations' }],
  },
  {
    id: 'crm-menu',
    label: 'CRM y Conversaciones',
    items: [{ id: 'crm-conversaciones', label: 'Historial & Live Chat' }],
  },
  {
    id: 'marketing-menu',
    label: 'Marketing & Config',
    items: [
      { id: 'cupones-descuento', label: 'Cupones de Descuento' },
      { id: 'bandeja-inteligente', label: 'Bandeja Inteligente' },
      { id: 'constructor-tienda', label: 'Constructor de Tienda' },
    ],
  },
]

