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
} from 'lucide-react'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import CopyButton from '@/components/CopyButton'
import SalesChart from '@/components/SalesChart'
import QrGenerator from '@/components/QrGenerator'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

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

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(todayStart.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const todayOrders = await prisma.order.count({
    where: { storeId: store.id, createdAt: { gte: todayStart } },
  })

  const lowStockCount = await prisma.product.count({
    where: { storeId: store.id, stock: { lte: 5 }, active: true },
  })

  const weeklyOrders = await prisma.order.findMany({
    where: { storeId: store.id, createdAt: { gte: sevenDaysAgo } },
    select: { total: true, createdAt: true },
  })

  const weeklyOrdersCount = weeklyOrders.length
  
  // Agrupar ventas diarias en Formato Recharts
  const daysMap = new Map()
  const daysKeys = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayName = daysKeys[d.getDay()]
    daysMap.set(dayName, 0)
  }

  weeklyOrders.forEach(order => {
    const dt = new Date(order.createdAt)
    const dayName = daysKeys[dt.getDay()]
    if (daysMap.has(dayName)) {
      daysMap.set(dayName, daysMap.get(dayName) + order.total)
    }
  })

  const chartData = Array.from(daysMap, ([date, total]) => ({ date, total }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const storeUrl = `${appUrl}/tienda/${store.slug}`

  return (
    <div className="space-y-10 animate-in pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950">
            Panel de control
          </h1>
          <p className="text-[17px] text-zinc-500 font-normal mt-3 max-w-lg leading-relaxed">
            Gestionando <span className="text-zinc-950 font-medium">{store.name}</span> · <span className="text-emerald-600 font-medium">Status: Operativo</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[13px] font-medium text-zinc-400 tracking-tight leading-none">Última actividad</span>
            <span className="text-sm font-medium text-emerald-600 mt-2 tracking-tight">Hace 2 minutos</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center relative group cursor-pointer hover:bg-zinc-50 transition-all">
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            <Bell className="w-5 h-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Cell 1: Main Store Link (Large) */}
        <div className="md:col-span-8 premium-card p-6 md:p-8 flex flex-col justify-between group relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[120px] -mr-40 -mt-40" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-medium tracking-tight text-zinc-400 mb-0.5">Link de despacho</p>
                <p className="text-[17px] font-medium text-zinc-950 tracking-tight">Terminal operativo FlashCheckout</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-zinc-50 border border-gray-200 rounded-lg px-6 py-5 flex items-center gap-4 group-hover:border-primary/20 transition-all">
                  <span className="text-primary font-mono text-sm opacity-50 hidden sm:inline">https://</span>
                  <code className="text-sm md:text-base font-mono font-bold text-zinc-800 flex-1 truncate">
                    {store.slug}.flashcheckout.co
                  </code>
                  <CopyButton text={storeUrl} />
                </div>
                <Link 
                  href={storeUrl} 
                  target="_blank"
                  className="btn-premium flex items-center justify-center gap-3 px-12 h-16 text-sm"
                >
                  Abrir tienda <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 flex items-center gap-4 text-xs font-semibold text-zinc-400 border-t border-black/[0.03]">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100" />
              ))}
            </div>
            <span>+152 clientes han visitado tu tienda hoy</span>
          </div>
        </div>

        {/* Cell 2: QR System (Medium) */}
        <div className="md:col-span-4 premium-card p-6 flex flex-col items-center justify-center text-center group bg-white">
          <div className="p-4 bg-zinc-50 rounded-lg mb-4 group-hover:scale-105 transition-transform duration-500 border border-gray-200">
            <QrGenerator url={storeUrl} storeName={store.name} />
          </div>
          <p className="text-xs font-bold tracking-widest text-zinc-400 mb-1.5">Código QR</p>
          <p className="text-[13px] text-zinc-500 font-bold tracking-widest">Stickers de envío o tarjetas</p>
        </div>

        {/* Cell 3: Revenue (Medium/Small) */}
        <div className="md:col-span-4 premium-card p-6 group bg-white">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[13px] font-medium tracking-tight text-zinc-400 mb-2">Ingresos totales</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl md:text-3xl font-semibold text-zinc-950 tabular-nums tracking-tighter">
              ${(totalRevenue._sum.total ?? 0).toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12.5%</span>
          </div>
        </div>

        {/* Cell 4: Weekly Performance (Medium/Small) */}
        <div className="md:col-span-4 premium-card p-6 group bg-white">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
            <ShoppingCart className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-[13px] font-medium tracking-tight text-zinc-400 mb-2">Pedidos / 7 días</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl md:text-3xl font-semibold text-zinc-950 tabular-nums tracking-tighter">
              {weeklyOrdersCount}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md tracking-tight">Activo</span>
          </div>
        </div>

        {/* Cell 5: Stock Alerts (Medium/Small) */}
        <div className="md:col-span-4 premium-card p-6 group overflow-hidden bg-white">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all",
            lowStockCount > 0 ? "bg-rose-50 text-rose-500" : "bg-zinc-50 text-zinc-400"
          )}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-[13px] font-medium tracking-tight text-zinc-400 mb-2">Stock crítico</p>
          <div className="flex items-baseline gap-3">
            <span className={cn(
              "text-2xl md:text-3xl font-semibold tabular-nums tracking-tighter",
              lowStockCount > 0 ? "text-rose-500" : "text-zinc-950"
            )}>
              {lowStockCount}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 tracking-tight">unidades restantes</span>
          </div>
          <Link href="/productos" className="absolute bottom-6 right-8 text-zinc-300 hover:text-zinc-950 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

        {/* Cell 6: Analytics Chart (Large Wide) */}
        <div className="md:col-span-8 premium-card p-6 md:p-8 bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] blur-[120px] -mr-40 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[13px] font-medium tracking-tight text-zinc-500 leading-none">Rendimiento operativo</p>
              </div>
              <h3 className="text-2xl font-semibold text-zinc-950 tracking-tight">Actividad comercial</h3>
              <p className="text-[13px] text-zinc-400 font-normal mt-3 tracking-tight">Métrica: Ventas brutas consolidado</p>
            </div>
            
            <div className="flex items-center gap-3 bg-zinc-50 border border-gray-200 p-1 rounded-lg">
               <button className="px-6 py-2.5 rounded-md text-xs font-medium tracking-tight bg-white text-zinc-950 transition-all">7 días</button>
               <button className="px-6 py-2.5 rounded-md text-xs font-medium tracking-tight text-zinc-400 hover:text-zinc-600 transition-all">30 días</button>
            </div>
          </div>

          <div className="h-[320px] w-full relative z-10">
            <SalesChart data={chartData} />
          </div>
        </div>

        {/* Cell 7: Recent Orders (Medium Sidebar Style) */}
        <div className="md:col-span-4 premium-card p-6 md:p-8 overflow-hidden bg-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[15px] font-semibold text-zinc-950 tracking-tight">Últimos pedidos</h3>
            <Link href="/pedidos" className="p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-all border border-gray-200">
              <ArrowUpRight className="w-5 h-5 text-zinc-400" />
            </Link>
          </div>

          <div className="space-y-3 stagger">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="group flex items-center justify-between p-4 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-black truncate group-hover:text-primary transition-colors">
                    {order.customerName}
                  </p>
                  <p className="text-[13px] font-medium text-zinc-500 mt-0.5">
                    {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <p className="text-sm font-bold text-black tabular-nums">
                    ${order.total.toLocaleString('es-CO')}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
            
            {recentOrders.length === 0 && (
              <div className="text-center py-12">
                <Zap className="w-8 h-8 mx-auto mb-3 text-zinc-200" />
                <p className="text-[10px] font-bold tracking-widest text-zinc-400">No hay órdenes registradas</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string, text: string, shadow: string, label: string }> = {
    pending: { bg: 'bg-amber-100/50', text: 'text-amber-700', shadow: 'none', label: 'Nuevo' },
    confirmed: { bg: 'bg-blue-100/50', text: 'text-blue-700', shadow: 'none', label: 'Confirmado' },
    shipped: { bg: 'bg-indigo-100/50', text: 'text-indigo-700', shadow: 'none', label: 'En camino' },
    delivered: { bg: 'bg-emerald-100/50', text: 'text-emerald-700', shadow: 'none', label: 'Entregado' },
    cancelled: { bg: 'bg-red-100/50', text: 'text-red-700', shadow: 'none', label: 'Cancelado' },
  }

  const style = styles[status] ?? styles.pending

  return (
    <span
      className={cn(
        "text-[11px] font-bold px-3 py-1 rounded-md border border-gray-100 tracking-tight uppercase",
        style.bg,
        style.text,
      )}
    >
      {style.label}
    </span>
  )
}


