'use client'

import { useState, useEffect } from 'react'
import {
  Wallet,
  CreditCard,
  Handshake,
  Landmark,
} from 'lucide-react'
import { toast } from 'sonner'
import { Payment, Refund, PaymentOrder, PaymentStatusLabel } from './types'

const PAID_STATUSES = new Set([
  'paid',
  'confirmed',
  'CONFIRMED',
  'shipped_external',
  'in_transit',
  'delivered',
])

export function usePagosState() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterMetodo, setFilterMetodo] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [payments, setPayments] = useState<Payment[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)
  const [confirmingRefund, setConfirmingRefund] = useState(false)
  const [dateRangeLabel, setDateRangeLabel] = useState('')

  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const fmt = (d: Date) =>
      d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    setDateRangeLabel(`${fmt(firstDay)} – ${fmt(today)}`)

    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Error fetching orders')
        const data = await res.json()

        const mapped: Payment[] = (data as PaymentOrder[]).map(order => {
          const cleanName = order.customerName?.trim() || 'Cliente'
          const initials = cleanName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'CL'

          let estado: PaymentStatusLabel = 'Pendiente'
          if (
            order.paymentStatus === 'PAID' ||
            order.paymentStatus === 'CONFIRMED' ||
            PAID_STATUSES.has(order.status)
          ) {
            estado = 'Exitoso'
          } else if (order.paymentStatus === 'UPLOADED' || Boolean(order.proofImageUrl)) {
            estado = 'Por Validar'
          } else if (
            order.status === 'failed' ||
            order.status === 'cancelled' ||
            order.paymentStatus === 'FAILED' ||
            order.paymentStatus === 'REJECTED'
          ) {
            estado = 'Fallido'
          }

          let metodoLabel: Payment['metodo']['label'] = 'Contra Entrega'
          let MetodoIcon = Wallet

          if (order.stripeCheckoutSessionId) {
            metodoLabel = 'Tarjeta Stripe'
            MetodoIcon = CreditCard
          } else if (order.mpPaymentId || order.mpPreferenceId) {
            metodoLabel = 'Mercado Pago'
            MetodoIcon = Handshake
          } else if (order.proofImageUrl || order.paymentStatus === 'UPLOADED') {
            metodoLabel = 'Transferencia / Bre-B'
            MetodoIcon = Landmark
          }

          let prodCount = 1
          let itemsSummary = 'Pedido en tienda'
          if (Array.isArray(order.items) && order.items.length > 0) {
            prodCount = order.items.reduce(
              (acc: number, item) => acc + (Number(item.qty ?? item.quantity ?? 1) || 1),
              0
            )
            const parts = order.items
              .map(it => {
                const nm = it.name || it.title || ''
                const q = Number(it.qty ?? it.quantity ?? 1) || 1
                return nm ? `${q}x ${nm}` : ''
              })
              .filter(Boolean)
            if (parts.length > 0) itemsSummary = parts.join(', ')
          }

          const dateObj = new Date(order.createdAt)
          const formattedDate =
            dateObj.toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
            }) +
            ' · ' +
            dateObj.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
            })

          const gatewayId =
            order.mpPaymentId ||
            order.stripeCheckoutSessionId ||
            order.mpPreferenceId ||
            null

          return {
            id: order.id,
            ref: gatewayId || `ORD-${order.id.slice(-6).toUpperCase()}`,
            gatewayId,
            proofImageUrl: order.proofImageUrl || null,
            source:
              order.source === 'WHATSAPP' || order.source === 'WHATSAPP_WEBVIEW'
                ? 'WhatsApp IA'
                : 'Tienda Web',
            itemsSummary,
            cliente: {
              name: cleanName,
              phone: (order.customerPhone || order.customerWhatsAppId || '').replace(/\D/g, ''),
              initials,
            },
            pedido: `#${order.id.slice(-6).toUpperCase()}`,
            prodCount,
            metodo: {
              label: metodoLabel,
              icon: MetodoIcon,
            },
            estado,
            fecha: formattedDate,
            monto: order.total,
          }
        })

        setPayments(mapped)
        if (mapped.length > 0) {
          setSelectedPayment(mapped[0])
        }

        const mappedRefunds = mapped
          .filter(p => p.estado === 'Fallido')
          .map(p => ({
            name: p.cliente.name,
            ref: p.ref,
            time: p.fecha,
            monto: -p.monto,
          }))
        setRefunds(mappedRefunds)
      } catch (err) {
        console.error(err)
        toast.error('No se pudieron cargar las transacciones')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Dynamic statistics calculations (100% real)
  const totalVolume = payments
    .filter(p => p.estado === 'Exitoso')
    .reduce((acc, curr) => acc + curr.monto, 0)
  const volumePorValidar = payments
    .filter(p => p.estado === 'Por Validar')
    .reduce((acc, curr) => acc + curr.monto, 0)
  const volumePendiente = payments
    .filter(p => p.estado === 'Pendiente')
    .reduce((acc, curr) => acc + curr.monto, 0)

  const countExitosos = payments.filter(p => p.estado === 'Exitoso').length
  const countPorValidar = payments.filter(p => p.estado === 'Por Validar').length
  const countPendientes = payments.filter(p => p.estado === 'Pendiente').length
  const countFallidos = payments.filter(p => p.estado === 'Fallido').length

  const avgPayment = countExitosos > 0 ? Math.round(totalVolume / countExitosos) : 0
  const approvalRate =
    payments.length > 0 ? Math.round((countExitosos / payments.length) * 100) : 0

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleEstadoChange = (val: string) => {
    setFilterEstado(val)
    setCurrentPage(1)
  }

  const handleMetodoChange = (val: string) => {
    setFilterMetodo(val)
    setCurrentPage(1)
  }

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref)
    setCopiedRef(true)
    toast.success('Referencia copiada al portapapeles')
    setTimeout(() => setCopiedRef(false), 2000)
  }

  const handleDownloadReceipt = (paymentId?: string) => {
    const targetId = paymentId || selectedPayment?.id
    if (!targetId) return
    window.open(`/api/orders/invoice/${targetId}`, '_blank', 'noopener,noreferrer')
  }

  const handleApprovePayment = async (id: string) => {
    setUpdatingStatusId(id)
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (!res.ok) throw new Error('Error al confirmar el pago')

      setPayments(prev =>
        prev.map(p => (p.id === id ? { ...p, estado: 'Exitoso' } : p))
      )
      setSelectedPayment(prev =>
        prev && prev.id === id ? { ...prev, estado: 'Exitoso' } : prev
      )
      toast.success('Pago aprobado y pedido confirmado')
    } catch (err) {
      console.error(err)
      toast.error('No se pudo aprobar el pago')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleRefund = async (id: string) => {
    setUpdatingStatusId(id)
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setPayments(prev =>
        prev.map(p => (p.id === id ? { ...p, estado: 'Fallido' } : p))
      )

      if (selectedPayment && selectedPayment.id === id) {
        setSelectedPayment(prev => (prev ? { ...prev, estado: 'Fallido' } : null))
      }

      setConfirmingRefund(false)
      toast.success('Transacción anulada / marcada como fallida')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el estado del pago')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // Filtering Logic
  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchesText =
      p.id.toLowerCase().includes(q) ||
      p.ref.toLowerCase().includes(q) ||
      p.cliente.name.toLowerCase().includes(q) ||
      p.cliente.phone.includes(q) ||
      p.pedido.toLowerCase().includes(q) ||
      p.itemsSummary.toLowerCase().includes(q)
    if (!matchesText) return false

    if (filterEstado !== 'Todos' && p.estado !== filterEstado) return false

    if (filterMetodo !== 'Todos') {
      const matchMetodo = p.metodo.label.toLowerCase().includes(filterMetodo.toLowerCase())
      if (!matchMetodo) return false
    }

    return true
  })

  const totalPaymentsCount = filteredPayments.length
  const totalPages = Math.ceil(totalPaymentsCount / rowsPerPage) || 1
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

  const handleExport = () => {
    const headers = [
      'ID Orden',
      'Referencia',
      'Cliente',
      'WhatsApp',
      'Pedido',
      'Detalle',
      'Canal',
      'Método de Pago',
      'Estado',
      'Fecha',
      'Monto (COP)',
    ]
    const rows = filteredPayments.map(p => [
      p.id,
      p.ref,
      p.cliente.name,
      p.cliente.phone ? `+${p.cliente.phone}` : '',
      p.pedido,
      p.itemsSummary,
      p.source,
      p.metodo.label,
      p.estado,
      p.fecha,
      p.monto,
    ])
    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Pagos_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte de tesorería exportado en CSV')
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return {
    searchQuery,
    setSearchQuery,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    payments,
    refunds,
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
    filteredPayments,
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
  }
}
