"use client"

import React from 'react'
import {
  useDescuentosState,
  DescuentosHeader,
  DescuentosTabs,
  DescuentosStatsCards,
  DescuentosTable,
  DescuentosPerformanceSidebar,
  DescuentosModal,
} from '@/components/descuentos'

export default function DescuentosPage() {
  const {
    mounted,
    coupons,
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
    isModalOpen,
    setIsModalOpen,
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
    pctPercent,
    freeShipPercent,
    fixedPercent,
    mostUsedCoupon,
    mostUsedPercent,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleExport,
  } = useDescuentosState()

  return (
    <>
      <div className="space-y-6 pb-6 animate-in duration-300 text-left">
        {/* Header section */}
        <DescuentosHeader
          onExport={handleExport}
          onOpenCreate={openCreateModal}
        />

        {/* Tabs Menu */}
        <DescuentosTabs
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab)
            setCurrentPage(1)
          }}
          totalCount={totalCount}
          activeCount={activeCount}
          scheduledCount={scheduledCount}
          inactiveCount={inactiveCount}
        />

        {/* Stat Cards (1x5) */}
        <DescuentosStatsCards
          totalCount={totalCount}
          activeCount={activeCount}
          scheduledCount={scheduledCount}
          inactiveCount={inactiveCount}
          totalUses={totalUses}
        />

        {/* Main Grid: Table (8/12) & Performance Sidebar (4/12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
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
            onToggleStatus={handleToggleStatus}
            onOpenEdit={openEditModal}
            onDelete={handleDelete}
          />

          <DescuentosPerformanceSidebar
            coupons={coupons}
            totalUses={totalUses}
            pctPercent={pctPercent}
            pctCount={pctCount}
            freeShipPercent={freeShipPercent}
            freeShipCount={freeShipCount}
            fixedPercent={fixedPercent}
            fixedCount={fixedCount}
            mostUsedCoupon={mostUsedCoupon}
            mostUsedPercent={mostUsedPercent}
          />
        </div>
      </div>

      {/* Modal Crear / Editar Descuento */}
      <DescuentosModal
        isOpen={isModalOpen}
        mounted={mounted}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formLoading={formLoading}
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
      />
    </>
  )
}
