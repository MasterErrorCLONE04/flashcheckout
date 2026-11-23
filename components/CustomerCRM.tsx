'use client'

import React, { useEffect } from 'react'
import {
  Users,
  Download,
  DollarSign,
  UserCheck,
  Clock,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type CustomerCRMProps,
  useCustomerCRMState,
  CustomerDirectoryTable,
  CustomerDetailPanel,
  CustomerEditModal,
} from './customer-crm'

export type { CustomerRecord, SerializedOrder } from './customer-crm'

export default function CustomerCRM({
  initialCustomers,
  initialOrders,
  storeName,
}: CustomerCRMProps) {
  const {
    search,
    setSearch,
    segmentFilter,
    setSegmentFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    segmentCounts,
    showAllHistory,
    setShowAllHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedCustomerKey,
    setSelectedCustomerKey,
    filteredCustomers,
    totalPages,
    startIndex,
    paginatedCustomers,
    activeCustomer,
    activeCustomerOrders,
    visibleCustomerOrders,
    activeAverageTicket,
    hasActiveFilters,
    handleClearFilters,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    editPhone,
    setEditPhone,
    editEmail,
    setEditEmail,
    editBirthDate,
    setEditBirthDate,
    editCity,
    setEditCity,
    editNotes,
    setEditNotes,
    isSaving,
    handleStartEdit,
    handleSaveCustomer,
    handleExportCsv,
    totalUniqueCustomers,
    paidCustomersCount,
    intentCustomersCount,
    totalLtvSum,
    totalIntentSum,
    avgLtv,
    repeatRate,
  } = useCustomerCRMState(initialCustomers, initialOrders)

  // Lock body scroll on desktop so /clientes behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const SEGMENT_TABS = [
    { id: 'Todos', label: 'Todos', count: segmentCounts.Todos },
    { id: 'Frecuente', label: '★ Frecuentes (2+ pagos)', count: segmentCounts.Frecuente },
    { id: 'Comprador', label: 'Compraron y Pagaron', count: segmentCounts.Comprador },
    { id: 'Intención', label: 'Intención de Compra', count: segmentCounts.Intención },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO (SIN CREACIÓN MANUAL DE CLIENTES) ── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Clientes
          </h1>
        </div>

        {/* Centro: Conmutador entre Compradores Pagados e Intenciones */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {SEGMENT_TABS.map(tab => {
            const isActive = segmentFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSegmentFilter(tab.id)}
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

        {/* Derecha: Solo Exportar Reporte CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            title="Descargar reporte de compradores e intenciones en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* ── 2. CINTA ARQUITECTÓNICA: COMPRADORES PAGADOS VS INTENCIÓN ────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border-b border-zinc-200 divide-x divide-y lg:divide-y-0 divide-zinc-200 shrink-0">
        {/* KPI 1: Ingresos Reales Pagados */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Ingresos Pagados (LTV Real)
            </span>
            <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums block mt-0.5">
              ${totalLtvSum.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Clientes que Compraron y Pagaron */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Compraron y Pagaron
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums">
                {paidCustomersCount}
              </span>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                {repeatRate}% recompra
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: Intenciones de Compra (No pagaron aún) */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              En Intención de Compra
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-amber-800 tracking-tight tabular-nums">
                {intentCustomersCount}
              </span>
              <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 rounded tabular-nums">
                ${totalIntentSum.toLocaleString('es-CO')} por cobrar
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Ticket Promedio Pagado */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Ticket Medio Pagado
            </span>
            <span className="text-xl font-black text-zinc-950 tracking-tight tabular-nums block mt-0.5">
              ${avgLtv.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── 3. LIENZO DIVIDIDO: TABLA DE REGISTROS + INSPECTOR 360° ────── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <CustomerDirectoryTable
          search={search}
          setSearch={setSearch}
          segmentFilter={segmentFilter}
          setSegmentFilter={setSegmentFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          paginatedCustomers={paginatedCustomers}
          filteredCount={filteredCustomers.length}
          selectedCustomerKey={selectedCustomerKey}
          onSelectCustomer={setSelectedCustomerKey}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
        />

        <CustomerDetailPanel
          customer={activeCustomer}
          activeAverageTicket={activeAverageTicket}
          totalOrdersCount={activeCustomerOrders.length}
          visibleCustomerOrders={visibleCustomerOrders}
          showAllHistory={showAllHistory}
          onToggleShowAllHistory={() => setShowAllHistory(value => !value)}
          onStartEdit={handleStartEdit}
          onClose={() => setSelectedCustomerKey(null)}
        />
      </div>

      {/* Modal solo para editar notas o datos complementarios de un registro existente */}
      <CustomerEditModal
        isOpen={isEditing}
        mode="edit"
        onClose={() => setIsEditing(false)}
        onSubmit={handleSaveCustomer}
        editName={editName}
        setEditName={setEditName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editBirthDate={editBirthDate}
        setEditBirthDate={setEditBirthDate}
        editCity={editCity}
        setEditCity={setEditCity}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        isSaving={isSaving}
      />
    </div>
  )
}
