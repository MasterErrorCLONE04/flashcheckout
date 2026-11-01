'use client'

import {
  usePagosState,
  PagosHeader,
  PagosStatsCards,
  PagosFilters,
  PagosTable,
  PagosOptimizaBanner,
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
    loading,
    selectedPayment,
    setSelectedPayment,
    copiedRef,
    confirmingRefund,
    setConfirmingRefund,
    dateRangeLabel,
    totalVolume,
    countExitosos,
    countPendientes,
    countFallidos,
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
    handleRefund,
    handleExport,
    formatCurrency,
  } = usePagosState()

  return (
    <div className="space-y-6 pb-6 animate-in duration-300 text-left">
      {/* Header section */}
      <PagosHeader onExport={handleExport} />

      {/* Grid: Stat Cards (1x4) */}
      <PagosStatsCards
        totalVolume={totalVolume}
        countExitosos={countExitosos}
        countPendientes={countPendientes}
        countFallidos={countFallidos}
        formatCurrency={formatCurrency}
      />

      {/* Main Grid: Table and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
            <PagosFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              dateRangeLabel={dateRangeLabel}
              filterEstado={filterEstado}
              onEstadoChange={handleEstadoChange}
              filterMetodo={filterMetodo}
              onMetodoChange={handleMetodoChange}
            />

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
              onSelectPayment={setSelectedPayment}
            />
          </div>

          {/* Banner bottom: Optimiza tus cobros */}
          <PagosOptimizaBanner />
        </div>
      </div>

      {/* Detail Drawer Modal */}
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
        onRefund={handleRefund}
        onDownloadReceipt={handleDownloadReceipt}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
