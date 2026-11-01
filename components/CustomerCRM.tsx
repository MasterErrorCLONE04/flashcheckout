'use client'

import {
  type CustomerCRMProps,
  useCustomerCRMState,
  CustomerKpiCards,
  CustomerDirectoryTable,
  CustomerDetailPanel,
  CustomerEditModal,
} from './customer-crm'

export type { CustomerRecord, SerializedOrder } from './customer-crm'

export default function CustomerCRM({
  initialCustomers,
  initialOrders,
}: CustomerCRMProps) {
  const {
    search,
    setSearch,
    segmentFilter,
    setSegmentFilter,
    statusFilter,
    setStatusFilter,
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
    totalUniqueCustomers,
    active30Days,
    totalLtvSum,
    avgLtv,
  } = useCustomerCRMState(initialCustomers, initialOrders)

  return (
    <div className="space-y-6">
      <CustomerKpiCards
        totalUniqueCustomers={totalUniqueCustomers}
        active30Days={active30Days}
        totalLtvSum={totalLtvSum}
        avgLtv={avgLtv}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <CustomerDirectoryTable
          hasDetailOpen={Boolean(activeCustomer)}
          search={search}
          setSearch={setSearch}
          segmentFilter={segmentFilter}
          setSegmentFilter={setSegmentFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
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

        {activeCustomer && (
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
        )}
      </div>

      <CustomerEditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSaveCustomer}
        editName={editName}
        setEditName={setEditName}
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
