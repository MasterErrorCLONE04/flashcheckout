'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Award,
  Percent,
  Download,
  Globe,
  MessageSquare,
  MapPin,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StackedBarChart, SalesChannelDonut } from '@/components/DashboardCharts'

export type SerializedAnalyticsOrder = {
  id: string
  customerName: string
  customerPhone: string | null
  city: string
  total: number
  status: string
  paymentStatus: string
  source: string
  isPaid: boolean
  isUploaded: boolean
  createdAt: string
  items: Array<{
    name: string
    qty: number
    price: number
  }>
}

interface AnalyticsDashboardProps {
  storeName: string
  storeSlug: string
  orders: SerializedAnalyticsOrder[]
  whatsappSessionsCount: number
  activeProductsCount: number
}

type RangePeriod = '7d' | '30d' | 'all'

export default function AnalyticsDashboard({
  storeName,
  orders,
  whatsappSessionsCount,
  activeProductsCount,
}: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<RangePeriod>('30d')

  // Lock body scroll on desktop so /analitica behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = orig
    }
  }, [])

  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders
    const days = period === '7d' ? 7 : 30
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (days - 1))
    cutoff.setHours(0, 0, 0, 0)
    return orders.filter(o => new Date(o.createdAt) >= cutoff)
  }, [orders, period])

  // Strictly Paid Orders for Revenue, AOV, Charts & Product Rankings
  const paidOrders = useMemo(
    () => filteredOrders.filter(o => o.isPaid),
    [filteredOrders]
  )
  const intentOrders = useMemo(
    () => filteredOrders.filter(o => !o.isPaid),
    [filteredOrders]
  )
  const uploadedOrders = useMemo(
    () => filteredOrders.filter(o => o.isUploaded),
    [filteredOrders]
  )

  const totalPaidRevenue = useMemo(
    () => paidOrders.reduce((acc, o) => acc + o.total, 0),
    [paidOrders]
  )
  const totalIntentValue = useMemo(
    () => intentOrders.reduce((acc, o) => acc + o.total, 0),
    [intentOrders]
  )
  const avgTicket = useMemo(
    () => (paidOrders.length > 0 ? Math.round(totalPaidRevenue / paidOrders.length) : 0),
    [totalPaidRevenue, paidOrders.length]
  )

  // Channel Breakdown (Only Paid Orders)
  const whatsappPaidRevenue = useMemo(
    () =>
      paidOrders
        .filter(o => o.source === 'WHATSAPP' || o.source === 'WHATSAPP_WEBVIEW')
        .reduce((acc, o) => acc + o.total, 0),
    [paidOrders]
  )
  const webPaidRevenue = Math.max(0, totalPaidRevenue - whatsappPaidRevenue)
  const whatsappPct =
    totalPaidRevenue > 0 ? Math.round((whatsappPaidRevenue / totalPaidRevenue) * 100) : 0
  const webPct = totalPaidRevenue > 0 ? 100 - whatsappPct : 0

  // Real Conversion Rate (Paid Orders / Total Checkout Intents)
  const checkoutConversionRate =
    filteredOrders.length > 0
      ? Math.round((paidOrders.length / filteredOrders.length) * 100)
      : 0

  // Daily Chart Data (Strictly Paid Orders)
  const chartData = useMemo(() => {
    const daysCount = period === '7d' ? 7 : 14
    const daysKeys = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const map = new Map<
      string,
      { date: string; webSales: number; whatsappSales: number; total: number }
    >()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label =
        daysCount === 7
          ? daysKeys[d.getDay()]
          : `${d.getDate()} ${d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}`
      map.set(key, { date: label, webSales: 0, whatsappSales: 0, total: 0 })
    }

    for (const order of paidOrders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      const entry = map.get(key)
      if (entry) {
        if (order.source === 'WHATSAPP' || order.source === 'WHATSAPP_WEBVIEW') {
          entry.whatsappSales += order.total
        } else {
          entry.webSales += order.total
        }
        entry.total += order.total
      }
    }

    return Array.from(map.values())
  }, [paidOrders, period])

  // Real Top Products Sold (Strictly from Paid Orders — zero fake products)
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; sold: number; revenue: number; ordersCount: number }>()
    for (const order of paidOrders) {
      for (const item of order.items) {
        const existing = map.get(item.name) || {
          name: item.name,
          sold: 0,
          revenue: 0,
          ordersCount: 0,
        }
        existing.sold += item.qty
        existing.revenue += item.qty * item.price
        existing.ordersCount += 1
        map.set(item.name, existing)
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [paidOrders])

  // Real Top Cities Breakdown
  const topCities = useMemo(() => {
    const map = new Map<string, { city: string; paidCount: number; intentCount: number; revenue: number }>()
    for (const order of filteredOrders) {
      const cityKey = (order.city || 'Sin especificar').trim()
      const existing = map.get(cityKey) || {
        city: cityKey,
        paidCount: 0,
        intentCount: 0,
        revenue: 0,
      }
      if (order.isPaid) {
        existing.paidCount += 1
        existing.revenue += order.total
      } else {
        existing.intentCount += 1
      }
      map.set(cityKey, existing)
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue || b.paidCount + b.intentCount - (a.paidCount + a.intentCount))
      .slice(0, 6)
  }, [filteredOrders])

  // Real Funnel Steps
  const funnelMax = Math.max(
    whatsappSessionsCount,
    filteredOrders.length,
    uploadedOrders.length + paidOrders.length,
    paidOrders.length,
    1
  )

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No hay registros en este periodo para exportar')
      return
    }
    const headers = [
      'ID Orden',
      'Fecha',
      'Cliente',
      'Telefono',
      'Ciudad',
      'Canal',
      'Estado Pago',
      'Total (COP)',
    ]
    const escape = (v: string | number | null) =>
      `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = filteredOrders.map(o => [
      escape(o.id),
      escape(new Date(o.createdAt).toLocaleString('es-CO')),
      escape(o.customerName),
      escape(o.customerPhone || ''),
      escape(o.city),
      escape(o.source),
      escape(o.isPaid ? 'PAGADO' : o.isUploaded ? 'EN VALIDACION' : 'INTENCION / PENDIENTE'),
      o.total,
    ])
    const csv =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute(
      'download',
      `analitica_${storeName.toLowerCase().replace(/\s+/g, '_')}_${period}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte de analítica exportado a CSV')
  }

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* 1. Top Studio Header Bar (h-13 / 53px) */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Analítica
          </h1>
        </div>

        {/* Center: Period Filter */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
          {(
            [
              { id: '7d', label: 'Últimos 7 días' },
              { id: '30d', label: 'Últimos 30 días' },
              { id: 'all', label: 'Histórico total' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={cn(
                'h-7 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer',
                period === tab.id
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Export CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* 2. 5-Column Real Financial & Conversion KPI Strip */}
      <section className="shrink-0 bg-white border-b border-zinc-200 grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Ingresos Pagados
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            ${totalPaidRevenue.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Solo ventas con pago confirmado
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Pedidos Pagados
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {paidOrders.length}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            De {filteredOrders.length} órdenes generadas
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Ticket Promedio Real
            </span>
            <Award className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            ${avgTicket.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Promedio por orden pagada
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Intención sin Pagar
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-mono font-bold text-amber-600 tabular-nums mt-0.5">
            ${totalIntentValue.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {intentOrders.length} carritos pendientes de cobro
          </p>
        </div>

        <div className="px-5 py-3 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Tasa de Cierre Checkout
            </span>
            <Percent className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {checkoutConversionRate}%
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Órdenes pagadas vs iniciadas
          </p>
        </div>
      </section>

      {/* 3. Main Scrollable Studio Body */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto space-y-5">
          {/* Row 1: Revenue Chart (8 cols) + Channel Distribution & Funnel (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Revenue Chart (Strictly Paid Orders) */}
            <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                      Ingresos Confirmados por Día
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono font-bold text-zinc-800">
                      ${totalPaidRevenue.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Excluye intenciones no pagadas y pedidos cancelados
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-zinc-950" />
                    Tienda Web
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    WhatsApp IA
                  </span>
                </div>
              </div>

              <div className="h-[240px] w-full">
                <StackedBarChart data={chartData} />
              </div>
            </div>

            {/* Channel Mix Donut */}
            <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                  Distribución por Canal (Pagados)
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Participación real en ventas cerradas
                </p>
              </div>

              <div className="h-[150px] my-2">
                <SalesChannelDonut
                  whatsappTotal={whatsappPaidRevenue}
                  webTotal={webPaidRevenue}
                />
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-zinc-700">
                    <Globe className="w-3.5 h-3.5 text-zinc-900" />
                    Tienda Web
                  </span>
                  <span className="font-mono font-bold text-zinc-950">
                    {webPct}% · ${webPaidRevenue.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-zinc-700">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp IA
                  </span>
                  <span className="font-mono font-bold text-zinc-950">
                    {whatsappPct}% · ${whatsappPaidRevenue.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Real Conversion Funnel + Top Products Sold + Top Cities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Real Conversion Funnel (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                    Embudo Comercial Real
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Registros reales en base de datos (sin estimaciones)
                  </p>
                </div>
                <Link
                  href="/clientes"
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 inline-flex items-center gap-0.5"
                >
                  <span>Ver CRM</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3.5 pt-1">
                {[
                  {
                    label: '1. Sesiones de Chat WhatsApp',
                    count: whatsappSessionsCount,
                    sub: 'Conversaciones registradas',
                    barColor: 'bg-zinc-400',
                  },
                  {
                    label: '2. Intenciones de Compra (Checkout)',
                    count: filteredOrders.length,
                    sub: 'Pedidos iniciados en Web o WhatsApp',
                    barColor: 'bg-zinc-700',
                  },
                  {
                    label: '3. Comprobantes por Validar',
                    count: uploadedOrders.length,
                    sub: 'Soportes Bre-B en revisión',
                    barColor: 'bg-amber-500',
                  },
                  {
                    label: '4. Ventas Confirmadas y Pagadas',
                    count: paidOrders.length,
                    sub: `$${totalPaidRevenue.toLocaleString('es-CO')} COP recaudados`,
                    barColor: 'bg-emerald-600',
                  },
                ].map((step, idx) => {
                  const pct = Math.min(100, Math.round((step.count / funnelMax) * 100))
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-800">{step.label}</span>
                        <span className="font-mono font-bold text-zinc-950 tabular-nums">
                          {step.count}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', step.barColor)}
                          style={{ width: `${step.count > 0 ? Math.max(pct, 6) : 0}%` }}
                        />
                      </div>
                      <p className="text-[10.5px] text-zinc-400">{step.sub}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Real Top Products Sold (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                      Productos Más Vendidos (Pagados)
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ranking real por ingresos confirmados ({activeProductsCount} activos en catálogo)
                    </p>
                  </div>
                  <Link
                    href="/productos"
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 inline-flex items-center gap-0.5"
                  >
                    <span>Catálogo</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                {topProducts.length === 0 ? (
                  <div className="py-12 px-4 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <Package className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-900">
                      Aún no hay productos con ventas pagadas en este periodo
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                      Cuando se confirme el pago de un pedido, aquí verás el ranking real de unidades e ingresos por producto.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {topProducts.map((prod, idx) => (
                      <div
                        key={prod.name}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono font-bold text-zinc-700 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate">{prod.name}</p>
                            <p className="text-[10.5px] text-zinc-400">
                              {prod.sold} un. vendidas · {prod.ordersCount} pedido(s)
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-zinc-950 tabular-nums shrink-0">
                          ${prod.revenue.toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Real Geographic Distribution by City (3 cols) */}
            <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                      Ciudades & Destinos
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ubicación real de tus compradores
                    </p>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                </div>

                {topCities.length === 0 ? (
                  <div className="py-12 px-4 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <MapPin className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-900">
                      Sin registros geográficos
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Las ciudades de entrega de tus pedidos aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {topCities.map(item => (
                      <div
                        key={item.city}
                        className="py-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate">{item.city}</p>
                          <p className="text-[10.5px] text-zinc-400">
                            {item.paidCount} pagados
                            {item.intentCount > 0 ? ` · ${item.intentCount} intención` : ''}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-zinc-950 tabular-nums shrink-0">
                          ${item.revenue.toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploadedOrders.length > 0 && (
                <Link
                  href="/verificaciones"
                  className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{uploadedOrders.length} pago(s) por aprobar</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
