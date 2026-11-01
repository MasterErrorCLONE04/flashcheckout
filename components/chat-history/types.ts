export type Message = {
  sender: 'user' | 'bot'
  text: string
  time: string
}

export type SessionNote = {
  id: string
  text: string
  createdAt: string
  author: string
}

export type ChatSession = {
  id: string
  phoneNumber: string
  customerName: string
  avatarUrl: string | null
  lastInteraction: string
  step: string
  messages: Message[]
}

export type ChatSessionExtended = ChatSession & {
  tags: string[]
  notes: SessionNote[]
  assignedTo: string
  isFavorite: boolean
  status: 'active' | 'closed'
}

export type CustomerDetails = {
  orders: Array<{ id: string; total: number; status: string; createdAt: string; paymentStatus?: string }>
  totalSpent: number
  ordersCount: number
  cartItems: Array<{ name: string; qty: number; price: number; imageUrl?: string }>
  firstInteractionDate: string
}

export type ChatSessionInit = ChatSession & Partial<Pick<ChatSessionExtended, 'tags' | 'notes' | 'assignedTo' | 'isFavorite' | 'status'>>

export type SessionUpdateData = Partial<Pick<ChatSessionExtended, 'tags' | 'notes' | 'assignedTo' | 'isFavorite' | 'status'>>

export type SessionAction = {
  type: string
  payload?: {
    products?: Array<{ name: string; stock: number; category?: string; active?: boolean; price: number }>
    product?: {
      name: string
      price: number
      stock: number
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
    order?: unknown
    metrics?: unknown
    customerName?: string
  }
}
