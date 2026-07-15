export type WhatsAppChatMessage = {
  sender: 'user' | 'bot'
  text: string
  time: string
  timestamp: number
  type?: 'text' | 'image' | 'document' | 'system'
  meta?: Record<string, unknown>
}

export type CartLine = {
  id: string
  name: string
  price: number
  qty: number
  storeId?: string
}

export type CartState = {
  items: Record<string, CartLine>
}

export function parseCartState(cart: unknown): CartState | null {
  if (!cart) return null

  const source = typeof cart === 'string' ? safeParseJson(cart) : cart
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null

  const rawItems = (source as { items?: unknown }).items
  if (!rawItems || typeof rawItems !== 'object' || Array.isArray(rawItems)) return null

  const items: Record<string, CartLine> = {}
  for (const [id, value] of Object.entries(rawItems as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue

    const record = value as Record<string, unknown>
    const qty = Math.max(0, Math.floor(Number(record.qty)))
    const price = Number(record.price)
    const name = typeof record.name === 'string' && record.name.trim() ? record.name.trim() : 'Producto'

    if (!id || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) continue

    items[id] = {
      id,
      name,
      price,
      qty,
      storeId: typeof record.storeId === 'string' ? record.storeId : undefined,
    }
  }

  return { items }
}

export function cartStateToLines(cart: unknown): CartLine[] {
  const state = parseCartState(cart)
  return state ? Object.values(state.items) : []
}

export function buildCartState(lines: CartLine[]): CartState {
  return {
    items: lines.reduce<Record<string, CartLine>>((acc, item) => {
      acc[item.id] = item
      return acc
    }, {}),
  }
}

export function normalizeChatMessages(messages: unknown): WhatsAppChatMessage[] {
  if (!Array.isArray(messages)) return []

  return messages.filter((message): message is WhatsAppChatMessage => {
    if (!message || typeof message !== 'object') return false

    const record = message as Record<string, unknown>
    const sender = record.sender
    return (
      (sender === 'user' || sender === 'bot') &&
      typeof record.text === 'string' &&
      typeof record.time === 'string' &&
      typeof record.timestamp === 'number'
    )
  })
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
