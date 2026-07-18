'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Download, 
  Plus, 
  Send, 
  MessageSquare, 
  QrCode, 
  ShoppingBag, 
  Package, 
  Warehouse, 
  BarChart3, 
  Settings, 
  X,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  Copy,
  Check,
  Loader2,
  Phone,
  DollarSign,
  ShoppingCart,
  Users,
  Bell,
  Truck,
  AlertTriangle,
  AlertCircle,
  Inbox,
  Globe,
  UserPlus
} from 'lucide-react'
import QrGenerator from '@/components/QrGenerator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  WeeklySalesAreaChart, 
  SalesChannelDonut, 
  MiniSparkline,
  BotStatusCircle
} from '@/components/DashboardCharts'
import Modal from '@/components/ui/Modal'



type OrderItem = {
  total: number
  createdAt: Date | string
  source: string
}

type DashboardStats = {
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

type ClientContainerProps = {
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

export default function DashboardClientContainer({
  storeUrl,
  storeName,
  storeSlug,
  insights,
  initialWhatsappConnected = false,
  aiActive = true,
  stats,
  sparklineRevenue,
  sparklineOrders,
  sparklineConversion,
  sparklineTicket,
  chartData,
  initialAlerts = [],
  initialChats = [],
  initialActivities = [],
  productsCount = 0,
  isSubscribed = false
}: ClientContainerProps) {
  // Client States
  const [copied, setCopied] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)

  const handleStripeRedirect = async () => {
    try {
      setLoadingStripe(true)
      const response = await fetch('/api/stripe')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Fallo al conectar con la pasarela de pagos.')
      }

      toast.info("Redirigiendo...", {
        description: "Serás redirigido de forma segura al portal de facturación de Stripe."
      })
      window.location.href = data.url
    } catch (error: any) {
      toast.error("Error financiero", {
        description: error.message || 'No pudimos conectar con Stripe.'
      })
    } finally {
      setLoadingStripe(false)
    }
  }
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showSuggestionBanner, setShowSuggestionBanner] = useState(true)
  const [showAllAlertsModal, setShowAllAlertsModal] = useState(false)
  
  // Smart Inbox Alerts, Chats & Activities
  const [alerts, setAlerts] = useState<SmartInboxAlert[]>(initialAlerts)
  const [chats, setChats] = useState<ActiveChat[]>(initialChats)
  const [activities, setActivities] = useState<any[]>(initialActivities)
  
  // WhatsApp Instance States
  const [whatsappConnected, setWhatsappConnected] = useState(initialWhatsappConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)

  // Polling WhatsApp Instance status on connection modal open
  useEffect(() => {
    let intervalId: any
    if (pollingStatus && !whatsappConnected) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/whatsapp/instance?storeSlug=${storeSlug}`)
          const data = await res.json()
          if (data.connected) {
            setWhatsappConnected(true)
            setPollingStatus(false)
            setShowWhatsAppModal(false)
            setQrCodeBase64(null)
            toast.success('¡WhatsApp vinculado exitosamente!')
          } else if (data.qr) {
            setQrCodeBase64(data.qr)
          }
        } catch (err) {
          console.error('Error checking WhatsApp status:', err)
        }
      }, 3000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [pollingStatus, whatsappConnected, storeSlug])

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showQrModal || showWhatsAppModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showQrModal, showWhatsAppModal])

  // Copy catalog URL link to clipboard
  function handleCopyLink() {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    toast.success('¡Enlace copiado al portapapeles!')
    setTimeout(() => setCopied(false), 2000)
  }

  const renderAlertItem = (alert: SmartInboxAlert) => (
    <div key={alert.id} className={cn(
      "flex flex-col gap-2 p-3 rounded-lg border bg-zinc-50/20 text-left",
      alert.type === 'whatsapp_disconnected' ? "border-rose-200 bg-rose-50/15" : "border-zinc-200"
    )}>
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border bg-zinc-50 border-zinc-200 text-zinc-500">
          {alert.type === 'payment_approval' && <AlertTriangle className="w-4 h-4" />}
          {alert.type === 'waiting_response' && <MessageSquare className="w-4 h-4" />}
          {alert.type === 'ready_to_ship' && <Truck className="w-4 h-4" />}
          {alert.type === 'low_stock' && <Package className="w-4 h-4" />}
          {alert.type === 'whatsapp_disconnected' && <img src="/whatsapp.svg" className="w-4 h-4" alt="WhatsApp" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-zinc-900 leading-snug">{alert.title}</p>
          <p className="text-[10px] font-medium text-zinc-500 truncate mt-0.5 leading-none">
            {alert.subtitle} {alert.type === 'whatsapp_disconnected' && <span className="text-rose-500 font-bold uppercase text-[9px] ml-1">Crítico</span>}
          </p>
          <span className={cn(
            "text-[9px] font-semibold block mt-1",
            alert.type === 'whatsapp_disconnected' ? "text-rose-500" : "text-zinc-400"
          )}>{alert.timeText}</span>
        </div>
      </div>
      {alert.type === 'whatsapp_disconnected' ? (
        <button
          onClick={() => {
            setShowWhatsAppModal(true)
            handleConnectWhatsApp()
          }}
          className="w-full h-7 border border-rose-250 hover:bg-rose-50 rounded-md text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-center bg-white shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          {alert.actionText || 'Reconectar'}
        </button>
      ) : (
        <Link 
          href={alert.href || '#'} 
          className="w-full h-7 border border-zinc-250 hover:bg-zinc-50 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-center bg-white shadow-sm active:scale-[0.98] transition-all"
        >
          {alert.actionText || 'Ver'}
        </Link>
      )}
    </div>
  )

  // Connect WhatsApp and fetch QR code
  async function handleConnectWhatsApp() {
    setLoadingQr(true)
    setQrCodeBase64(null)
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeSlug })
      })
      const data = await res.json()
      if (data.qr) {
        setQrCodeBase64(data.qr)
        setPollingStatus(true)
      } else if (data.connected) {
        setWhatsappConnected(true)
        toast.success('WhatsApp ya se encuentra conectado')
      }
    } catch (err) {
      toast.error('Error al generar código QR de WhatsApp')
      console.error(err)
    } finally {
      setLoadingQr(false)
    }
  }

  // Download Commercial CSV Report
  function handleDownloadReport() {
    const headers = ['Fecha', 'Ventas Web', 'Ventas WhatsApp', 'Total Diario']
    const rows = chartData.map(d => [
      d.date,
      d.webSales,
      d.whatsappSales,
      d.total
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `Reporte_Ventas_${storeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const activeAlerts = alerts.filter(a => {
    if (a.id === 'whatsapp-disconnected' || a.type === 'whatsapp_disconnected') {
      return !whatsappConnected
    }
    return true
  })

  return (
    <div className="space-y-4.5">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 ">Panel de Control</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5 ">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Monitoreo Operativo — Gestionando <span className="text-zinc-900 font-bold">{storeName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center justify-center gap-2 h-9 px-3.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>Acciones rápidas</span>
            </button>
            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <Link href="/productos" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <Plus className="w-4 h-4 text-zinc-400" />
                  <span>Agregar producto</span>
                </Link>
                <Link href="/pedidos" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  <span>Ver pedidos</span>
                </Link>
                <Link href="/verificaciones" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Validar pagos</span>
                </Link>
                <Link href="/clientes" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>Clientes</span>
                </Link>
                <Link href="/historial-chats" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <span>Abrir chats</span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center justify-center gap-2 h-9 px-3.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Descargar Reporte</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout Flexbox */}
      <div className="flex flex-col xl:flex-row gap-5 items-start w-full">
        
        {/* CENTER/LEFT COLUMN: Primary Dashboard Contents */}
        <div className="flex-grow flex-shrink flex-1 min-w-0 space-y-5 w-full">
          
          {/* Bento Grid Row 1: KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Ventas de Hoy */}
            <Link href="/pedidos" className="contents">
              <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Ventas de hoy</span>
                    <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                      ${stats.revenueToday.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span>▲ {Math.abs(stats.revenueGrowth || 0).toFixed(1)}%</span>
                    <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Pedidos */}
            <Link href="/pedidos" className="contents">
              <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Pedidos</span>
                    <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                      {stats.ordersToday}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
                    <ShoppingCart className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span>▲ {Math.abs(stats.ordersGrowth || 0).toFixed(1)}%</span>
                    <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Ticket Promedio */}
            <Link href="/analitica" className="contents">
              <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Ticket promedio</span>
                    <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                      ${stats.avgTicketToday.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span>▲ {Math.abs(stats.avgTicketGrowth || 0).toFixed(1)}%</span>
                    <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 4: Clientes Nuevos */}
            <Link href="/clientes" className="contents">
              <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Clientes nuevos</span>
                    <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                      {stats.activeChatsCount}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span>▲ 0.0%</span>
                    <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Row 2: Charts Side-by-side (Moved from Row 4 in mockup order) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Chart 1: Ventas últimos 7 días */}
            <div className="md:col-span-7 p-5 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between h-[340px]">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Ventas últimos 7 días</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span>${stats.totalRevenueVal.toLocaleString('es-CO')}</span>
                  <span className="text-[10px]">▲ {stats.revenueGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex-1 w-full h-full mt-4 min-h-[220px]">
                <WeeklySalesAreaChart data={chartData.map(d => ({ date: d.date, value: d.total }))} />
              </div>
            </div>

            {/* Chart 2: Ventas por canal (Donut) */}
            <div className="md:col-span-5 p-5 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between h-[340px]">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Ventas por canal</h4>
              </div>

              <div className="h-40 w-full relative flex items-center justify-center">
                <SalesChannelDonut whatsappTotal={stats.whatsappTotalVal} webTotal={stats.webTotalVal} />
              </div>

              <div className="space-y-1.5 text-[11px] font-semibold text-zinc-500 pb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>WhatsApp</span>
                  </div>
                  <span className="text-zinc-900 font-bold">
                    {stats.totalRevenueVal > 0 ? Math.round((stats.whatsappTotalVal / stats.totalRevenueVal) * 100) : 0}% (${stats.whatsappTotalVal.toLocaleString('es-CO')})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-900" />
                    <span>Tienda Web y Enlaces</span>
                  </div>
                  <span className="text-zinc-900 font-bold">
                    {stats.totalRevenueVal > 0 ? Math.round((stats.webTotalVal / stats.totalRevenueVal) * 100) : 0}% (${stats.webTotalVal.toLocaleString('es-CO')})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Bento cards (Tu tienda online + Métricas rápidas side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Tu tienda online */}
            <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col sm:flex-row items-stretch gap-6 justify-between">
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-zinc-800 font-semibold text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <span>Tu tienda online</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">Este es el enlace directo a tu catálogo inteligente para recibir pedidos autónomos.</p>
                  <div className="text-emerald-600 font-medium text-xs pt-2 truncate select-all">{storeUrl}</div>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: storeName,
                          text: `Visita mi tienda en Flashcheckouts`,
                          url: storeUrl
                        }).catch(console.error)
                      } else {
                        handleCopyLink()
                      }
                    }}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>

                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver tienda</span>
                  </a>
                </div>
              </div>

              <div className="w-full sm:w-32 flex-shrink-0 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100 p-3 rounded-lg gap-2">
                <div 
                  className="group/qr w-24 h-24 bg-white border border-zinc-200 rounded-lg flex items-center justify-center p-1 cursor-pointer relative overflow-hidden active:scale-[0.97] transition-all duration-300"
                  onClick={() => setShowQrModal(true)}
                  title="Ampliar y descargar código QR"
                >
                  <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={80} />
                  
                  {/* Modern Hover Overlay */}
                  <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 rounded-lg">
                    <Maximize2 className="w-4 h-4 text-white animate-bounce" />
                    <span className="text-[8px] font-extrabold text-white uppercase tracking-wider">Ampliar</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQrModal(true)}
                  className="text-[9px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ver Código QR</span>
                </button>
              </div>
            </div>

            {/* Right Card: Métricas rápidas */}
            <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between min-h-[180px]">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight mb-4">Métricas rápidas</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      <span>Productos</span>
                    </div>
                    <span className="text-zinc-900 font-bold">
                      {productsCount} / {isSubscribed ? 'Sin límite' : '10'}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                         <span>Límite del plan {isSubscribed ? 'Premium' : 'gratuito'}</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          isSubscribed ? "bg-zinc-850 w-full" : 
                          productsCount >= 10 ? "bg-rose-500 w-full" :
                          productsCount >= 8 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={isSubscribed ? {} : { width: `${Math.min((productsCount / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {isSubscribed ? (
                <button
                  onClick={handleStripeRedirect}
                  disabled={loadingStripe}
                  className="w-full h-9 mt-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-650 flex items-center justify-center gap-1.5 bg-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingStripe ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>Gestionar Suscripción</span>
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="w-full h-9 mt-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-650 flex items-center justify-center gap-1.5 bg-white shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Actualizar Plan</span>
                </Link>
              )}
            </div>
          </div>

          {/* Row 4: Sugerencia para ti banner */}
          {showSuggestionBanner && (
            whatsappConnected ? (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative animate-in fade-in duration-200">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-zinc-800 block">Sugerencia para ti</span>
                    <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Comparte el enlace de tu tienda en Instagram y redes sociales para aumentar tus pedidos autónomos.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <Link 
                    href="/configuracion"
                    className="h-8 px-3.5 bg-zinc-900 hover:bg-zinc-955 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configuración</span>
                  </Link>
                  <button 
                    onClick={() => setShowSuggestionBanner(false)}
                    className="w-8 h-8 rounded-lg hover:bg-zinc-200 flex items-center justify-center text-zinc-455 shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative animate-in fade-in duration-200">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-emerald-800 block">Sugerencia para ti</span>
                    <p className="text-[11px] font-medium text-emerald-750/90 mt-0.5">Conecta tu WhatsApp Business para no perder mensajes de clientes potenciales.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <button 
                    onClick={() => {
                      setShowWhatsAppModal(true)
                      handleConnectWhatsApp()
                    }}
                    className="h-8 px-3.5 bg-[#10B981] hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Conectar WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => setShowSuggestionBanner(false)}
                    className="w-8 h-8 rounded-lg hover:bg-emerald-100/50 flex items-center justify-center text-emerald-650 shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}

        </div>

        {/* RIGHT COLUMN: Bandeja Inteligente & Chats Activos Sidebar */}
        <div className="w-full xl:w-80 shrink-0 space-y-5">
          
          {/* Section 1: Bandeja Inteligente */}
          <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-400" />
                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Bandeja Inteligente</h4>
              </div>
              {activeAlerts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-sm">
                  {activeAlerts.length}
                </span>
              )}
            </div>

            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 py-8 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/20 my-1">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                  <Check className="w-5 h-5 animate-bounce" />
                </div>
                <p className="text-xs font-bold text-zinc-900">¡Bandeja al día!</p>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">No tienes tareas pendientes que requieran tu atención inmediata.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="space-y-3.5">
                  {activeAlerts.slice(0, 3).map((alert) => renderAlertItem(alert))}
                </div>
                {activeAlerts.length > 3 && (
                  <button
                    onClick={() => setShowAllAlertsModal(true)}
                    className="w-full mt-2 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all text-center select-none cursor-pointer"
                  >
                    Mostrar más
                  </button>
                )}
              </div>
            )}
          </div>



          {/* Section 3: Actividad Reciente */}
          <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-zinc-400" />
                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Actividad reciente</h4>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 py-8 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/20 my-2">
                <div className="w-9 h-9 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center mb-2.5">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-zinc-955">Sin actividad reciente</p>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">Las actividades y pedidos de tu tienda aparecerán listados aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Link 
                    key={activity.id} 
                    href={activity.href} 
                    className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200/50"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                        {activity.type === 'payment' ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 truncate">{activity.title}</p>
                        <p className="text-[9px] font-semibold text-zinc-400 mt-0.5">#{activity.code}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {activity.amount !== undefined && (
                        <p className="text-xs font-bold text-emerald-600">${activity.amount.toLocaleString('es-CO')}</p>
                      )}
                      <p className="text-[8px] font-semibold text-zinc-400 mt-0.5">{activity.timeText}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/pedidos" className="w-full h-9 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-650 flex items-center justify-center bg-white shadow-sm active:scale-95 transition-all mt-4">
              <span>Ver toda la actividad</span>
            </Link>
          </div>

        </div>

      </div>


      {/* Store QR Code Modal (Visits & Counter) */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-lg max-w-sm w-full p-6 border border-zinc-100 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-955 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 mt-2">
              <h3 className="font-bold text-base text-zinc-900">Código QR de la Tienda</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px] leading-relaxed">
                Escanea o descarga este código QR para colocar en tu tienda física y dirigir a los compradores directos.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-lg border border-zinc-200 mb-6 flex items-center justify-center">
              <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={160} />
            </div>

            <div className="w-full flex flex-col gap-2">
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 h-11 w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg transition-colors"
              >
                <span>Visitar Tienda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              
              <button
                onClick={() => {
                  const canvas = document.querySelector('canvas')
                  if (canvas) {
                    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
                    const downloadLink = document.createElement('a')
                    downloadLink.href = pngUrl
                    downloadLink.download = `QR_${storeName.replace(/\s+/g, '_')}.png`
                    document.body.appendChild(downloadLink)
                    downloadLink.click()
                    document.body.removeChild(downloadLink)
                  }
                }}
                className="flex items-center justify-center gap-1.5 h-11 w-full bg-zinc-950 text-white hover:bg-zinc-900 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Descargar Imagen QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp QR Modal Popup (Vincular WhatsApp) */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl border border-zinc-200 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowWhatsAppModal(false)
                setPollingStatus(false)
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon */}
            <div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 mb-3 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-zinc-900 tracking-tight">Vincular Celular</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                Escanea el código QR desde tu WhatsApp para conectar el bot de IA.
              </p>
            </div>

            <div className="w-full flex items-center justify-center min-h-[190px] border border-zinc-200/80 bg-zinc-50/50 rounded-lg mb-4 p-4 relative overflow-hidden">
              {loadingQr ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-zinc-450 animate-spin" />
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider animate-pulse">Generando código QR...</span>
                </div>
              ) : qrCodeBase64 ? (
                <div className="flex flex-col items-center gap-3.5">
                  <div className="p-3 bg-white border border-zinc-200 rounded-lg relative">
                    {/* Decorative QR Corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-zinc-400 rounded-tl-sm pointer-events-none" />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-zinc-400 rounded-tr-sm pointer-events-none" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-zinc-400 rounded-bl-sm pointer-events-none" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-zinc-400 rounded-br-sm pointer-events-none" />
                    
                    <img src={qrCodeBase64} alt="Scan QR Code" className="w-36 h-36 object-contain" />
                  </div>
                  <span className="text-[9px] font-extrabold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Esperando escaneo...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3.5 text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-455">
                    <Phone className="w-5 h-5" />
                  </div>
                  <button
                    onClick={handleConnectWhatsApp}
                    className="h-9 px-4 bg-zinc-900 text-white hover:bg-zinc-950 border border-transparent rounded-lg text-[10px] font-bold tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Generar código QR
                  </button>
                </div>
              )}
            </div>

            <div className="w-full bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-lg text-left space-y-3">
              <h5 className="text-[10px] font-bold text-zinc-800 tracking-wider">Pasos en tu teléfono:</h5>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-[10px] font-semibold text-zinc-500 leading-normal">
                  <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 flex items-center justify-center shrink-0">1</div>
                  <span>Ve a <strong className="text-zinc-900 font-bold">Dispositivos vinculados</strong> en WhatsApp.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[10px] font-semibold text-zinc-500 leading-normal">
                  <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 flex items-center justify-center shrink-0">2</div>
                  <span>Presiona <strong className="text-zinc-900 font-bold">Vincular dispositivo</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[10px] font-semibold text-zinc-500 leading-normal">
                  <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 flex items-center justify-center shrink-0">3</div>
                  <span>Escanea el código QR que se muestra arriba.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Modal for Bandeja Inteligente */}
      <Modal
        isOpen={showAllAlertsModal}
        onClose={() => setShowAllAlertsModal(false)}
        title={`Bandeja Inteligente (${activeAlerts.length})`}
      >
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {activeAlerts.map((alert) => renderAlertItem(alert))}
        </div>
      </Modal>
    </div>
  )
}

// 7. ACCIONES RÁPIDAS CARD COMPONENT
export function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  href?: string
  onClick?: () => void
}) {
  const cardContent = (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50/50 hover:border-zinc-300 transition-all duration-200 h-full w-full">
      <div className="w-8.5 h-8.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-zinc-900 leading-tight">{title}</p>
        <p className="text-[9px] font-semibold text-zinc-400 truncate mt-0.5 ">{subtitle}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="contents">
        {cardContent}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="contents text-left">
      {cardContent}
    </button>
  )
}
