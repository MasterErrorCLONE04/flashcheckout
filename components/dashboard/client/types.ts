export type OrderItem = {
  total: number
  createdAt: Date | string
  source: string
}

export type DashboardStats = {
  revenueToday: number
  revenueGrowth: number
  ordersToday: number
  ordersGrowth: number
  avgTicketToday: number
  avgTicketGrowth: number
  conversionRate: number
  whatsappPct: number
  whatsappTotalVal: number
  webTotalVal: number
  chatsTodayCount: number
  activeChatsCount: number
  pendingProofsCount: number
  lowStockCount: number
  waitingDriversCount: number
  totalRevenueVal: number
  totalOrdersCount: number
  healthScore: number
}

export type SmartInboxAlert = {
  id: string
  type: 'payment_approval' | 'waiting_response' | 'ready_to_ship' | 'low_stock' | 'whatsapp_disconnected'
  title: string
  subtitle: string
  timeText: string
  href?: string
  actionText?: string
}

export type ActiveChat = {
  id: string
  customerName: string
  phoneNumber: string
  lastMessage: string
  lastInteraction: string
  step: string
}

export type DashboardActivity = {
  id: string
  type?: string
  title: string
  code?: string
  amount?: number
  timeText: string
  href: string
}

export type ClientContainerProps = {
  storeUrl: string
  storeName: string
  storeSlug: string
  insights: string[]
  initialWhatsappConnected?: boolean
  aiActive?: boolean
  stats: DashboardStats
  sparklineRevenue: any[]
  sparklineOrders: any[]
  sparklineConversion: any[]
  sparklineTicket: any[]
  chartData: any[]
  initialAlerts?: SmartInboxAlert[]
  initialChats?: ActiveChat[]
  initialActivities?: any[]
  productsCount?: number
  isSubscribed?: boolean
}
