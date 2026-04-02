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
} from 'lucide-react'
import StoreSetupForm from '@/components/StoreSetupForm'
import CopyButton from '@/components/CopyButton'
import SalesChart from '@/components/SalesChart'
import QrGenerator from '@/components/QrGenerator'

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
    return <StoreSetupForm />
  }

  const recentOrders = await prisma.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const totalRevenue = await prisma.order.aggregate({
    where: { storeId: store.id },
    _sum: { total: true },
  })

  // Fechas Claves
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(todayStart.getDate() - 6) // Últimos 7 días incluyendo hoy
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // Consultas Compuestas
  const todayOrders = await prisma.order.count({
    where: {
      storeId: store.id,
      createdAt: { gte: todayStart },
    },
  })

  const lowStockCount = await prisma.product.count({
    where: {
      storeId: store.id,
      stock: { lte: 5 },
      active: true,
    },
  })

  // Obtener pedidos de los últimos 7 días para el Gráfico
  const weeklyOrders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      createdAt: { gte: sevenDaysAgo },
    },
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
    daysMap.set(dayName, 0) // Inicializar en 0
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
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {store.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Aquí tienes el resumen de tu tienda
        </p>
      </div>

      {/* Store Link Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium text-emerald-100">
              Tu link de checkout
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 mb-3">
            <code className="text-sm font-mono flex-1 truncate">
              {storeUrl}
            </code>
            <CopyButton text={storeUrl} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
            <p className="text-xs text-emerald-200 leading-relaxed">
              Comparte tu link por redes o <br className="hidden sm:block" /> imprime tu QR para usarlo en locales físicos.
            </p>
            <QrGenerator url={storeUrl} storeName={store.name} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Ventas (Todo el tiempo)"
          value={`$${(totalRevenue._sum.total ?? 0).toLocaleString('es-CO')}`}
        />
        <StatCard
          icon={CalendarDays}
          label="Pedidos Semana"
          value={weeklyOrdersCount.toString()}
        />
        <StatCard
          icon={TrendingUp}
          label="Pedidos Hoy"
          value={todayOrders.toString()}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock Bajo (≤ 5)"
          value={lowStockCount.toString()}
          valueClass={lowStockCount > 0 ? "text-amber-600" : ""}
        />
      </div>

      {/* Gráfico Analítico */}
      <div className="w-full">
        <SalesChart data={chartData} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/productos"
          className="flex items-center justify-between bg-white border border-border rounded-2xl p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Gestionar productos</p>
              <p className="text-xs text-muted-foreground">Agregar, editar o eliminar</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/pedidos"
          className="flex items-center justify-between bg-white border border-border rounded-2xl p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Ver pedidos</p>
              <p className="text-xs text-muted-foreground">Revisar y actualizar estado</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Últimos pedidos</h2>
            <Link
              href="/pedidos"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              Ver todos <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2 stagger">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between bg-white border border-border/60 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold">
                    ${order.total.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueClass = "",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  valueClass?: string
}) {
  return (
    <div className="bg-white border border-border/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-sm transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl font-bold tracking-tight ${valueClass || 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }

  const labels: Record<string, string> = {
    pending: 'Nuevo',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  }

  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        styles[status] ?? styles.pending
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}


