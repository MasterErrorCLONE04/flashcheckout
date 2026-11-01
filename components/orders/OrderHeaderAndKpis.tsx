'use client'

import {
  ShoppingBag,
  Download,
  Clock,
  CheckCircle,
  CalendarDays,
  Route,
  WalletCards,
} from 'lucide-react'
import { formatCurrency } from './types'

export function OrderEmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh] w-full animate-in fade-in duration-300">
      <div className="text-center py-20 px-8 premium-card rounded-lg border-dashed border-zinc-200 bg-white/50 max-w-md w-full shadow-none">
        <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-zinc-350" />
        </div>
        <h3 className="text-base font-bold text-zinc-950 tracking-tight font-display">
          Sin pedidos
        </h3>
        <p className="text-zinc-400 text-[10px] font-bold tracking-wider mt-2.5 leading-relaxed">
          Tus pedidos apareceran aqui automaticamente en tiempo real
        </p>
      </div>
    </div>
  )
}

interface OrderHeaderAndKpisProps {
  totalRevenue: number
  pendingCount: number
  shippedCount: number
  deliveredCount: number
  onExportCsv: () => void
}

export function OrderHeaderAndKpis({
  totalRevenue,
  pendingCount,
  shippedCount,
  deliveredCount,
  onExportCsv,
}: OrderHeaderAndKpisProps) {
  return (
    <>
      {/* Header section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 select-none pt-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Listado de Pedidos
          </h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            Monitoreo y gestion de pedidos en tiempo real.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-10 px-4 rounded-lg border border-zinc-200 bg-white flex items-center gap-2 text-xs font-bold text-zinc-600 shadow-sm">
            <CalendarDays className="w-4 h-4 text-zinc-400" />
            Hoy
          </div>
          <button
            onClick={onExportCsv}
            className="h-9 px-3.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 text-xs font-semibold transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar ventas
          </button>
        </div>
      </div>

      {/* 1. Bento KPI Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card: Total Revenue */}
        <div className="rounded-lg p-5 bg-white border border-zinc-200/80 flex items-center justify-between group transition-all hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400">Ventas Netas</p>
            <h3 className="text-2xl font-semibold text-zinc-950 tracking-tight tabular-nums">
              {formatCurrency(totalRevenue)}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400">Pedidos no cancelados</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <WalletCards className="w-5 h-5" />
          </div>
        </div>

        {/* Card: Pending */}
        <div className="rounded-lg p-5 bg-white border border-zinc-200/80 flex items-center justify-between group hover:border-zinc-300 transition-all hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400">Pedidos Nuevos</p>
            <h3 className="text-2xl font-semibold text-zinc-955 tracking-tight tabular-nums">
              {pendingCount}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400">Esperando confirmacion</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card: Shipped */}
        <div className="rounded-lg p-5 bg-white border border-zinc-200/80 flex items-center justify-between group hover:border-zinc-300 transition-all hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400">En Reparto</p>
            <h3 className="text-2xl font-semibold text-zinc-955 tracking-tight tabular-nums">
              {shippedCount}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400">Despacho activo</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Route className="w-5 h-5" />
          </div>
        </div>

        {/* Card: Delivered */}
        <div className="rounded-lg p-5 bg-white border border-zinc-200/80 flex items-center justify-between group hover:border-zinc-300 transition-all hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400">Entregados</p>
            <h3 className="text-2xl font-semibold text-zinc-955 tracking-tight tabular-nums">
              {deliveredCount}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400">Cerrados correctamente</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </>
  )
}

