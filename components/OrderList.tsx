'use client'

import { useState } from 'react'
import {
  ShoppingBag,
  MapPin,
  User,
  Package,
  MessageCircle,
  Zap,
  Download,
  Search,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderItem = {
  name: string
  qty: number
  price: number
}

type Order = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  deliveryRequested: boolean
  source: string
  driverId: string | null
  driver: {
    id: string
    name: string
    phoneNumber: string
    active: boolean
    available: boolean
    rating: number
    ordersDelivered: number
  } | null
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Nuevo', color: 'text-amber-600 bg-amber-50/50 border-amber-200/50' },
  { value: 'confirmed', label: 'Confirmado', color: 'text-blue-600 bg-blue-50/50 border-blue-200/50' },
  { value: 'shipped', label: 'En camino', color: 'text-indigo-600 bg-indigo-50/50 border-indigo-200/50' },
  { value: 'delivered', label: 'Entregado', color: 'text-emerald-600 bg-emerald-50/50 border-emerald-200/50' },
  { value: 'cancelled', label: 'Cancelado', color: 'text-rose-600 bg-rose-50/50 border-rose-200/50' },
]

export default function OrderList({
  initialOrders,
  storeName,
}: {
  initialOrders: Order[]
  storeName: string
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrders.length > 0 ? initialOrders[0].id : null
  )

  // 1. Métricas de KPI Cards
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const shippedCount = orders.filter(o => o.status === 'shipped').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  // 2. Filtro y Búsqueda de Órdenes
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
    // Optimistic Update
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
    // Optimistic Update
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
      'Teléfono',
      'Dirección',
      'Ciudad',
      'Total',
      'Estado',
      'Fecha Creación',
      'Artículos'
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
      o.items.map(item => `${item.qty}x ${item.name}`).join(' | ')
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

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[55vh] w-full animate-in fade-in duration-300">
        <div className="text-center py-20 px-8 premium-card rounded-lg border-dashed border-zinc-200 bg-white/50 max-w-md w-full shadow-none">
          <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-zinc-350" />
          </div>
          <h3 className="text-base font-bold text-zinc-950 tracking-tight font-display">Sin pedidos</h3>
          <p className="text-zinc-400 text-[10px] font-bold tracking-wider mt-2.5 leading-relaxed uppercase">
            Tus pedidos aparecerán aquí automáticamente en tiempo real
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in duration-300">
      {/* 1. Bento KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total Revenue */}
        <div className="premium-card p-5 bg-white border-gray-200 flex items-center justify-between group hover:border-zinc-300 transition-colors">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Ventas Netas</p>
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight tabular-nums">${totalRevenue.toLocaleString('es-CO')}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200/85 text-zinc-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card: Pending */}
        <div className="premium-card p-5 bg-white border-gray-200 flex items-center justify-between group hover:border-zinc-300 transition-colors">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Pedidos Nuevos</p>
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight tabular-nums">{pendingCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200/85 text-zinc-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card: Shipped */}
        <div className="premium-card p-5 bg-white border-gray-200 flex items-center justify-between group hover:border-zinc-300 transition-colors">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">En Reparto</p>
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight tabular-nums">{shippedCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200/85 text-zinc-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card: Delivered */}
        <div className="premium-card p-5 bg-white border-gray-200 flex items-center justify-between group hover:border-zinc-300 transition-colors">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Entregados</p>
            <h3 className="text-2xl font-bold text-zinc-950 tracking-tight tabular-nums">{deliveredCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-200/85 text-zinc-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Split-Pane Layout (Navegador + Ficha de Detalle) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation & Search (Left Column - Spans 4/12) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="premium-card p-5 bg-white border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Listado de Ventas</h4>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 bg-white hover:bg-zinc-50/50 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Exportar
              </button>
            </div>

            {/* Live Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, ciudad o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950/20 transition-all"
              />
            </div>

            {/* Filters grid */}
            <div className="flex flex-wrap gap-1.5">
              <FilterTab
                label="Todos"
                value="all"
                active={filter === 'all'}
                count={orders.length}
                onClick={() => setFilter('all')}
              />
              {STATUS_OPTIONS.map(s => {
                const count = orders.filter(o => o.status === s.value).length
                if (count === 0 && filter !== s.value) return null
                return (
                  <FilterTab
                    key={s.value}
                    label={s.label}
                    value={s.value}
                    active={filter === s.value}
                    count={count}
                    onClick={() => setFilter(s.value)}
                  />
                )
              })}
            </div>
          </div>

          {/* Cards List container with self scroll */}
          <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1 custom-scrollbar">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-lg">
                <ShoppingBag className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Sin coincidencias</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = order.id === selectedOrderId
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={cn(
                      "w-full text-left p-4.5 rounded-lg border transition-all flex flex-col gap-3 group relative overflow-hidden",
                      isSelected 
                        ? "bg-zinc-950 border-zinc-950 text-white shadow-md shadow-black/5"
                        : "bg-white border-gray-200 text-zinc-950 hover:border-gray-300 hover:bg-zinc-50/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={cn(
                        "text-[14px] font-bold truncate leading-none tracking-tight",
                        isSelected ? "text-white" : "text-zinc-950"
                      )}>
                        {order.customerName}
                      </span>
                      <span className="text-xs font-extrabold tabular-nums leading-none shrink-0 tracking-tight">
                        ${order.total.toLocaleString('es-CO')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <span 
                        suppressHydrationWarning
                        className={cn(
                          "text-[10px] font-medium tracking-tight",
                          isSelected ? "text-zinc-400" : "text-zinc-400"
                        )}
                      >
                        {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <StatusBadge status={order.status} isSelected={isSelected} />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Detailed Pane (Right Column - Spans 8/12) */}
        <div className="lg:col-span-7 xl:col-span-8">
          {activeOrder ? (
            <div className="premium-card bg-white border-gray-200 overflow-hidden divide-y divide-gray-100 animate-fade-in">
              {/* Header section */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
                      Pedido #{activeOrder.id.slice(-6).toUpperCase()}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-gray-200 text-[9px] font-extrabold text-zinc-400 tracking-wider uppercase">
                      {activeOrder.source || 'WEB'}
                    </span>
                  </div>
                  <p suppressHydrationWarning className="text-xs font-semibold text-zinc-400 mt-1">
                    Registrado el {new Date(activeOrder.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cambiar Estado:</span>
                  <select
                    value={activeOrder.status}
                    onChange={(e) => updateStatus(activeOrder.id, e.target.value)}
                    className="bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-bold px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-950/20 text-zinc-800 cursor-pointer transition-colors"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client & Shipping info */}
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Client info block */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Información del Cliente</h5>
                  </div>
                  <div className="p-4 bg-zinc-50/50 border border-gray-200/60 rounded-lg space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre Completo</p>
                      <p className="text-sm font-bold text-zinc-950 mt-0.5">{activeOrder.customerName}</p>
                    </div>
                    {activeOrder.customerPhone && (
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Teléfono WhatsApp</p>
                        <p className="text-sm font-semibold text-zinc-800 mt-0.5">{activeOrder.customerPhone}</p>
                      </div>
                    )}
                  </div>
                  
                  {activeOrder.customerPhone && (
                    <a
                      href={`https://wa.me/${activeOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `¡Hola ${activeOrder.customerName}! Confirmamos tu pedido en ${storeName}, saldrá pronto a reparto.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba56] text-white rounded-lg font-bold text-xs tracking-wider uppercase h-11 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      Chat de WhatsApp
                    </a>
                  )}
                </div>

                {/* Shipping & Simulated Map */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Ubicación de Entrega</h5>
                  </div>
                  
                  {/* Premium CSS-simulated Map Widget */}
                  <div className="relative w-full h-56 rounded-lg border border-gray-200 overflow-hidden bg-zinc-50 shadow-inner">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(activeOrder.address + ', ' + activeOrder.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full grayscale-[15%] contrast-[110%]"
                    ></iframe>
                    
                    {/* Faux coordinates tag */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-200/80 flex flex-col gap-1 shadow-md max-w-[90%] pointer-events-none z-10">
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Coordenadas de entrega</span>
                      <span className="text-xs font-bold text-zinc-950 truncate leading-none">
                        {activeOrder.city} · {activeOrder.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver & Delivery logistics */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-zinc-400" />
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Logística de Despacho</h5>
                </div>

                {activeOrder.driver ? (
                  <div className="p-4 bg-zinc-50/50 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-xs font-bold tracking-tight">
                        {activeOrder.driver.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-zinc-950">{activeOrder.driver.name}</p>
                        <p className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center gap-1.5">
                          Domiciliario Oficial · <span className="text-amber-500 font-extrabold">⭐ {activeOrder.driver.rating.toFixed(1)}</span> · <span className="text-zinc-900 font-bold">{activeOrder.driver.ordersDelivered} entregas</span>
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${activeOrder.driver.phoneNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors px-3 py-2 bg-white rounded-lg border border-gray-200 active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-current" />
                      Contactar Repartidor
                    </a>
                  </div>
                ) : activeOrder.deliveryRequested ? (
                  <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200/40 flex items-center gap-3.5 animate-pulse duration-1000">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Solicitud de reparto enviada...</p>
                      <p className="text-[10px] font-medium text-amber-600 mt-1">Buscando un repartidor oficial disponible mediante WhatsApp. Te avisaremos inmediatamente.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => requestDelivery(activeOrder.id)}
                      className="w-full h-11 border border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      Solicitar Repartidor Oficial
                    </button>
                    
                    <button
                      onClick={() => updateStatus(activeOrder.id, 'shipped')}
                      className="w-full h-11 bg-white border border-gray-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Despachar de forma propia
                    </button>
                  </div>
                )}
              </div>

              {/* Order Items Table */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-zinc-400" />
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Resumen de Productos</h5>
                </div>

                <div className="space-y-2">
                  {activeOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-zinc-50/30 rounded-lg border border-gray-200/80 hover:border-gray-300 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-700">
                        <span className="text-zinc-950 font-bold tabular-nums mr-2.5">{item.qty}×</span>
                        {item.name}
                      </span>
                      <span className="text-xs font-bold text-zinc-950 tabular-nums">
                        ${(item.price * item.qty).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total del Pedido</span>
                  <span className="text-xl font-bold text-zinc-950 tabular-nums tracking-tight">
                    ${activeOrder.total.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Operations Footer */}
              <div className="p-6 bg-zinc-50/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => updateStatus(activeOrder.id, 'confirmed')}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-lg border transition-all active:scale-95",
                      activeOrder.status === 'confirmed'
                        ? "text-blue-600 bg-blue-50/50 border-blue-200/50"
                        : "bg-white border-gray-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50"
                    )}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => updateStatus(activeOrder.id, 'delivered')}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-lg border transition-all active:scale-95",
                      activeOrder.status === 'delivered'
                        ? "text-emerald-600 bg-emerald-50/50 border-emerald-200/50"
                        : "bg-white border-gray-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50"
                    )}
                  >
                    Entregado
                  </button>
                  <button
                    onClick={() => updateStatus(activeOrder.id, 'cancelled')}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-lg border transition-all active:scale-95",
                      activeOrder.status === 'cancelled'
                        ? "text-rose-600 bg-rose-50/50 border-rose-200/50"
                        : "bg-white border-gray-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50"
                    )}
                  >
                    Cancelar
                  </button>
                </div>

                <button 
                  onClick={() => updateStatus(activeOrder.id, 'delivered')}
                  className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 border border-transparent hover:border-gray-200 transition-all px-4 py-2.5 rounded-lg h-10 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Finalizar Gestión
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center py-32 bg-white rounded-lg border border-gray-200/80 bg-white/50 text-center min-h-[450px]">
              <div className="w-16 h-16 rounded-full bg-zinc-50 border border-gray-200 flex items-center justify-center mb-5 text-zinc-300">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-zinc-950 tracking-tight font-display">Ningún pedido seleccionado</h4>
              <p className="text-zinc-400 text-xs font-medium max-w-xs mt-1.5 leading-relaxed">
                Haz clic en un pedido del listado izquierdo para visualizar su detalle y gestionar su despacho en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, isSelected = false }: { status: string; isSelected?: boolean }) {
  const option = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]
  return (
    <span className={cn(
      "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block leading-none",
      isSelected 
        ? "text-white bg-white/10 border-white/20" 
        : option.color
    )}>
      {option.label}
    </span>
  )
}

function FilterTab({
  label,
  value,
  active,
  count,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-lg text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border active:scale-95 cursor-pointer",
        active 
          ? "bg-zinc-950 text-white border-zinc-950 shadow-sm" 
          : "bg-white border-gray-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50/30"
      )}
    >
      {label}
      <span className={cn(
        "px-1.5 py-0.5 rounded-md font-extrabold min-w-[16px] text-center text-[8px]",
        active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
      )}>
        {count}
      </span>
    </button>
  )
}
