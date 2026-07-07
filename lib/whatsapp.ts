interface OrderPayload {
  storeName: string
  whatsapp: string
  customerName: string
  items: { name: string; qty: number; price: number }[]
  total: number
  address: string
  city: string
}

export function buildWhatsAppLink(order: OrderPayload, template?: string): string {
  const lines = order.items
    .map(i => `${i.qty}x ${i.name} — $${i.price.toLocaleString('es-CO')}`)
    .join('\n')

  const total = order.total.toLocaleString('es-CO')

  let msg = ''
  if (template) {
    msg = template
      .replace('{cliente_nombre}', order.customerName)
      .replace('{lista_productos}', lines)
      .replace('{monto_total}', `$${total}`)
      .replace('{direccion}', `${order.address}, ${order.city}`)
  } else {
    const defaultLines = order.items
      .map(i => `${i.qty}x ${i.name} — $${i.price.toLocaleString('es-CO')}`)
      .join(', ')
    msg = [
      `Hola ${order.storeName}! Soy ${order.customerName},`,
      `acabo de armar mi pedido: ${defaultLines}.`,
      `Total: $${total}.`,
      `Envío a: ${order.address}, ${order.city}.`,
      `¿A qué cuenta te transfiero?`,
    ].join(' ')
  }

  return `https://wa.me/${order.whatsapp}?text=${encodeURIComponent(msg)}`
}
