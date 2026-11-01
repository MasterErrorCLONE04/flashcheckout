export type Automation = {
  id: string
  name: string
  description: string
  active: boolean
  sentToday: number
  rate: string
  rateLabel: string
  icon: string
  iconColor: string
  channels: string[]
  customTemplate?: string | null
}

export type AutomationFilterTab = 'all' | 'active' | 'inactive'

export type AutomationTemplate = {
  name: string
  desc: string
  icon: string
  channels: string[]
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  { name: 'Mensaje de bienvenida', desc: 'Saluda a nuevos clientes', icon: '👋', channels: ['WhatsApp'] },
  { name: 'Recuperar carrito', desc: 'Recordatorio de carrito abandonado', icon: '🛒', channels: ['WhatsApp'] },
  { name: 'Pedido pagado', desc: 'Confirma el pago del pedido', icon: '💳', channels: ['WhatsApp', 'Email'] },
  { name: 'Pedido listo', desc: 'Notifica que el pedido está listo', icon: '📦', channels: ['WhatsApp'] },
  { name: 'Calificar servicio', desc: 'Pide una reseña al cliente', icon: '⭐', channels: ['WhatsApp'] },
]

export const TEMPLATE_PLACEHOLDERS = [
  { tag: '{{cliente}}', label: 'Nombre del cliente' },
  { tag: '{{pedido_id}}', label: 'Identificador del pedido' },
  { tag: '{{total}}', label: 'Total del pedido formateado' },
  { tag: '{{tienda}}', label: 'Nombre de tu tienda' },
] as const

