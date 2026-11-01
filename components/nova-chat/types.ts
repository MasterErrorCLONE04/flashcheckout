export interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
  type?: 'products_list' | 'discount_card' | 'text' | 'product_created_card' | 'product_updated' | 'order_status_updated' | 'orders_list' | 'sales_metrics' | 'customer_chat'
  products?: { name: string; sales: string; price: string }[]
  coupon?: { code: string; desc: string; validity: string; active: boolean }
  productDetail?: {
    name: string
    status: string
    category: string
    description: string
    price: string
    stock: string
    image: string
  }
  action?: {
    type: string
    payload: ActionPayload
  }
}

export type ActionPayload = {
  products?: Array<{ name: string; stock: number; category?: string; active?: boolean; price: number }>
  product?: {
    name: string
    price: number
    stock: number
    oldStock?: number
    newStock?: number
    newActive?: boolean
    category?: string
    description?: string
    imageUrl?: string
  }
  coupon?: {
    code: string
    desc: string
    validoHasta?: string
    validity?: string
  }
  order?: {
    id: string
    newStatus: string
    customerName: string
    total: number
    adminComment?: string | null
  }
  orders?: Array<{
    id: string
    customerName: string
    city: string
    paymentStatus: string
    total: number
    status: string
  }>
  metrics?: {
    totalSales: number
    totalOrders: number
    avgTicket: number
    topProducts?: Array<{ name: string; qty: number; sales: number }>
  }
  customerName?: string
  step?: string
  assignedTo?: string
  phoneNumber?: string
  chatHistory?: Array<{ sender: 'user' | 'bot'; text: string }>
}

export type ChatSessionItem = {
  id: string
  title: string
  messages: Message[]
  updatedAt: string
}

export interface AgentItem {
  id: string
  name: string
  role: string
  description: string
  colorClass: string
  avatarBg: string
  iconColor: string
}

export interface NovaChatStore {
  id: string
  name: string
  slug: string
  category: string | null
  whatsapp: string | null
  whatsappConnected: boolean
  mpConnected: boolean
  verificationLevel: number
}

export interface NovaChatClientProps {
  merchantName: string
  store: NovaChatStore
  activeProductsCount: number
  ordersCount: number
  activeChatsCount: number
  initialSessions?: ChatSessionItem[]
}
