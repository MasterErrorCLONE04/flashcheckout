'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Download,
  WalletCards,
  Clock,
  Truck,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react'
import {
  type OrderListProps,
  useOrderListState,
  OrderNavigatorPane,
  OrderDetailPane,
  formatCurrency,
} from './orders'
import { FilterTab } from './orders/OrderStatusBadge'

export type { Order, OrderItem, OrderDriver } from './orders'

export default function OrderList({ initialOrders, storeName }: OrderListProps) {
  const {
    orders,
    filter,
    setFilter,
    sourceFilter,
    setSourceFilter,
    searchQuery,
    setSearchQuery,
    selectedOrderId,
    setSelectedOrderId,
    updatingId,
    totalRevenue,
    pendingCount,
    confirmedCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    filteredOrders,
    activeOrder,
    updateStatus,
    requestDelivery,
    exportToCSV,
  } = useOrderListState(initialOrders, storeName)

  // Lock body scroll on desktop so /pedidos behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const STAGE_TABS = [
    { id: 'all', label: 'Todos', count: orders.length },
    { id: 'pending', label: 'Por Confirmar', count: pendingCount },
    { id: 'confirmed', label: 'Confirmados / Pagados', count: confirmedCount },
    { id: 'shipped', label: 'En Reparto / Guía', count: shippedCount },
    { id: 'delivered', label: 'Entregados', count: deliveredCount },
    ...(cancelledCount > 0
      ? [{ id: 'cancelled', label: 'Cancelados', count: cancelledCount }]
      : []),
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO DE PEDIDOS & LOGÍSTICA ──────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Pedidos
          </h1>
        </div>

        {/* Centro: Conmutador por Etapa de Despacho */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {STAGE_TABS.map(tab => (
            <FilterTab
              key={tab.id}
              label={tab.label}
              value={tab.id}
              active={filter === tab.id}
              count={tab.count}
              onClick={() => setFilter(tab.id)}
            />
          ))}
        </div>

        {/* Derecha: Verificaciones Bre-B + Exportar CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/verificaciones"
            className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold hidden sm:inline-flex items-center gap-1.5 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Validar Bre-B</span>
          </Link>

          <button
            type="button"
            onClick={exportToCSV}
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* ── 2. CINTA ARQUITECTÓNICA DE 4 KPIs DE LOGÍSTICA ───────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border-b border-zinc-200 divide-x divide-y lg:divide-y-0 divide-zinc-200 shrink-0">
        {/* KPI 1: Ventas en Pedidos Activos */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Volumen en Pedidos
            </span>
            <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums block mt-0.5">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <WalletCards className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Por Confirmar / En Alistamiento */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Por Despachar
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                {pendingCount + confirmedCount}
              </span>
              <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                {pendingCount} por confirmar
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: En Reparto / Enviados con Guía */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              En Tránsito / Guía
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                {shippedCount}
              </span>
              <span className="text-[10.5px] font-semibold text-zinc-400">
                en ruta
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Entregados */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Entregados
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-emerald-700 tracking-tight tabular-nums">
                {deliveredCount}
              </span>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Completados
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── 3. LIENZO DIVIDIDO: COLA DE PEDIDOS + ESTACIÓN DE DESPACHO ───── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <OrderNavigatorPane
          orders={orders}
          filteredOrders={filteredOrders}
          filter={filter}
          onFilterChange={setFilter}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedOrderId={selectedOrderId}
          onSelectOrder={setSelectedOrderId}
        />

        <OrderDetailPane
          activeOrder={activeOrder}
          storeName={storeName}
          updatingId={updatingId}
          onUpdateStatus={updateStatus}
          onRequestDelivery={requestDelivery}
        />
      </div>
    </div>
  )
}
