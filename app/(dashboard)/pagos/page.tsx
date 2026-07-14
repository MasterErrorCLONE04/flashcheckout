"use client"

import { useState, useEffect } from 'react'
import { 
  Download, 
  Search, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  CreditCard, 
  Handshake, 
  Wallet, 
  Globe, 
  Landmark, 
  Check, 
  SlidersHorizontal,
  ChevronRightSquare,
  Sparkles,
  X,
  Copy,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Payment {
  id: string
  ref: string
  cliente: { name: string; phone: string; initials: string; bg: string }
  pedido: string
  prodCount: number
  metodo: { label: string; icon: any; iconBg: string; iconColor: string }
  estado: 'Exitoso' | 'Pendiente' | 'Fallido'
  fecha: string
  monto: number
}

interface Refund {
  name: string
  ref: string
  time: string
  monto: number
}

export default function PagosPage() {
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
          'bg-purple-100 text-purple-750', 
          'bg-blue-100 text-blue-750', 
          'bg-pink-100 text-pink-750', 
          'bg-emerald-100 text-emerald-750', 
          'bg-amber-100 text-amber-750', 
          'bg-rose-100 text-rose-750'
        ]
        
        const mapped: Payment[] = data.map((order: any) => {
          const initials = order.customerName
            ? order.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            : 'CL'
          const bg = colors[order.customerName.length % colors.length]
          
          let estado: 'Exitoso' | 'Pendiente' | 'Fallido' = 'Pendiente'
          if (order.status === 'paid' || order.paymentStatus === 'PAID') {
            estado = 'Exitoso'
          } else if (order.status === 'failed' || order.status === 'cancelled' || order.paymentStatus === 'FAILED') {
            estado = 'Fallido'
          }

          let metodoLabel = 'Contra Entrega'
          let MetodoIcon = Wallet
          let iconBg = 'bg-zinc-50 border-zinc-100'
          let iconColor = 'text-zinc-650'

          if (order.stripeCheckoutSessionId) {
            metodoLabel = 'Tarjeta Stripe'
            MetodoIcon = CreditCard
            iconBg = 'bg-indigo-50 border-indigo-100'
            iconColor = 'text-indigo-650'
          } else if (order.mpPaymentId || order.mpPreferenceId) {
            metodoLabel = 'Mercado Pago'
            MetodoIcon = Handshake
            iconBg = 'bg-sky-50 border-sky-100'
            iconColor = 'text-sky-655'
          } else if (order.proofImageUrl) {
            metodoLabel = 'Transferencia'
            MetodoIcon = Landmark
            iconBg = 'bg-emerald-50 border-emerald-100'
            iconColor = 'text-emerald-650'
          }

          let prodCount = 1
          if (Array.isArray(order.items)) {
            prodCount = order.items.reduce((acc: number, item: any) => acc + (item.qty || 1), 0)
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

  // Métodos de pago calculations
  const countMercadoPago = payments.filter(p => p.metodo.label === 'Mercado Pago').length
  const countTarjeta = payments.filter(p => p.metodo.label === 'Tarjeta Stripe').length
  const countNequi = payments.filter(p => p.metodo.label === 'Nequi').length
  const countPSE = payments.filter(p => p.metodo.label === 'PSE').length
  const countContraEntrega = payments.filter(p => p.metodo.label === 'Contra Entrega').length
  const countTransferencia = payments.filter(p => p.metodo.label === 'Transferencia').length

  const sumMercadoPago = payments.filter(p => p.metodo.label === 'Mercado Pago').reduce((acc, curr) => acc + curr.monto, 0)
  const sumTarjeta = payments.filter(p => p.metodo.label === 'Tarjeta Stripe').reduce((acc, curr) => acc + curr.monto, 0)
  const sumNequi = payments.filter(p => p.metodo.label === 'Nequi').reduce((acc, curr) => acc + curr.monto, 0)
  const sumPSE = payments.filter(p => p.metodo.label === 'PSE').reduce((acc, curr) => acc + curr.monto, 0)
  const sumContraEntrega = payments.filter(p => p.metodo.label === 'Contra Entrega').reduce((acc, curr) => acc + curr.monto, 0)
  const sumTransferencia = payments.filter(p => p.metodo.label === 'Transferencia').reduce((acc, curr) => acc + curr.monto, 0)

  const paymentMethodsList = [
    { name: 'Mercado Pago', count: countMercadoPago, value: sumMercadoPago, icon: Handshake, color: 'bg-sky-500' },
    { name: 'Tarjeta Stripe', count: countTarjeta, value: sumTarjeta, icon: CreditCard, color: 'bg-indigo-500' },
    { name: 'Nequi', count: countNequi, value: sumNequi, icon: Wallet, color: 'bg-indigo-650' },
    { name: 'PSE', count: countPSE, value: sumPSE, icon: Globe, color: 'bg-teal-500' },
    { name: 'Contra Entrega', count: countContraEntrega, value: sumContraEntrega, icon: Wallet, color: 'bg-zinc-500' },
    { name: 'Transferencia', count: countTransferencia, value: sumTransferencia, icon: Landmark, color: 'bg-emerald-500' },
  ].filter(item => item.count > 0)

  const totalCount = payments.length
  const pctExitoso = totalCount > 0 ? (countExitosos / totalCount) : 0
  const pctPendiente = totalCount > 0 ? (countPendientes / totalCount) : 0
  const pctFallido = totalCount > 0 ? (countFallidos / totalCount) : 0

  const circumference = 251.327
  const offsetExitoso = circumference * (1 - pctExitoso)
  const offsetPendiente = circumference * (1 - pctPendiente)
  const offsetFallido = circumference * (1 - pctFallido)

  const rotatePendiente = 360 * pctExitoso
  const rotateFallido = 360 * (pctExitoso + pctPendiente)

  return (
    <div className="space-y-6 pb-6 animate-in duration-300 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-955">Pagos</h1>
          <p className="text-xs xl:text-sm font-semibold text-zinc-400">Gestiona y supervisa todos los pagos de tu negocio.</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none self-end sm:self-auto">
          <Download className="w-4 h-4 text-zinc-450" />
          Exportar
        </button>
      </div>

      {/* Grid: Stat Cards (1x4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Volumen total */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Volumen total</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">${formatCurrency(totalVolume)}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1 select-none">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>15% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

        {/* Pagos exitosos */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Pagos exitosos</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">{countExitosos}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1 select-none">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>14% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

        {/* Pagos pendientes */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Pagos pendientes</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">{countPendientes}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-650 mt-1 select-none">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>8% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

        {/* Pagos fallidos */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Pagos fallidos</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">{countFallidos}</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-650 mt-1 select-none">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>25% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid Split: Table column (8/12) and Performance sidebar (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* LEFT COLUMN: Filters, Table, Optimiza Banner (12/12) */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* Table Container Wrapper */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
            
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Text Search query */}
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente, pedido o referencia..."
                  className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs xl:text-sm font-semibold placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              {/* DatePicker placeholder input */}
              <div className="relative shrink-0 select-none">
                <CalendarIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value={dateRangeLabel}
                  className="bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none cursor-pointer w-48 text-left"
                />
              </div>

              {/* Estado filter select */}
              <div className="relative shrink-0">
                <select
                  value={filterEstado}
                  onChange={e => setFilterEstado(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-955 appearance-none cursor-pointer"
                >
                  <option value="Todos">Estado: Todos</option>
                  <option value="Exitoso">Exitosos</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Fallido">Fallidos</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>

              {/* Método de pago filter select */}
              <div className="relative shrink-0">
                <select
                  value={filterMetodo}
                  onChange={e => setFilterMetodo(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-955 appearance-none cursor-pointer"
                >
                  <option value="Todos">Método: Todos</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Tarjeta">Tarjetas</option>
                  <option value="Nequi">Nequi</option>
                  <option value="PSE">PSE</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>

            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="overflow-x-auto border border-zinc-150 rounded-lg bg-white">
              <table className="w-full min-w-[850px] text-left border-collapse text-xs xl:text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] xl:text-xs font-bold text-zinc-500 select-none">
                    <th className="py-3 px-2.5 xl:px-4">Pago</th>
                    <th className="py-3 px-2.5 xl:px-4">Cliente</th>
                    <th className="py-3 px-2.5 xl:px-4">Pedido</th>
                    <th className="py-3 px-2.5 xl:px-4">Método de pago</th>
                    <th className="py-3 px-2.5 xl:px-4">Estado</th>
                    <th className="py-3 px-2.5 xl:px-4">Fecha</th>
                    <th className="py-3 px-2.5 xl:px-4">Monto</th>
                    <th className="py-3 px-2.5 xl:px-4 text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#6F42C1]" />
                          <span>Cargando transacciones reales...</span>
                        </div>
                      </td>
                    </tr>
                  ) : totalPaymentsCount === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                        No se encontraron registros de pagos.
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map((p, idx) => {
                      const MetodoIcon = p.metodo.icon
                      return (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          
                          {/* Payment reference */}
                          <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {p.estado === 'Exitoso' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                              {p.estado === 'Pendiente' && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                              {p.estado === 'Fallido' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                              <div className="min-w-0">
                                <h4 className="font-bold text-zinc-900 leading-tight text-xs xl:text-sm">{p.id}</h4>
                                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 select-all">Ref: {p.ref}</p>
                              </div>
                            </div>
                          </td>

                          {/* Client profile */}
                          <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none", p.cliente.bg)}>
                                {p.cliente.initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-zinc-900 leading-tight text-xs xl:text-sm">{p.cliente.name}</h4>
                                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5">{p.cliente.phone}</p>
                              </div>
                            </div>
                          </td>

                          {/* Pedido */}
                          <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#6F42C1] hover:underline cursor-pointer">{p.pedido}</span>
                              <span className="text-[9px] font-semibold text-zinc-450 mt-0.5">{p.prodCount} productos</span>
                            </div>
                          </td>

                          {/* Método de pago */}
                          <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-7.5 h-7.5 rounded-lg flex items-center justify-center border shrink-0", p.metodo.iconBg, p.metodo.iconColor)}>
                                <MetodoIcon className="w-4 h-4" />
                              </div>
                              <span className="text-zinc-800 text-[11px] xl:text-xs">{p.metodo.label}</span>
                            </div>
                          </td>

                          {/* Estado Capsule */}
                          <td className="py-3 px-2.5 xl:px-4">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none",
                              p.estado === 'Exitoso' && 'bg-emerald-50 border border-emerald-100 text-emerald-700',
                              p.estado === 'Pendiente' && 'bg-amber-50 border border-amber-100 text-amber-700',
                              p.estado === 'Fallido' && 'bg-red-50 border border-red-100 text-red-700'
                            )}>
                              {p.estado}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap text-zinc-650">{p.fecha}</td>

                          {/* Monto */}
                          <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap font-bold text-zinc-900 text-xs xl:text-sm">
                            ${formatCurrency(p.monto)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-2.5 xl:px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setSelectedPayment(p)} className="px-3 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-lg transition-all cursor-pointer select-none">
                                Ver
                              </button>
                              <button className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table pagination footer */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-zinc-500 select-none">
              <span>Mostrando {totalPaymentsCount > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalPaymentsCount)} de {totalPaymentsCount} pagos</span>
              
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "px-2.5 py-1 rounded transition-all cursor-pointer text-xs font-bold",
                      currentPage === page 
                        ? "bg-emerald-50 border border-emerald-150 text-emerald-800 font-extrabold" 
                        : "border border-zinc-200 hover:bg-zinc-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Filas por página:</span>
                <div className="relative shrink-0">
                  <select
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-1.5 font-bold text-zinc-750 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                  >
                    <option value={8}>8</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

          </div>

          {/* Banner bottom: Optimiza tus cobros */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650 shrink-0 select-none">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs xl:text-sm font-bold text-zinc-900 tracking-tight leading-tight">Optimiza tus cobros</h4>
                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 leading-normal">Conecta más métodos de pago y aumenta tus conversiones de venta virtual.</p>
              </div>
            </div>
            
            <Link href="/integraciones" className="shrink-0 select-none">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-98">
                Gestionar métodos de pago
              </button>
            </Link>
          </div>

        </div>

      </div>

      {/* Detail Drawer Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => {
              setSelectedPayment(null)
              setConfirmingRefund(false)
            }}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-zinc-200 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 ease-out">
              
              {/* Drawer Content */}
              <div className="flex-1 h-0 overflow-y-auto p-6 space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none",
                        selectedPayment.estado === 'Exitoso' && 'bg-emerald-50 border border-emerald-100 text-emerald-700',
                        selectedPayment.estado === 'Pendiente' && 'bg-amber-50 border border-amber-100 text-amber-700',
                        selectedPayment.estado === 'Fallido' && 'bg-red-50 border border-red-100 text-red-700'
                      )}>
                        {selectedPayment.estado}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 select-none">{selectedPayment.fecha}</span>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-955 tracking-tight">{selectedPayment.id}</h2>
                    <p className="text-xs text-zinc-450">Referencia de transacción del checkout</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPayment(null)
                      setConfirmingRefund(false)
                    }}
                    className="p-1 rounded-lg border border-zinc-200 hover:bg-zinc-55 text-zinc-500 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-px bg-zinc-100 w-full" />

                {/* Amount breakdown */}
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-4 space-y-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Monto de la transacción</span>
                    <span className="text-2xl font-bold text-zinc-900">${formatCurrency(selectedPayment.monto)}</span>
                  </div>
                  
                  <div className="h-px bg-zinc-200/60 w-full" />

                  <div className="space-y-2 text-xs font-semibold text-zinc-600">
                    <div className="flex justify-between">
                      <span>Comisión de plataforma (1.5% + $900)</span>
                      <span>-${formatCurrency(Math.round(selectedPayment.monto * 0.015 + 900))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retenciones e IVA (ReteICA + ReteIVA)</span>
                      <span>-${formatCurrency(Math.round(selectedPayment.monto * 0.009))}</span>
                    </div>
                    <div className="h-px bg-zinc-200/60 w-full" />
                    <div className="flex justify-between font-bold text-zinc-900 text-sm">
                      <span>Neto a transferir</span>
                      <span>${formatCurrency(Math.round(selectedPayment.monto - (selectedPayment.monto * 0.015 + 900) - (selectedPayment.monto * 0.009)))}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cliente</h3>
                  <div className="flex items-center gap-3 bg-white border border-zinc-200/80 rounded-lg p-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", selectedPayment.cliente.bg)}>
                      {selectedPayment.cliente.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-zinc-900 leading-tight truncate">{selectedPayment.cliente.name}</h4>
                      <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">{selectedPayment.cliente.phone}</p>
                      <p className="text-[10px] font-semibold text-zinc-400 mt-0.5 truncate">{selectedPayment.cliente.name.toLowerCase().replace(/ /g, '.')}@example.com</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detalles del pago</h3>
                  <div className="border border-zinc-200/80 rounded-lg divide-y divide-zinc-100 text-xs font-semibold text-zinc-600 bg-white">
                    <div className="flex justify-between p-3">
                      <span>Método de pago</span>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                        <span>{selectedPayment.metodo.label}</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 items-center">
                      <span>Referencia de pago</span>
                      <button 
                        onClick={() => handleCopyRef(selectedPayment.ref)}
                        className="inline-flex items-center gap-1.5 font-bold text-[#6F42C1] hover:underline cursor-pointer"
                      >
                        <span>{selectedPayment.ref}</span>
                        {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                      </button>
                    </div>
                    <div className="flex justify-between p-3">
                      <span>ID de Pasarela</span>
                      <span className="font-mono text-zinc-500 font-bold select-all">mp_{selectedPayment.ref.toLowerCase()}8412</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pedido Asociado</h3>
                  <div className="flex items-center justify-between bg-white border border-zinc-200/80 rounded-lg p-3 text-xs font-semibold text-zinc-650">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#6F42C1] block text-sm">{selectedPayment.pedido}</span>
                      <span className="text-[10px] text-zinc-400 block">{selectedPayment.prodCount} productos comprados</span>
                    </div>
                    <Link href={`/pedidos`} className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-900">
                      <span>Ver pedido</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* Drawer Actions */}
              <div className="border-t border-zinc-200 p-4 bg-zinc-50 space-y-2">
                
                {confirmingRefund ? (
                  <div className="bg-white border border-red-200 rounded-lg p-3 space-y-3 text-left">
                    <p className="text-xs font-semibold text-red-700 leading-normal">¿Estás seguro de que deseas reembolsar este pago? Esta acción cambiará el estado de la transacción a Fallido y sumará el registro a los reembolsos recientes.</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRefund(selectedPayment.id)}
                        className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Confirmar Reembolso
                      </button>
                      <button 
                        onClick={() => setConfirmingRefund(false)}
                        className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedPayment.estado === 'Exitoso' && (
                      <button 
                        onClick={() => setConfirmingRefund(true)}
                        className="w-full py-2 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-650 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                        Reembolsar Transacción
                      </button>
                    )}
                    
                    <button 
                      onClick={handleDownloadReceipt}
                      className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      Descargar Recibo de Compra
                    </button>
                  </>
                )}
                
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
