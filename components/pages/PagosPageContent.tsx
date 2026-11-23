'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Download,
  DollarSign,
  CheckCircle2,
  Clock,
  FileCheck2,
  Search,
  X,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  usePagosState,
  PagosTable,
  PagosDetailDrawer,
} from '@/components/pagos'

export default function PagosPage() {
  const {
    searchQuery,
    filterEstado,
    filterMetodo,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    payments,
    loading,
    updatingStatusId,
    selectedPayment,
    setSelectedPayment,
    copiedRef,
    confirmingRefund,
    setConfirmingRefund,
    dateRangeLabel,
    totalVolume,
    volumePorValidar,
    volumePendiente,
    countExitosos,
    countPorValidar,
    countPendientes,
    countFallidos,
    avgPayment,
    approvalRate,
    totalPaymentsCount,
    totalPages,
    startIndex,
    endIndex,
    paginatedPayments,
    handleSearchChange,
    handleEstadoChange,
    handleMetodoChange,
    handleCopyRef,
    handleDownloadReceipt,
    handleApprovePayment,
    handleRefund,
    handleExport,
    formatCurrency,
  } = usePagosState()

  // Lock body scroll on desktop so /pagos behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const STATUS_TABS = [
    { id: 'Todos', label: 'Todos', count: payments.length },
    { id: 'Exitoso', label: 'Pagados', count: countExitosos },
    { id: 'Por Validar', label: 'Por Validar Bre-B', count: countPorValidar },
    { id: 'Pendiente', label: 'Pendientes', count: countPendientes },
    { id: 'Fallido', label: 'Anulados', count: countFallidos },
  ]

  const METHOD_PILLS = [
    { id: 'Todos', label: 'Todos los métodos' },
    { id: 'Transferencia', label: 'Transferencia / Bre-B' },
    { id: 'Mercado Pago', label: 'Mercado Pago' },
    { id: 'Tarjeta', label: 'Stripe / Tarjeta' },
    { id: 'Contra Entrega', label: 'Contra Entrega' },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO DE TESORERÍA ────────────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Pagos
          </h1>
        </div>

        {/* Centro: Conmutador por Estado de Pago */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => {
            const isActive = filterEstado === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleEstadoChange(tab.id)}
                className={cn(
                  'h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-0',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[9.5px] font-extrabold px-1.5 py-0.2 rounded tabular-nums',
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-200/70 text-zinc-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Derecha: Configurar Pasarelas + Exportar CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/integraciones"
            className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold hidden sm:inline-flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            <span>Pasarelas & Bre-B</span>
          </Link>

          <button
            type="button"
            onClick={handleExport}
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* ── 2. CINTA ARQUITECTÓNICA DE 4 KPIs FINANCIEROS REALES ─────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border-b border-zinc-200 divide-x divide-y lg:divide-y-0 divide-zinc-200 shrink-0">
        {/* KPI 1: Recaudo Confirmado */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Recaudo Confirmado
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                ${formatCurrency(totalVolume)}
              </span>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                {countExitosos} pagados
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Comprobantes por Validar (Bre-B / Transferencia) */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Comprobantes por Validar
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-blue-700 tracking-tight tabular-nums">
                ${formatCurrency(volumePorValidar)}
              </span>
              <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                {countPorValidar} soportes
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Pendiente por Cobrar */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Pendiente por Cobrar
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-amber-800 tracking-tight tabular-nums">
                ${formatCurrency(volumePendiente)}
              </span>
              <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                {countPendientes} en espera
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Ticket Promedio & Tasa de Aprobación */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Ticket Medio Pagado
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                ${formatCurrency(avgPayment)}
              </span>
              <span className="text-[10.5px] font-semibold text-zinc-500">
                ({approvalRate}% efectividad)
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── 3. LIENZO DIVIDIDO: LIBRO DE TRANSACCIONES + INSPECTOR DE PAGO ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 min-w-0 h-full flex flex-col bg-white overflow-hidden">
          {/* Sub-barra fija de Búsqueda y Filtro por Método de Pago */}
          <div className="px-4 py-2.5 border-b border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por #orden, referencia, cliente, producto o WhatsApp..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full h-8 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg pl-9 pr-8 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Píldoras de Método de Cobro */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
              {METHOD_PILLS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMetodoChange(m.id)}
                  className={cn(
                    'h-6 px-2.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border-0 whitespace-nowrap',
                    filterMetodo === m.id
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <PagosTable
            loading={loading}
            totalPaymentsCount={totalPaymentsCount}
            paginatedPayments={paginatedPayments}
            startIndex={startIndex}
            endIndex={endIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            formatCurrency={formatCurrency}
            selectedPaymentId={selectedPayment?.id}
            onSelectPayment={p => {
              setSelectedPayment(p)
              setConfirmingRefund(false)
            }}
          />
        </div>

        {/* Inspector Fijo de Transacción a la Derecha */}
        <PagosDetailDrawer
          selectedPayment={selectedPayment}
          onClose={() => {
            setSelectedPayment(null)
            setConfirmingRefund(false)
          }}
          copiedRef={copiedRef}
          onCopyRef={handleCopyRef}
          confirmingRefund={confirmingRefund}
          setConfirmingRefund={setConfirmingRefund}
          onApprovePayment={handleApprovePayment}
          onRefund={handleRefund}
          onDownloadReceipt={handleDownloadReceipt}
          formatCurrency={formatCurrency}
          updatingStatusId={updatingStatusId}
        />
      </div>
    </div>
  )
}
