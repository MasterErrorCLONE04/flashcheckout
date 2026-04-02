interface OrderPayload {
  storeName: string
  whatsapp: string
  customerName: string
  items: { name: string; qty: number; price: number }[]
  total: number
  address: string
  city: string
}

export function buildWhatsAppLink(order: OrderPayload): string {
  const lines = order.items
    .map(i => `${i.qty}x ${i.name} — $${i.price.toLocaleString('es-CO')}`)
    .join(', ')

  const total = order.total.toLocaleString('es-CO')

  const msg = [
    `Hola ${order.storeName}! Soy ${order.customerName},`,
    `acabo de armar mi pedido: ${lines}.`,
    `Total: $${total}.`,
    `Envío a: ${order.address}, ${order.city}.`,
    `¿A qué cuenta te transfiero?`,
  ].join(' ')

  return `https://wa.me/${order.whatsapp}?text=${encodeURIComponent(msg)}`
}
