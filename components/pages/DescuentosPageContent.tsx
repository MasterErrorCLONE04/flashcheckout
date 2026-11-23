'use client'

import React, { useEffect } from 'react'
import {
  Tag,
  Download,
  Plus,
  Ticket,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useDescuentosState,
  DescuentosTable,
  DescuentosPerformanceSidebar,
  TabId,
} from '@/components/descuentos'

export default function DescuentosPage() {
  const {
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterEstado,
    setFilterEstado,
    filterTipo,
    setFilterTipo,
    filterTipoDesc,
    setFilterTipoDesc,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    formLoading,
    isDeleting,
    editingId,
    code,
    setCode,
    desc,
    setDesc,
    tipo,
    setTipo,
    tipoDesc,
    setTipoDesc,
    valorNum,
    setValorNum,
    validoHasta,
    setValidoHasta,
    estado,
    setEstado,
    filteredCoupons,
    totalPages,
    paginatedCoupons,
    totalCount,
    activeCount,
    scheduledCount,
    inactiveCount,
    totalUses,
    pctCount,
    freeShipCount,
    fixedCount,
    mostUsedCoupon,
    openCreateModal,
    openEditModal,
    generateRandomCode,
    handleCopyCode,
    handleCopyPromoText,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleExport,
  } = useDescuentosState()

  // Lock body scroll on desktop so /descuentos behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const STATUS_TABS: Array<{ id: TabId; label: string; count: number }> = [
    { id: 'Todas', label: 'Todos', count: totalCount },
    { id: 'Activas', label: 'Activos', count: activeCount },
    { id: 'Programadas', label: 'Programados', count: scheduledCount },
    { id: 'Inactivas', label: 'Inactivos', count: inactiveCount },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO DE DESCUENTOS ───────────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Descuentos
          </h1>
        </div>

        {/* Centro: Conmutador por Estado */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setCurrentPage(1)
                }}
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

        {/* Derecha: Exportar CSV + Nuevo Cupón */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Exportar cupones en CSV"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Cupón</span>
          </button>
        </div>
      </header>

      {/* ── 2. CINTA ARQUITECTÓNICA DE 4 KPIs DE PROMOCIONES ─────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border-b border-zinc-200 divide-x divide-y lg:divide-y-0 divide-zinc-200 shrink-0">
        {/* KPI 1: Cupones Activos */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Cupones Activos
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                {activeCount}
              </span>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                de {totalCount} creados
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Redenciones Totales */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Redenciones Totales
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                {totalUses}
              </span>
              <span className="text-[10.5px] font-semibold text-zinc-400">
                usos en checkout
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Cupón Más Usado */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Cupón Estrella
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-mono font-black text-zinc-950 truncate">
                {mostUsedCoupon ? mostUsedCoupon.code : '—'}
              </span>
              {mostUsedCoupon && (
                <span className="text-[10.5px] font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded tabular-nums shrink-0">
                  {mostUsedCoupon.usos} usos
                </span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Mix de Beneficios */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Mix de Beneficios
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[10.5px] font-bold text-zinc-700">
              <span className="px-1.5 py-0.5 rounded bg-zinc-100">{pctCount} %</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100">{fixedCount} $</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-100">{freeShipCount} Envío</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── 3. LIENZO DIVIDIDO: TABLA DE CUPONES + CONSTRUCTOR EN VIVO ───── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <DescuentosTable
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterEstado={filterEstado}
          setFilterEstado={setFilterEstado}
          filterTipo={filterTipo}
          setFilterTipo={setFilterTipo}
          filterTipoDesc={filterTipoDesc}
          setFilterTipoDesc={setFilterTipoDesc}
          loading={loading}
          paginatedCoupons={paginatedCoupons}
          filteredCoupons={filteredCoupons}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          isDeleting={isDeleting}
          editingId={editingId}
          onToggleStatus={handleToggleStatus}
          onOpenEdit={openEditModal}
          onDelete={handleDelete}
          onCopyCode={handleCopyCode}
          onCopyPromoText={handleCopyPromoText}
        />

        <DescuentosPerformanceSidebar
          editingId={editingId}
          code={code}
          setCode={setCode}
          desc={desc}
          setDesc={setDesc}
          tipo={tipo}
          setTipo={setTipo}
          tipoDesc={tipoDesc}
          setTipoDesc={setTipoDesc}
          valorNum={valorNum}
          setValorNum={setValorNum}
          validoHasta={validoHasta}
          setValidoHasta={setValidoHasta}
          estado={estado}
          setEstado={setEstado}
          formLoading={formLoading}
          onSubmit={handleSubmit}
          onResetCreate={openCreateModal}
          onGenerateRandomCode={generateRandomCode}
          onCopyPromoText={handleCopyPromoText}
        />
      </div>
    </div>
  )
}
