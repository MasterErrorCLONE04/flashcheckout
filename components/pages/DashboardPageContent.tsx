import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  Zap,
  AlertTriangle,
  CalendarDays,
  Globe,
  Clock,
  Truck,
  CheckCircle,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Bot,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import CopyButton from '@/components/CopyButton'
import DashboardClientContainer from '@/components/dashboard/DashboardClientContainer'
import { 
  StackedBarChart, 
  SalesChannelDonut, 
  MiniSparkline, 
  GeneralScoreCircle, 
  BotStatusCircle 
} from '@/components/DashboardCharts'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

import { getActiveStore } from '@/lib/store-context'

type DashboardAlert = {
  id: string
  type: 'payment_approval' | 'waiting_response' | 'ready_to_ship' | 'low_stock' | 'whatsapp_disconnected'
  title: string
  subtitle: string
  timeText: string
  href?: string
  actionText: string
}

type SessionMessage = {
  text?: string
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ days?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const searchParams = await props.searchParams
  const daysRange = searchParams.days === '30' ? 30 : 7

  const store = await getActiveStore(userId, {
    _count: {
      select: { products: true, orders: true },
    },
  })

  // If no store, show setup wizard
  if (!store) {
    return <StoreCreationWizard />
  }

  // Define dates for operations comparisons (today, yesterday, day before)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  todayStart.setHours(0, 0, 0, 0)
  
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

  const startDate = new Date()
  startDate.setDate(todayStart.getDate() - (daysRange - 1))
  startDate.setHours(0, 0, 0, 0)

  const paidOrderWhere = {
    storeId: store.id,
    status: { notIn: ['cancelled', 'rejected'] },
    OR: [
      { status: { in: ['paid', 'confirmed', 'in_transit', 'shipped_external', 'delivered'] } },
      { paymentStatus: { in: ['PAID', 'CONFIRMED'] } },
    ],
  }

  const [
    totalRevenueAgg,
    todayOrdersAgg,
    yesterdayOrdersAgg,
    whatsappSessionsCount,
    whatsappOrdersCount,
    whatsappTotalRevenue,
    chatsToday,
    activeChatsCount,
    lowStockCount,
    pendingProofsCount,
    waitingDriversCount,
    weeklyOrders,
    lowestStockProduct,
    recentOrders,
    recentSessions,
    manualPayments,
    readyToShip,
    activeSessions,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: paidOrderWhere,
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: { ...paidOrderWhere, createdAt: { gte: todayStart } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: {
        ...paidOrderWhere,
        createdAt: { gte: yesterdayStart, lt: todayStart },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.whatsAppSession.count({ where: { storeId: store.id } }),
    prisma.order.count({
      where: {
        ...paidOrderWhere,
        source: { in: ['WHATSAPP', 'WHATSAPP_WEBVIEW'] },
      },
    }),
    prisma.order.aggregate({
      where: {
        ...paidOrderWhere,
        source: { in: ['WHATSAPP', 'WHATSAPP_WEBVIEW'] },
      },
      _sum: { total: true },
    }),
    prisma.whatsAppSession.count({
      where: { storeId: store.id, lastInteraction: { gte: todayStart } },
    }),
    prisma.whatsAppSession.count({
      where: { storeId: store.id, lastInteraction: { gte: twoHoursAgo } },
    }),
    prisma.product.count({
      where: { storeId: store.id, stock: { lte: 5 }, active: true },
    }),
    prisma.order.count({
      where: { storeId: store.id, paymentStatus: 'UPLOADED' },
    }),
    prisma.order.count({
      where: {
        storeId: store.id,
        deliveryRequested: true,
        driverId: null,
        status: { notIn: ['delivered', 'cancelled'] },
      },
    }),
    prisma.order.findMany({
      where: { ...paidOrderWhere, createdAt: { gte: startDate } },
      select: { total: true, createdAt: true, source: true },
    }),
    prisma.product.findFirst({
      where: { storeId: store.id, active: true },
      orderBy: { stock: 'asc' },
    }),
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.whatsAppSession.findMany({
      where: { storeId: store.id },
      orderBy: { lastInteraction: 'desc' },
      take: 2,
    }),
    prisma.order.findMany({
      where: { storeId: store.id, paymentStatus: 'UPLOADED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { storeId: store.id, status: { in: ['confirmed', 'paid'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.whatsAppSession.findMany({
      where: { storeId: store.id },
      orderBy: { lastInteraction: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenueVal = totalRevenueAgg._sum.total ?? 0
  const totalOrdersCount = totalRevenueAgg._count.id ?? 0

  const revenueToday = todayOrdersAgg._sum.total ?? 0
  const ordersToday = todayOrdersAgg._count.id ?? 0

  const revenueYesterday = yesterdayOrdersAgg._sum.total ?? 0
  const ordersYesterday = yesterdayOrdersAgg._count.id ?? 0

  // Growth percentages
  const revenueGrowth = revenueYesterday > 0 
    ? ((revenueToday - revenueYesterday) / revenueYesterday * 100)
    : 0
  
  const ordersGrowth = ordersYesterday > 0
    ? ((ordersToday - ordersYesterday) / ordersYesterday * 100)
    : 0

  // 3. Conversion Global (using real WhatsAppSessions + orders)
  const totalSessionsVal = totalOrdersCount + whatsappSessionsCount
  const conversionRate = totalSessionsVal > 0 
    ? ((totalOrdersCount / totalSessionsVal) * 100)
    : 0

  // 4. Sales by WhatsApp source
  const whatsappPct = totalOrdersCount > 0
    ? Math.round((whatsappOrdersCount / totalOrdersCount) * 100)
    : 0

  const whatsappTotalVal = whatsappTotalRevenue._sum.total ?? 0
  const webTotalVal = Math.max(totalRevenueVal - whatsappTotalVal, 0)

  // 5. Ticket Promedio
  const avgTicketVal = totalOrdersCount > 0 ? Math.round(totalRevenueVal / totalOrdersCount) : 0
  const ticketToday = ordersToday > 0 ? Math.round(revenueToday / ordersToday) : 0
  const ticketYesterday = ordersYesterday > 0 ? Math.round(revenueYesterday / ordersYesterday) : 0
  const ticketGrowth = ticketYesterday > 0
    ? ((ticketToday - ticketYesterday) / ticketYesterday * 100)
    : 0

  // 6. WhatsApp Bot Details
  const chatsTodayCount = chatsToday

  // 7. Operational Alerts
  const totalAlertsCount = lowStockCount + pendingProofsCount + waitingDriversCount

  // 8. Stacked Chart Daily Processing

  const daysMap = new Map()
  const daysKeys = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  for (let i = daysRange - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(todayStart.getDate() - i)
    const label = daysRange === 7 
      ? daysKeys[d.getDay()] 
      : `${d.getDate()} ${d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}`
    daysMap.set(label, { date: label, webSales: 0, whatsappSales: 0, total: 0 })
  }

  weeklyOrders.forEach(order => {
    const dt = new Date(order.createdAt)
    const label = daysRange === 7 
      ? daysKeys[dt.getDay()] 
      : `${dt.getDate()} ${dt.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}`
    
    if (daysMap.has(label)) {
      const current = daysMap.get(label)
      if (order.source === 'WHATSAPP') {
        current.whatsappSales += order.total
      } else {
        current.webSales += order.total
      }
      current.total += order.total
      daysMap.set(label, current)
    }
  })

  const chartData = Array.from(daysMap.values())

  // Generate sparkline datasets dynamically from real daily data
  const sparklineRevenue = chartData.map(d => ({ value: d.total }))
  const sparklineOrders = chartData.map(d => ({ value: d.webSales + d.whatsappSales }))
  const sparklineConversion = chartData.map(d => ({ value: d.whatsappSales }))
  const sparklineTicket = chartData.map(d => ({ value: d.total }))

  // Today in Detail numbers
  const todayWebRevenue = chartData[chartData.length - 1]?.webSales ?? 0
  const todayWhatsappRevenue = chartData[chartData.length - 1]?.whatsappSales ?? 0
  const todayTotalRevenue = todayWebRevenue + todayWhatsappRevenue
  const todayWhatsappPct = todayTotalRevenue > 0 ? Math.round((todayWhatsappRevenue / todayTotalRevenue) * 100) : 0
  const todayWebPct = todayTotalRevenue > 0 ? 100 - todayWhatsappPct : 0

  // Helper function to calculate relative time
  function getRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Hace unos seg'
    if (diffMins < 60) return `Hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} hr`
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} d`
  }

  // 9. AI Insights Generation (telemetry-driven)
  const insights: string[] = [
    whatsappPct > 50 
      ? `El bot convirtió un ${whatsappPct}% de tus ventas totales esta semana.`
      : `El bot canalizó un ${whatsappPct}% de las ventas totales. Intenta optimizar tus flujos para subir.`,
    revenueGrowth >= 0
      ? `Tus ventas aumentaron un ${revenueGrowth.toFixed(1)}% respecto al día anterior.`
      : `El volumen de ventas bajó un ${Math.abs(revenueGrowth).toFixed(1)}% hoy. Se sugiere un mensaje de difusión.`,
    lowestStockProduct && lowestStockProduct.stock <= 5
      ? `El producto "${lowestStockProduct.name}" tiene stock crítico (${lowestStockProduct.stock} uds) y podría agotarse pronto.`
      : `Todos tus productos tienen inventario sano en este momento.`,
    `Se recomienda programar una difusión masiva entre 7:00 p.m. y 8:00 p.m. para maximizar el engagement de tus chats.`
  ]

  // 10. Unified Activity Timeline (Real orders, low stock, and chat activity combined)
  const timelineItems: {
    time: string
    title: string
    detail: string
    badge: string
    badgeColor: string
    type: string
  }[] = []

  // Add recent orders to timeline
  recentOrders.forEach((order) => {
    const minText = getRelativeTime(order.createdAt)
    const isPaid = order.paymentStatus === 'PAID' || order.status === 'paid'
    const isUploaded = order.paymentStatus === 'UPLOADED'
    
    let badgeLabel = 'Nuevo'
    let badgeColor = 'text-blue-600 bg-blue-50/50 border-blue-200/50'

    if (isPaid) {
      badgeLabel = 'Completado'
      badgeColor = 'text-emerald-600 bg-emerald-50/50 border-emerald-200/50'
    } else if (isUploaded) {
      badgeLabel = 'Pendiente'
      badgeColor = 'text-amber-600 bg-amber-50/50 border-amber-200/50'
    }

    timelineItems.push({
      time: minText,
      title: isPaid 
        ? `Pedido #${order.id.slice(-4).toUpperCase()} pagado por ${order.source === 'WHATSAPP' ? 'WhatsApp' : 'Web'}`
        : isUploaded
        ? `Comprobante #${order.id.slice(-4).toUpperCase()} pendiente de validación`
        : `Nuevo pedido #${order.id.slice(-4).toUpperCase()} registrado por ${order.source}`,
      detail: `Cliente: ${order.customerName} · $${order.total.toLocaleString('es-CO')}`,
      badge: badgeLabel,
      badgeColor,
      type: 'order'
    })
  })

  // Add low stock to timeline
  if (lowStockCount > 0 && lowestStockProduct) {
    timelineItems.push({
      time: 'Inventario',
      title: `Stock crítico: ${lowestStockProduct.name} llegó a ${lowestStockProduct.stock} unidades`,
      detail: `Categoría: ${lowestStockProduct.category || 'General'}`,
      badge: 'Stock bajo',
      badgeColor: 'text-rose-600 bg-rose-50/50 border-rose-200/50',
      type: 'stock'
    })
  }

  // Add recent chat sessions to timeline
  recentSessions.forEach((session) => {
    const minText = getRelativeTime(session.lastInteraction)
    timelineItems.push({
      time: minText,
      title: `Nuevo chat iniciado en WhatsApp`,
      detail: `Cliente: +${session.phoneNumber}`,
      badge: 'En curso',
      badgeColor: 'text-zinc-500 bg-zinc-50 border-zinc-200',
      type: 'chat'
    })
  })

  // 11. General Business Health Score
  const healthScore = Math.max(
    100 - (pendingProofsCount * 10) - (lowStockCount * 6) - (waitingDriversCount * 15),
    55
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const storeUrl = `${appUrl}/tienda/${store.slug}`

  const alerts: DashboardAlert[] = []

  // 1. WhatsApp Disconnected
  if (!store.whatsappConnected) {
    alerts.push({
      id: 'whatsapp-disconnected',
      type: 'whatsapp_disconnected',
      title: 'WhatsApp desconectado',
      subtitle: 'Reconecta tu número para reactivar el bot',
      timeText: 'Crítico',
      actionText: 'Reconectar'
    })
  }

  // 2. Pending payment approvals
  manualPayments.forEach((order) => {
    alerts.push({
      id: `payment-approval-${order.id}`,
      type: 'payment_approval',
      title: 'Pago pendiente de aprobar',
      subtitle: `${order.customerName} - Transferencia - $${order.total.toLocaleString('es-CO')}`,
      timeText: getRelativeTime(order.createdAt),
      href: '/verificaciones',
      actionText: 'Aprobar'
    })
  })

  // 3. Ready to ship orders
  readyToShip.forEach((order) => {
    alerts.push({
      id: `ready-to-ship-${order.id}`,
      type: 'ready_to_ship',
      title: 'Pedido listo para despachar',
      subtitle: `Pedido #${order.id.slice(-4).toUpperCase()} — ${order.customerName}`,
      timeText: getRelativeTime(order.createdAt),
      href: '/pedidos',
      actionText: 'Ver pedido'
    })
  })

  // 4. Low stock products alert
  if (lowStockCount > 0) {
    alerts.push({
      id: 'low-stock-alert',
      type: 'low_stock',
      title: `Stock bajo en ${lowStockCount} ${lowStockCount === 1 ? 'producto' : 'productos'}`,
      subtitle: 'Ver productos en stock crítico',
      timeText: 'Inventario',
      href: '/productos',
      actionText: 'Revisar'
    })
  }

  // 5. Active chats/waiting response (slice to avoid duplicate display in small alert box)
  activeSessions.slice(0, 2).forEach((session) => {
    const name = session.customerName || `Cliente +${session.phoneNumber.slice(-4)}`
    alerts.push({
      id: `waiting-response-${session.id}`,
      type: 'waiting_response',
      title: 'Conversación activa',
      subtitle: `${name} — WhatsApp`,
      timeText: getRelativeTime(session.lastInteraction),
      href: '/conversaciones',
      actionText: 'Abrir chat'
    })
  })

  // Build the chats array for Sidebar Section 2
  const chats = activeSessions.map((session) => {
    const name = session.customerName || `Cliente +${session.phoneNumber.slice(-4)}`
    const messages = Array.isArray(session.messages) ? (session.messages as SessionMessage[]) : []
    const lastMsg = messages[messages.length - 1]?.text || 'Conversación iniciada'
    return {
      id: session.id,
      customerName: name,
      phoneNumber: session.phoneNumber,
      lastMessage: lastMsg,
      lastInteraction: getRelativeTime(session.lastInteraction),
      step: session.step
    }
  })
  
  const initialActivities = recentOrders.map((order) => {
    const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'CONFIRMED' || order.status === 'paid' || order.status === 'confirmed'
    return {
      id: order.id,
      type: isPaid ? 'payment' : 'order',
      title: isPaid ? 'Pedido confirmado' : order.paymentStatus === 'UPLOADED' ? 'Comprobante por validar' : 'Nuevo pedido',
      customerName: order.customerName || 'Cliente',
      source: order.source === 'WHATSAPP' || order.source === 'WHATSAPP_WEBVIEW' ? 'WhatsApp' : 'Tienda Web',
      statusLabel: isPaid ? 'Pagado' : order.paymentStatus === 'UPLOADED' ? 'En validación' : 'Pendiente',
      code: order.id.slice(-6).toUpperCase(),
      amount: order.total,
      timeText: getRelativeTime(order.createdAt),
      href: order.paymentStatus === 'UPLOADED' ? '/verificaciones' : '/pedidos'
    }
  })

  return (
    <DashboardClientContainer
      storeUrl={storeUrl}
      storeName={store.name}
      storeSlug={store.slug}
      insights={insights}
      initialWhatsappConnected={store.whatsappConnected}
      aiActive={store.aiActive}
      productsCount={(store as any)._count?.products ?? 0}
      isSubscribed={!!store.stripePriceId && !!store.stripeCurrentPeriodEnd && new Date(store.stripeCurrentPeriodEnd) > new Date()}
      stats={{
        revenueToday,
        revenueGrowth,
        ordersToday,
        ordersGrowth,
        avgTicketToday: avgTicketVal,
        avgTicketGrowth: ticketGrowth,
        conversionRate,
        whatsappPct,
        whatsappTotalVal,
        webTotalVal,
        chatsTodayCount,
        activeChatsCount,
        pendingProofsCount,
        lowStockCount,
        waitingDriversCount,
        totalRevenueVal,
        totalOrdersCount,
        healthScore
      }}
      sparklineRevenue={sparklineRevenue}
      sparklineOrders={sparklineOrders}
      sparklineConversion={sparklineConversion}
      sparklineTicket={sparklineTicket}
      chartData={chartData}
      initialAlerts={alerts}
      initialChats={chats}
      initialActivities={initialActivities}
    />
  )
}
