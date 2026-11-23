'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { STATUS_OPTIONS, getOrderStage, type Order } from './types'

export function useOrderListState(initialOrders: Order[], storeName: string) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'web' | 'whatsapp'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrders.length > 0 ? initialOrders[0].id : null
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // 1. Métricas de KPI Cards (100% reales)
  const totalRevenue = orders
    .filter(o => getOrderStage(o) !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  const pendingCount = orders.filter(o => getOrderStage(o) === 'pending').length
  const confirmedCount = orders.filter(o => getOrderStage(o) === 'confirmed').length
  const shippedCount = orders.filter(o => getOrderStage(o) === 'shipped').length
  const deliveredCount = orders.filter(o => getOrderStage(o) === 'delivered').length
  const cancelledCount = orders.filter(o => getOrderStage(o) === 'cancelled').length

  // 2. Filtro y Búsqueda de Órdenes
  const filteredOrders = orders.filter(o => {
    const stage = getOrderStage(o)
    const matchesStage = filter === 'all' || stage === filter || o.status === filter
    if (!matchesStage) return false

    const isWa = o.source === 'WHATSAPP' || o.source === 'WHATSAPP_WEBVIEW'
    if (sourceFilter === 'whatsapp' && !isWa) return false
    if (sourceFilter === 'web' && isWa) return false

    const q = searchQuery.toLowerCase()
    const matchesSearch =
      o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q) ||
      o.items.some(it => it.name.toLowerCase().includes(q))

    return matchesSearch
  })

  const activeOrder = orders.find(o => o.id === selectedOrderId) || null

  // 3. API Actions
  async function updateStatus(
    orderId: string,
    newStatus: string,
    extra?: { externalCarrier?: string; trackingNumber?: string }
  ) {
    setUpdatingId(orderId)
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              ...(extra?.externalCarrier ? { externalCarrier: extra.externalCarrier } : {}),
              ...(extra?.trackingNumber ? { trackingNumber: extra.trackingNumber } : {}),
            }
          : o
      )
    )

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(extra?.externalCarrier ? { externalCarrier: extra.externalCarrier } : {}),
          ...(extra?.trackingNumber ? { trackingNumber: extra.trackingNumber } : {}),
        }),
      })
      if (!res.ok) throw new Error('API update failed')
      const data = await res.json()
      if (data.success && data.order) {
        setOrders(prev =>
          prev.map(o =>
            o.id === orderId
              ? {
                  ...o,
                  status: data.order.status,
                  paymentStatus: data.order.paymentStatus,
                  externalCarrier: data.order.externalCarrier,
                  trackingNumber: data.order.trackingNumber,
                  deliveryRequested: data.order.deliveryRequested,
                  driver: data.order.driver ?? o.driver,
                }
              : o
          )
        )
      }
      toast.success(
        newStatus === 'shipped_external'
          ? 'Pedido despachado y guía notificada al cliente por WhatsApp'
          : 'Estado del pedido actualizado'
      )
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('No se pudo actualizar el estado del pedido')
    } finally {
      setUpdatingId(null)
    }
  }

  async function requestDelivery(orderId: string) {
    setUpdatingId(orderId)
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
      toast.success('Solicitud de domiciliario local enviada')
    } catch (error) {
      console.error('Error requesting delivery:', error)
      toast.error('No se pudo solicitar el domiciliario')
    } finally {
      setUpdatingId(null)
    }
  }

  function exportToCSV() {
    const headers = [
      'ID Pedido',
      'Cliente',
      'WhatsApp',
      'Dirección',
      'Ciudad',
      'Canal',
      'Total (COP)',
      'Estado',
      'Transportadora',
      'Guía',
      'Fecha Creación',
      'Artículos',
    ]

    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.customerPhone || '',
      o.address,
      o.city,
      o.source,
      o.total,
      STATUS_OPTIONS.find(s => s.value === o.status)?.label || o.status,
      o.externalCarrier || '',
      o.trackingNumber || '',
      new Date(o.createdAt).toLocaleString('es-CO'),
      o.items.map(item => `${item.qty}x ${item.name}`).join(' | '),
    ])

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map(row =>
          row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `Pedidos_${storeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Listado de pedidos exportado en CSV')
  }

  return {
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
  }
}
