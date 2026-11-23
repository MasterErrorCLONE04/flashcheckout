'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Download,
  Plus,
  ShoppingBag,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Bot,
  Store,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Truck,
  Package,
  Globe,
  Send,
  Maximize2,
  Bell,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  StackedBarChart,
  WeeklySalesAreaChart,
} from '@/components/DashboardCharts'
import QrGenerator from '@/components/QrGenerator'
import {
  ClientContainerProps,
  useDashboardClientState,
  DashboardModals,
  QuickActionCard,
  AlertItem,
} from './client'

export { QuickActionCard }
export type { SmartInboxAlert, ActiveChat, DashboardStats } from './client'

const STUDIO_MODULES = [
  {
    href: '/tienda',
    title: 'Constructor Tienda',
    subtitle: 'Diseño y bloques',
    icon: Store,
  },
  {
    href: '/studio-ia',
    title: 'Studio IA',
    subtitle: 'Fotos y reels IA',
    icon: Sparkles,
  },
  {
    href: '/agente',
    title: 'Agente & Flujos',
    subtitle: 'Bot y automatización',
    icon: Bot,
  },
  {
    href: '/conversaciones',
    title: 'CRM WhatsApp',
    subtitle: 'Chats en vivo',
    icon: MessageSquare,
  },
]

export default function DashboardClientContainer(props: ClientContainerProps) {
  const {
    storeUrl,
    storeName,
    storeSlug,
    insights = [],
    aiActive = true,
    stats,
    chartData = [],
    initialChats = [],
    productsCount = 0,
  } = props

  const {
    copied,
    showQrModal,
    setShowQrModal,
    showWhatsAppModal,
    setShowWhatsAppModal,
    showAllAlertsModal,
    setShowAllAlertsModal,
    activities,
    whatsappConnected,
    qrCodeBase64,
    loadingQr,
    activeAlerts,
    handleCopyLink,
    handleConnectWhatsApp,
    handleDownloadReport,
  } = useDashboardClientState(props)

  const searchParams = useSearchParams()
  const currentDays = searchParams.get('days') === '30' ? '30' : '7'

  const [chartType, setChartType] = useState<'stacked' | 'area'>('stacked')

  const periodTotal = chartData.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
  const whatsappPct =
    stats.totalRevenueVal > 0
      ? Math.round((stats.whatsappTotalVal / stats.totalRevenueVal) * 100)
      : 0
  const webPct = stats.totalRevenueVal > 0 ? 100 - whatsappPct : 0

  const formatGrowth = (val: number) => {
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}%`
  }

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 min-h-[calc(100vh-53px)] flex flex-col bg-[#F4F4F5] font-sans text-left select-none">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO (TOP STUDIO BAR) ────────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 sticky top-0 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Panel Principal
          </h1>
        </div>

        {/* Centro: Píldora del Dominio + Selector 7d / 30d */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 h-8 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5">
            <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-700 truncate max-w-[200px]">
              {storeSlug ? `${storeSlug}.flashcheckout.co` : storeUrl.replace(/^https?:\/\//, '')}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1 rounded hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              title="Copiar enlace"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-1 rounded hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              title="Ver QR"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-950 transition-colors"
              title="Abrir tienda"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
            <Link
              href="/dashboard?days=7"
              className={cn(
                'h-7 px-2.5 rounded-md text-xs font-semibold flex items-center transition-all',
                currentDays === '7'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              7 días
            </Link>
            <Link
              href="/dashboard?days=30"
              className={cn(
                'h-7 px-2.5 rounded-md text-xs font-semibold flex items-center transition-all',
                currentDays === '30'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              30 días
            </Link>
          </div>
        </div>

        {/* Derecha: Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <Link
            href="/productos"
            className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold hidden sm:inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span>Producto</span>
          </Link>

          <Link
            href="/tienda"
            className="h-8 px-3.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Editar Tienda</span>
          </Link>
        </div>
      </header>

      {/* ── 2. LIENZO DE MANDO BENTO (SIN HUECOS VACÍOS) ─────────────────── */}
      <div className="flex-1 p-4 lg:p-5 max-w-[1600px] w-full mx-auto space-y-4">
        {/* FILA 1: 4 TARJETAS KPI EN BLANCO UNIFICADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: Volumen Comercial Hoy */}
          <Link
            href="/pedidos"
            className="group p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-950 shadow-2xs flex flex-col justify-between transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                  Volumen Comercial Hoy
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                  ${stats.revenueToday.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-800 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 tabular-nums">
                {formatGrowth(stats.revenueGrowth || 0)} vs ayer
              </span>
              <span className="font-semibold text-zinc-400 tabular-nums">
                Acumulado: ${stats.totalRevenueVal.toLocaleString('es-CO')}
              </span>
            </div>
          </Link>

          {/* KPI 2: Pedidos Hoy */}
          <Link
            href="/pedidos"
            className="group p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-950 shadow-2xs flex flex-col justify-between transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                  Pedidos Hoy
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                  {stats.ordersToday}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-800 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 tabular-nums">
                {stats.totalOrdersCount} históricos
              </span>
              <span className="font-semibold text-zinc-500 inline-flex items-center gap-1 group-hover:text-zinc-950">
                <span>Ver pedidos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* KPI 3: Ticket Promedio & Conversión */}
          <Link
            href="/analitica"
            className="group p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-950 shadow-2xs flex flex-col justify-between transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                  Ticket Promedio
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                  ${stats.avgTicketToday.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-800 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 tabular-nums">
                {stats.conversionRate.toFixed(1)}% conversión
              </span>
              <span className="font-semibold text-zinc-500 inline-flex items-center gap-1 group-hover:text-zinc-950">
                <span>Analítica</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* KPI 4: Conversaciones & Bot WhatsApp */}
          <Link
            href="/conversaciones"
            className="group p-5 rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-950 shadow-2xs flex flex-col justify-between transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                  Conversaciones Hoy
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                  {stats.chatsTodayCount}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-800 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 tabular-nums">
                ● {stats.activeChatsCount} activas (2h)
              </span>
              <span className="font-semibold text-zinc-500 tabular-nums">
                {stats.whatsappPct}% cierres IA
              </span>
            </div>
          </Link>
        </div>

        {/* FILA 2: RENDIMIENTO COMERCIAL (8 COLS) + TU TIENDA & SUITE DE ESTUDIOS (4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 8 Columnas: Gráfico de Rendimiento Comercial + Desglose por Canal */}
          <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Rendimiento Comercial ({currentDays} días)
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-white text-[10.5px] font-extrabold tabular-nums">
                    ${periodTotal.toLocaleString('es-CO')} COP
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                  Actividad diaria de pedidos en Tienda Web y Agente de WhatsApp
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-zinc-950" />
                    Web ({webPct}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    WhatsApp ({whatsappPct}%)
                  </span>
                </div>

                <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
                  <button
                    type="button"
                    onClick={() => setChartType('stacked')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer border-0 transition-all',
                      chartType === 'stacked'
                        ? 'bg-white text-zinc-950 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                    )}
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>Barras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('area')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer border-0 transition-all',
                      chartType === 'area'
                        ? 'bg-white text-zinc-950 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                    )}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Curva</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full h-[215px] pt-3">
              {chartType === 'stacked' ? (
                <StackedBarChart data={chartData} />
              ) : (
                <WeeklySalesAreaChart
                  data={chartData.map(d => ({ date: d.date, value: d.total }))}
                />
              )}
            </div>

            {/* Barra Inferior de Resumen por Canal */}
            <div className="grid grid-cols-3 gap-3 pt-3.5 mt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/60">
                <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-950" />
                  Tienda Web
                </span>
                <span className="text-xs font-black text-zinc-950 tabular-nums">
                  ${stats.webTotalVal.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/60">
                <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  WhatsApp IA
                </span>
                <span className="text-xs font-black text-zinc-950 tabular-nums">
                  ${stats.whatsappTotalVal.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/60">
                <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Salud Tienda
                </span>
                <span className="text-xs font-black text-zinc-950 tabular-nums">
                  {stats.healthScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* 4 Columnas: Tu Tienda Online QR + Lanzador de los 4 Estudios */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs">
            {/* Tarjeta Superior: Catálogo Público & QR */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Catálogo Público
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium truncate">
                  {storeSlug ? `${storeSlug}.flashcheckout.co` : storeUrl}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({ title: storeName, url: storeUrl })
                          .catch(console.error)
                      } else {
                        handleCopyLink()
                      }
                    }}
                    className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Compartir</span>
                  </button>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div
                onClick={() => setShowQrModal(true)}
                className="group/qr w-20 h-20 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 flex items-center justify-center shrink-0 cursor-pointer relative overflow-hidden"
                title="Ampliar y descargar código QR"
              >
                <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={66} />
                <div className="absolute inset-0 bg-zinc-950/75 opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-[8px] font-bold text-white uppercase">QR</span>
                </div>
              </div>
            </div>

            {/* Cuadrícula 2x2 de Estudios de Trabajo */}
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400">
                  Estudios de Trabajo
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">Acceso directo</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 flex-1">
                {STUDIO_MODULES.map(mod => {
                  const Icon = mod.icon
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      className="group p-3 rounded-xl border border-zinc-200 hover:border-zinc-950 bg-zinc-50/60 hover:bg-white transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-zinc-950 group-hover:text-white text-zinc-900 border border-zinc-200 flex items-center justify-center transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                      </div>
                      <div className="mt-2.5">
                        <span className="text-xs font-bold text-zinc-950 block truncate">
                          {mod.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium block truncate mt-0.5">
                          {mod.subtitle}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FILA 3: TABLA DE ÚLTIMOS PEDIDOS EN VIVO (8 COLS) + PULSO OPERATIVO & ALERTAS (4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 8 Columnas: Tabla de Pedidos y Transacciones Recientes */}
          <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Últimos Pedidos & Transacciones
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Órdenes recibidas desde tu catálogo web y WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/verificaciones"
                  className="h-8 px-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Pagos Bre-B ({stats.pendingProofsCount})</span>
                </Link>
                <Link
                  href="/pedidos"
                  className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-2.5">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-zinc-950">Aún no hay pedidos registrados</p>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
                  Comparte el enlace de tu tienda o activa tu agente de WhatsApp para recibir tu primer pedido.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {activities.map((act: any) => (
                  <Link
                    key={act.id}
                    href={act.href || '/pedidos'}
                    className="px-5 py-3.5 hover:bg-zinc-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900 font-mono text-[11px] font-black shrink-0">
                        #{act.code?.slice(-3) || 'ORD'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-950 truncate">
                            {act.customerName || act.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-zinc-400">
                            #{act.code}
                          </span>
                          {act.source && (
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                              {act.source}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                          {act.title} · {act.timeText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                          act.type === 'payment'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        )}
                      >
                        {act.statusLabel || (act.type === 'payment' ? 'Pagado' : 'En proceso')}
                      </span>
                      {act.amount !== undefined && (
                        <span className="text-sm font-black text-zinc-950 tabular-nums min-w-[80px] text-right">
                          ${act.amount.toLocaleString('es-CO')}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-zinc-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4 Columnas: Alertas Prioritarias & Diagnóstico IA */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Tareas & Alertas
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Atención inmediata e insights IA
                    </p>
                  </div>
                </div>
                {activeAlerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-white text-[10px] font-extrabold tabular-nums">
                    {activeAlerts.length}
                  </span>
                )}
              </div>

              {activeAlerts.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-950">Bandeja al día</p>
                    <p className="text-[10.5px] text-zinc-400">
                      Sin pagos ni despachos pendientes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.slice(0, 3).map(alert => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onOpenWhatsAppModal={() => {
                        setShowWhatsAppModal(true)
                        handleConnectWhatsApp()
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Diagnóstico IA Compacto */}
            {insights.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-900" />
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400">
                    Diagnóstico IA
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] font-medium text-zinc-600 leading-relaxed">
                  {insights[0]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DashboardModals
        showQrModal={showQrModal}
        onCloseQrModal={() => setShowQrModal(false)}
        storeUrl={storeUrl}
        storeName={storeName}
        showWhatsAppModal={showWhatsAppModal}
        onCloseWhatsAppModal={() => setShowWhatsAppModal(false)}
        loadingQr={loadingQr}
        qrCodeBase64={qrCodeBase64}
        onConnectWhatsApp={handleConnectWhatsApp}
        showAllAlertsModal={showAllAlertsModal}
        onCloseAllAlertsModal={() => setShowAllAlertsModal(false)}
        activeAlerts={activeAlerts}
      />
    </div>
  )
}
