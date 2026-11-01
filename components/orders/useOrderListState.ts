'use client'

import { useState } from 'react'
import { STATUS_OPTIONS, type Order } from './types'

export function useOrderListState(initialOrders: Order[], storeName: string) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrders.length > 0 ? initialOrders[0].id : null
  )

  // 1. Metricas de KPI Cards
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  const pendingCount = orders.filter(
    o => o.status === 'pending_payment' || o.status === 'payment_review' || o.status === 'pending'
  ).length
  const shippedCount = orders.filter(
    o => o.status === 'in_transit' || o.status === 'shipped_external' || o.status === 'shipped'
  ).length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  // 2. Filtro y Busqueda de Ordenes
  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeOrder = orders.find(o => o.id === selectedOrderId) || null

  // 3. API Actions
  async function updateStatus(orderId: string, newStatus: string) {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('API update failed')
      const data = await res.json()
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? data.order : o))
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  async function requestDelivery(orderId: string) {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, deliveryRequested: true } : o))
    )

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryRequested: true }),
      })
      if (!res.ok) throw new Error('API delivery request failed')
      const data = await res.json()
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? data.order : o))
        )
      }
    } catch (error) {
      console.error('Error requesting delivery:', error)
    }
  }

  function exportToCSV() {
    const headers = [
      'ID Pedido',
      'Cliente',
      'Telefono',
      'Direccion',
      'Ciudad',
      'Total',
      'Estado',
      'Fecha Creacion',
      'Articulos',
    ]

    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.customerPhone || '',
      o.address,
      o.city,
      o.total,
      STATUS_OPTIONS.find(s => s.value === o.status)?.label || o.status,
      new Date(o.createdAt).toLocaleString('es-CO'),
      o.items.map(item => `${item.qty}x ${item.name}`).join(' | '),
    ])

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map(row =>
          row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `Balance_Ventas_${storeName.replace(/\s+/g, '_')}_${
        new Date().toISOString().split('T')[0]
      }.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
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
  }
}

