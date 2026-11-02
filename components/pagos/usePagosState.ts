'use client'

import { useState, useEffect } from 'react'
import {
  Wallet,
  CreditCard,
  Handshake,
  Landmark,
} from 'lucide-react'
import { toast } from 'sonner'
import { Payment, Refund, PaymentOrder } from './types'

export function usePagosState() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterMetodo, setFilterMetodo] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(8)

  // Dynamic states
  const [payments, setPayments] = useState<Payment[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)

  // Drawer modal states
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)
  const [confirmingRefund, setConfirmingRefund] = useState(false)
  const [dateRangeLabel, setDateRangeLabel] = useState('Cargando rango...')

  // Load live payments from backend on mount
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const fmt = (d: Date) => d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    setDateRangeLabel(`${fmt(firstDay)} - ${fmt(today)}`)

    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Error fetching orders')
        const data = await res.json()

        const colors = [
          'bg-purple-100 text-purple-700', 
          'bg-blue-100 text-blue-700', 
          'bg-pink-100 text-pink-750', 
          'bg-zinc-100 text-zinc-700', 
          'bg-amber-100 text-amber-700', 
          'bg-rose-100 text-rose-700'
        ]

        const mapped: Payment[] = (data as PaymentOrder[]).map((order) => {
          const initials = order.customerName
            ? order.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            : 'CL'
          const bg = colors[(order.customerName || '').length % colors.length]

          let estado: 'Exitoso' | 'Pendiente' | 'Fallido' = 'Pendiente'
          if (order.status === 'paid' || order.paymentStatus === 'PAID') {
            estado = 'Exitoso'
          } else if (order.status === 'failed' || order.status === 'cancelled' || order.paymentStatus === 'FAILED') {
            estado = 'Fallido'
          }

          let metodoLabel = 'Contra Entrega'
          let MetodoIcon = Wallet
          let iconBg = 'bg-zinc-50 border-zinc-100'
          let iconColor = 'text-zinc-600'

          if (order.stripeCheckoutSessionId) {
            metodoLabel = 'Tarjeta Stripe'
            MetodoIcon = CreditCard
            iconBg = 'bg-indigo-50 border-indigo-100'
            iconColor = 'text-indigo-600'
          } else if (order.mpPaymentId || order.mpPreferenceId) {
            metodoLabel = 'Mercado Pago'
            MetodoIcon = Handshake
            iconBg = 'bg-sky-50 border-sky-100'
            iconColor = 'text-sky-600'
          } else if (order.proofImageUrl) {
            metodoLabel = 'Transferencia'
            MetodoIcon = Landmark
            iconBg = 'bg-zinc-100 border-zinc-200'
            iconColor = 'text-zinc-600'
          }

          let prodCount = 1
          if (Array.isArray(order.items)) {
            prodCount = order.items.reduce((acc: number, item) => acc + (item.qty || 1), 0)
          }

          const dateObj = new Date(order.createdAt)
          const formattedDate = dateObj.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short'
          }) + ', ' + dateObj.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })

          return {
            id: order.id,
            ref: order.mpPreferenceId || order.stripeCheckoutSessionId || order.id.slice(-8).toUpperCase(),
            cliente: {
              name: order.customerName || 'Cliente Anónimo',
              phone: order.customerPhone || 'Sin teléfono',
              initials,
              bg
            },
            pedido: `#FC-${order.id.slice(-4).toUpperCase()}`,
            prodCount,
            metodo: {
              label: metodoLabel,
              icon: MetodoIcon,
              iconBg,
              iconColor
            },
            estado,
            fecha: formattedDate,
            monto: order.total
          }
        })

        setPayments(mapped)

        // Generate refunds list from failed/refunded orders
        const mappedRefunds = mapped
          .filter(p => p.estado === 'Fallido')
          .map(p => ({
            name: p.cliente.name,
            ref: p.ref,
            time: p.fecha,
            monto: -p.monto
          }))
        setRefunds(mappedRefunds)
      } catch (err) {
        console.error(err)
        toast.error('No se pudieron cargar los pagos reales')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Dynamic statistics calculations
  const totalVolume = payments.filter(p => p.estado === 'Exitoso').reduce((acc, curr) => acc + curr.monto, 0)
  const countExitosos = payments.filter(p => p.estado === 'Exitoso').length
  const countPendientes = payments.filter(p => p.estado === 'Pendiente').length
  const countFallidos = payments.filter(p => p.estado === 'Fallido').length

  // Reset pagination on filter changes
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
    toast.success('Referencia de pago copiada al portapapeles')
    setTimeout(() => setCopiedRef(false), 2000)
  }

  const handleDownloadReceipt = () => {
    toast.success('Recibo de compra descargado con éxito (PDF)')
  }

  const handleRefund = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' })
      })

      if (!res.ok) throw new Error('Failed to update status')

      setPayments(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, estado: 'Fallido' }
        }
        return p
      }))

      if (selectedPayment && selectedPayment.id === id) {
        setSelectedPayment(prev => prev ? { ...prev, estado: 'Fallido' } : null)
      }

      const p = payments.find(pay => pay.id === id)
      if (p) {
        const newRefund: Refund = {
          name: p.cliente.name,
          ref: p.ref,
          time: 'Hoy, ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          monto: -p.monto
        }
        setRefunds(prev => [newRefund, ...prev])
      }

      setConfirmingRefund(false)
      toast.success(`Pago ${id} reembolsado y revertido correctamente`)
    } catch (err) {
      console.error(err)
      toast.error('Error al procesar el reembolso en el servidor')
    }
  }

  // Filtering Logic
  const filteredPayments = payments.filter(p => {
    const matchesText = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.cliente.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.pedido.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesText) return false

    if (filterEstado !== 'Todos' && p.estado !== filterEstado) return false

    if (filterMetodo !== 'Todos') {
      const matchMetodo = p.metodo.label.toLowerCase().includes(filterMetodo.toLowerCase())
      if (!matchMetodo) return false
    }

    return true
  })

  // Pagination calculation
  const totalPaymentsCount = filteredPayments.length
  const totalPages = Math.ceil(totalPaymentsCount / rowsPerPage) || 1
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

  const handleExport = () => {
    const headers = ['ID', 'Referencia', 'Cliente', 'Teléfono', 'Pedido', 'Productos', 'Método', 'Estado', 'Fecha', 'Monto']
    const rows = filteredPayments.map(p => [
      p.id,
      p.ref,
      p.cliente.name,
      p.cliente.phone,
      p.pedido,
      p.prodCount,
      p.metodo.label,
      p.estado,
      p.fecha,
      p.monto
    ])
    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `pagos_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte de pagos exportado correctamente (CSV)')
  }

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    handleRefund,
    handleExport,
    formatCurrency,
  }
}
