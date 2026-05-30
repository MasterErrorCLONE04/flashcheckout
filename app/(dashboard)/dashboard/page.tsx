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
  Bell,
  ArrowUpRight,
  Clock,
  Truck,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import CopyButton from '@/components/CopyButton'
import SalesChart from '@/components/SalesChart'
import QrGenerator from '@/components/QrGenerator'
import { cn } from '@/lib/utils'

export default async function DashboardPage(props: {
  searchParams: Promise<{ days?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const searchParams = await props.searchParams
  const daysRange = searchParams.days === '30' ? 30 : 7

  const store = await prisma.store.findFirst({
    where: { userId },
    include: {
      _count: {
        select: { products: true, orders: true },
      },
    },
  })

  // If no store, show setup
  if (!store) {
    return <StoreCreationWizard />
  }

  const recentOrders = await prisma.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  const totalRevenue = await prisma.order.aggregate({
    where: { storeId: store.id },
    _sum: { total: true },
  })

  // Fechas Claves
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const startDate = new Date()
  startDate.setDate(todayStart.getDate() - (daysRange - 1))
  startDate.setHours(0, 0, 0, 0)

  const todayOrders = await prisma.order.count({
    where: { storeId: store.id, createdAt: { gte: todayStart } },
  })

  const lowStockCount = await prisma.product.count({
    where: { storeId: store.id, stock: { lte: 5 }, active: true },
  })

  const weeklyOrders = await prisma.order.findMany({
    where: { storeId: store.id, createdAt: { gte: startDate } },
    select: { total: true, createdAt: true },
  })

  const weeklyOrdersCount = weeklyOrders.length
  
  const whatsappOrdersCount = await (prisma.order as any).count({
    where: { storeId: store.id, source: 'WHATSAPP' }
  })
  
  const totalWhatsAppRevenue = await (prisma.order as any).aggregate({
    where: { storeId: store.id, source: 'WHATSAPP', paymentStatus: 'PAID' },
    _sum: { total: true }
  })
  
  // Agrupar ventas diarias en Formato Recharts
  const daysMap = new Map()
  const daysKeys = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  for (let i = daysRange - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(todayStart.getDate() - i)
    const label = daysRange === 7 
      ? daysKeys[d.getDay()] 
      : `${d.getDate()} ${d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}`
    daysMap.set(label, 0)
  }

  weeklyOrders.forEach(order => {
    const dt = new Date(order.createdAt)
    const label = daysRange === 7 
      ? daysKeys[dt.getDay()] 
      : `${dt.getDate()} ${dt.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}`
    if (daysMap.has(label)) {
      daysMap.set(label, daysMap.get(label) + order.total)
    }
  })

  const chartData = Array.from(daysMap, ([date, total]) => ({ date, total }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const storeUrl = `${appUrl}/tienda/${store.slug}`

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* 1. Header Premium */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-955 font-display">Panel de control</h1>
            <div className="text-[15px] font-medium text-zinc-500 mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Monitoreo Operativo — Gestionando <span className="text-zinc-950 font-bold uppercase">{store.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-50 border border-gray-200/60 p-1.5 rounded-lg">
            <div className="px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider">Servicio Activo</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>

      {/* 2. Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Cell 1: Main Store Link (Large) */}
        <div className="md:col-span-8 premium-card p-8 flex flex-col justify-between group relative overflow-hidden bg-white border-gray-200 rounded-lg shadow-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-gray-200/60 flex items-center justify-center text-zinc-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Enlace de despacho</p>
                <p className="text-base font-semibold text-zinc-950 tracking-tight">Catálogo Digital Operativo</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex-1 bg-zinc-50/50 border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-3 group-hover:border-zinc-300 transition-all">
                  <span className="text-zinc-400 font-mono text-sm opacity-60 hidden sm:inline select-none">https://</span>
                  <code className="text-sm font-mono font-bold text-zinc-950 flex-1 truncate">
                    {store.slug}.flashcheckout.co
                  </code>
                  <CopyButton text={storeUrl} />
                </div>
                <Link 
                  href={storeUrl} 
                  target="_blank"
                  className="btn-premium flex items-center justify-center gap-2.5 px-6 h-[54px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  Abrir tienda <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 flex items-center gap-4 text-xs font-semibold text-zinc-400 border-t border-zinc-100">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100" />
              ))}
            </div>
            <span className="text-[11px] font-medium text-zinc-400">Canal de ventas en línea configurado y listo para despachar</span>
          </div>
        </div>

        {/* Cell 2: QR System (Medium) */}
        <div className="md:col-span-4 premium-card p-8 flex flex-col items-center justify-center text-center group bg-white border-gray-200 rounded-lg shadow-none">
          <div className="p-4.5 bg-white rounded-lg mb-5 group-hover:scale-105 transition-all duration-500 border border-gray-200 shadow-sm">
            <QrGenerator url={storeUrl} storeName={store.name} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5">Código QR</p>
          <p className="text-xs font-bold text-zinc-950 tracking-tight">Material de empaque o mostradores</p>
        </div>

        {/* Cell 3: Revenue (Medium/Small) */}
        <div className="md:col-span-4 premium-card p-8 group bg-white border-gray-200 rounded-lg shadow-none">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Ingresos Consolidados</p>
          <div className="flex items-baseline justify-between gap-3 w-full">
            <span className="text-2xl md:text-3xl font-bold text-zinc-955 tabular-nums tracking-tight">
              ${(totalRevenue._sum.total ?? 0).toLocaleString('es-CO')}
            </span>
            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50/50 border border-emerald-200/40 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-sm">+12.5%</span>
          </div>
        </div>

        {/* Cell 4: Weekly Performance (Medium/Small) */}
        <div className="md:col-span-4 premium-card p-8 group bg-white border-gray-200 rounded-lg shadow-none">
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-gray-200/60 text-zinc-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm">
            <Zap className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Ventas WhatsApp (Bot)</p>
          <div className="flex items-baseline justify-between gap-3 w-full">
            <span className="text-2xl md:text-3xl font-bold text-zinc-950 tabular-nums tracking-tight">
              {whatsappOrdersCount}
            </span>
            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50/50 border border-emerald-200/30 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-sm">
              ${(totalWhatsAppRevenue._sum?.total ?? 0).toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Cell 5: Stock Alerts (Medium/Small) */}
        <div className="md:col-span-4 premium-card p-8 group overflow-hidden bg-white border-gray-200 rounded-lg shadow-none relative">
          <div className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-105 shadow-sm border",
            lowStockCount > 0 
              ? "bg-rose-50 text-rose-600 border-rose-200/40" 
              : "bg-zinc-50 border-gray-200/60 text-zinc-400"
          )}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Stock Crítico</p>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-2xl md:text-3xl font-bold tabular-nums tracking-tight",
              lowStockCount > 0 ? "text-rose-600" : "text-zinc-950"
            )}>
              {lowStockCount}
            </span>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider leading-none">Unidades en alerta</span>
          </div>
          <Link 
            href="/productos" 
            className="w-8 h-8 rounded-lg border border-gray-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all absolute bottom-8 right-8 active:scale-90 group/arrow"
          >
            <ArrowRight className="w-4 h-4 group-hover/arrow:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Cell 6: Analytics Chart (Large Wide) */}
        <div className="md:col-span-8 premium-card p-8 bg-white border-gray-200 rounded-lg relative overflow-hidden shadow-none group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] blur-[120px] -mr-40 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none">Rendimiento Operativo</p>
              </div>
              <h3 className="text-xl font-semibold text-zinc-950 tracking-tight font-display">Actividad Comercial</h3>
              <p className="text-xs font-medium text-zinc-400 mt-1">Métrica: Ventas brutas consolidadas ({daysRange} días)</p>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-50 border border-gray-200 p-1.5 rounded-lg shrink-0">
               <Link 
                 href="/dashboard?days=7"
                 className={cn(
                   "px-4 py-2 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all",
                   daysRange === 7 
                     ? "bg-zinc-950 text-white shadow-sm" 
                     : "text-zinc-500 hover:text-zinc-950"
                 )}
               >
                 7 días
               </Link>
               <Link 
                 href="/dashboard?days=30"
                 className={cn(
                   "px-4 py-2 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all",
                   daysRange === 30 
                     ? "bg-zinc-950 text-white shadow-sm" 
                     : "text-zinc-500 hover:text-zinc-950"
                 )}
               >
                 30 días
               </Link>
            </div>
          </div>

          <div className="h-[280px] w-full relative z-10">
            <SalesChart data={chartData} />
          </div>
        </div>

        {/* Cell 7: Recent Orders (Medium Sidebar Style) */}
        <div className="md:col-span-4 premium-card p-8 overflow-hidden bg-white border-gray-200 rounded-lg shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Actividad Reciente</p>
                <h3 className="text-base font-bold text-zinc-955 tracking-tight font-display">Últimos Pedidos</h3>
              </div>
              <Link 
                href="/pedidos" 
                className="w-8 h-8 rounded-lg border border-gray-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-955 hover:bg-zinc-100 transition-all active:scale-90"
              >
                <ArrowUpRight className="w-4.5 h-4.5" />
              </Link>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="group flex items-center justify-between p-4 rounded-lg bg-zinc-50/20 border border-gray-200/80 hover:border-gray-300 hover:bg-zinc-50/55 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all duration-300"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-[13px] font-bold text-zinc-950 truncate group-hover:text-primary transition-colors">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400 flex items-center gap-1.5" suppressHydrationWarning>
                      {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                      {(order as any).source === 'WHATSAPP' && (
                        <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50/50 border border-emerald-200/30 px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none">
                          WhatsApp
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 shrink-0">
                    <p className="text-xs font-extrabold text-zinc-955 tabular-nums tracking-tight">
                      ${order.total.toLocaleString('es-CO')}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
              
              {recentOrders.length === 0 && (
                <div className="text-center py-16 bg-zinc-50/20 rounded-lg border border-dashed border-gray-200">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-zinc-200" />
                  <p className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Sin órdenes registradas</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { color: string, label: string }> = {
    pending: { color: 'text-amber-600 bg-amber-50/50 border-amber-200/50', label: 'Nuevo' },
    confirmed: { color: 'text-blue-600 bg-blue-50/50 border-blue-200/50', label: 'Confirmado' },
    shipped: { color: 'text-indigo-600 bg-indigo-50/50 border-indigo-200/50', label: 'En camino' },
    delivered: { color: 'text-emerald-600 bg-emerald-50/50 border-emerald-200/50', label: 'Entregado' },
    cancelled: { color: 'text-rose-600 bg-rose-50/50 border-rose-200/50', label: 'Cancelado' },
  }

  const style = styles[status] ?? styles.pending

  return (
    <span
      className={cn(
        "text-[9px] font-extrabold px-2 py-0.5 rounded-md border tracking-wider uppercase inline-block leading-none",
        style.color,
      )}
    >
      {style.label}
    </span>
  )
}
