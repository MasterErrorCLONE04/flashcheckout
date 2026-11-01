'use client'

import {
  type OrderListProps,
  useOrderListState,
  OrderEmptyState,
  OrderHeaderAndKpis,
  OrderNavigatorPane,
  OrderDetailPane,
} from './orders'

export type { Order, OrderItem, OrderDriver } from './orders'

export default function OrderList({ initialOrders, storeName }: OrderListProps) {
  const {
    orders,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedOrderId,
    setSelectedOrderId,
    totalRevenue,
    pendingCount,
    shippedCount,
    deliveredCount,
    filteredOrders,
    activeOrder,
    updateStatus,
    requestDelivery,
    exportToCSV,
  } = useOrderListState(initialOrders, storeName)

  if (orders.length === 0) {
    return <OrderEmptyState />
  }

  return (
    <div className="w-full space-y-4.5">
      <OrderHeaderAndKpis
        totalRevenue={totalRevenue}
        pendingCount={pendingCount}
        shippedCount={shippedCount}
        deliveredCount={deliveredCount}
        onExportCsv={exportToCSV}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <OrderNavigatorPane
          orders={orders}
          filteredOrders={filteredOrders}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedOrderId={selectedOrderId}
          onSelectOrder={setSelectedOrderId}
        />

        <OrderDetailPane
          activeOrder={activeOrder}
          storeName={storeName}
          onUpdateStatus={updateStatus}
          onRequestDelivery={requestDelivery}
        />
      </div>
    </div>
  )
}
