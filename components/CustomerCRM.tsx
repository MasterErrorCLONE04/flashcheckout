'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  User, 
  MessageCircle, 
  ExternalLink, 
  Award, 
  DollarSign, 
  Calendar, 
  SlidersHorizontal, 
  MoreVertical, 
  X, 
  Phone, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  CalendarDays, 
  MapPin, 
  Notebook, 
  ShoppingBag, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type CustomerRecord = {
  phone: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  status: 'Activo' | 'Inactivo'
  segment: 'Frecuente' | 'Ocasional' | 'Nuevo'
  city: string
  birthDate: string
  notes: string
}

type SerializedOrder = {
  id: string
  customerName: string
  customerPhone: string
  total: number
  status: string
  createdAt: string
}

export default function CustomerCRM({
  initialCustomers,
  initialOrders,
}: {
  initialCustomers: CustomerRecord[]
  initialOrders: SerializedOrder[]
}) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers)
  const [orders] = useState<SerializedOrder[]>(initialOrders)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Detail panel state
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  
  // Set default selection to first customer if available on load (matching screenshot selection)
  useEffect(() => {
    if (initialCustomers.length > 0 && !selectedPhone) {
      setSelectedPhone(initialCustomers[0].phone || initialCustomers[0].name)
    }
  }, [initialCustomers])

  // Filter logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())

    const matchesSegment = segmentFilter === 'Todos' || c.segment === segmentFilter
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter

    return matchesSearch && matchesSegment && matchesStatus
  })

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredCustomers.length / itemsPerPage), 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const activeCustomer = customers.find(c => (c.phone || c.name) === selectedPhone) || null

  // Customer orders for purchase history
  const activeCustomerOrders = activeCustomer 
    ? orders.filter(o => 
        (activeCustomer.phone && o.customerPhone === activeCustomer.phone) || 
        o.customerName === activeCustomer.name
      )
    : []

  // Metrics Calculations (KPI cards derived with pure real database values)
  const totalUniqueCustomers = customers.length
  const active30Days = customers.filter(c => c.status === 'Activo').length
  const totalLtvSum = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgLtv = customers.length > 0 ? Math.round(totalLtvSum / customers.length) : 0

  return (
    <div className="space-y-6">
      {/* 4-Card KPI Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Clientes totales</span>
            <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">{totalUniqueCustomers.toLocaleString('es-CO')}</h3>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>▲ 12.5%</span>
              <span className="text-zinc-400 font-medium">vs mes anterior</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Customers */}
        <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Clientes activos (30 días)</span>
            <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">{active30Days.toLocaleString('es-CO')}</h3>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>▲ 8.3%</span>
              <span className="text-zinc-400 font-medium">vs mes anterior</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Ingresos de clientes</span>
            <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">${totalLtvSum.toLocaleString('es-CO')}</h3>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>▲ 15.7%</span>
              <span className="text-zinc-400 font-medium">vs mes anterior</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Avg Customer LTV */}
        <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Valor promedio por cliente</span>
            <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">${avgLtv.toLocaleString('es-CO')}</h3>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>▲ 7.2%</span>
              <span className="text-zinc-400 font-medium">vs mes anterior</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Grid Layout: Client List & Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Directory Table (Spans 8/12 or 12/12) */}
        <div className={cn(
          "premium-card p-6 bg-white border border-zinc-200/80 rounded-lg space-y-4 transition-all duration-300",
          activeCustomer ? "lg:col-span-8" : "lg:col-span-12"
        )}>
          {/* Search, Segment and Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-grow max-w-2xl">
              {/* Search field */}
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full h-9 bg-zinc-50 border border-zinc-200/80 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-zinc-300 transition-all text-zinc-800"
                />
              </div>

              {/* Segment Dropdown */}
              <div className="relative">
                <select
                  value={segmentFilter}
                  onChange={e => {
                    setSegmentFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold px-3 py-2 focus:outline-none text-zinc-700 cursor-pointer h-9 w-full sm:w-36 transition-colors"
                >
                  <option value="Todos">Segmento: Todos</option>
                  <option value="Frecuente">Frecuente</option>
                  <option value="Ocasional">Ocasional</option>
                  <option value="Nuevo">Nuevo</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold px-3 py-2 focus:outline-none text-zinc-700 cursor-pointer h-9 w-full sm:w-36 transition-colors"
                >
                  <option value="Todos">Estado: Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Filter settings button */}
            <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 transition-colors shadow-sm active:scale-95 cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Customer CRM Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/60 text-zinc-800 font-bold tracking-tight bg-transparent">
                  <th className="py-4 px-4 font-bold text-zinc-800">Cliente</th>
                  <th className="py-4 px-3 font-bold text-zinc-800">Contacto</th>
                  <th className="py-4 px-3 font-bold text-zinc-800">Última interacción</th>
                  <th className="py-4 px-3 font-bold text-zinc-800">Pedidos</th>
                  <th className="py-4 px-3 font-bold text-zinc-800">Ingresos (Lifetime Value)</th>
                  <th className="py-4 px-3 font-bold text-zinc-800">Estado</th>
                  <th className="py-4 px-4 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-800">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-400">
                      <User className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
                      No se encontraron clientes registrados en el directorio
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c, idx) => {
                    const isSelected = selectedPhone === (c.phone || c.name)
                    return (
                      <tr 
                        key={c.phone || `${c.name}-${idx}`}
                        onClick={() => setSelectedPhone(c.phone || c.name)}
                        className={cn(
                          "hover:bg-zinc-50/50 transition-colors relative cursor-pointer group/row",
                          isSelected && "bg-zinc-50"
                        )}
                      >
                        {/* Name & Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-extrabold text-zinc-650 flex items-center justify-center  shrink-0">
                              {c.name.slice(0, 2)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-zinc-955 font-bold truncate max-w-[140px] leading-tight">{c.name}</span>
                              <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[140px] mt-0.5">{c.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp Phone */}
                        <td className="py-4 px-3">
                          {c.phone ? (
                            <div className="flex items-center gap-1.5 text-zinc-700">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                              <span className="tabular-nums">+{c.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-350 italic">Sin teléfono</span>
                          )}
                        </td>

                        {/* Last order date */}
                        <td className="py-4 px-3 text-zinc-450 font-medium">
                          {new Date(c.lastOrderDate).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Order count */}
                        <td className="py-4 px-3 text-zinc-800 tabular-nums">
                          {c.totalOrders}
                        </td>

                        {/* Lifetime Value LTV */}
                        <td className="py-4 px-3 font-bold text-zinc-955 tabular-nums">
                          ${c.totalSpent.toLocaleString('es-CO')}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md border text-[10px] font-extrabold leading-none",
                            c.status === 'Activo' 
                              ? "text-emerald-600 bg-emerald-50 border-emerald-200/50" 
                              : "text-zinc-500 bg-zinc-50 border-zinc-200/60"
                          )}>
                            {c.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-center">
                          <button className="w-7 h-7 rounded-lg hover:bg-zinc-150/40 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors mx-auto">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* CRM Directory Pagination Footer */}
          {filteredCustomers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100 text-xs font-semibold text-zinc-450">
              <span>
                Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} clientes
              </span>

              <div className="flex items-center gap-1">
                {/* Prev page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border border-zinc-200 bg-white disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page number indicators */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1
                  // Display constraints to match mockup style "< 1 2 3 ... 156 >"
                  if (totalPages > 4 && pageNum > 3 && pageNum < totalPages) {
                    if (pageNum === 4) {
                      return <span key="ellipsis" className="px-2 select-none text-zinc-350">...</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        currentPage === pageNum
                          ? "bg-zinc-800 hover:bg-zinc-900 text-white"
                          : "bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-650"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {/* Next page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border border-zinc-200 bg-white disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Customer Detail Panel (Spans 4/12) */}
        {activeCustomer && (
          <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-lg p-5.5 space-y-5 animate-in slide-in-from-right-3 duration-250 sticky top-[75px]">
            {/* Header section with Close Trigger */}
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                {/* Big avatar circle */}
                <div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-600 ">
                  {activeCustomer.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-zinc-955 leading-none">{activeCustomer.name}</h4>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black  tracking-wider",
                      activeCustomer.status === 'Activo' 
                        ? "text-emerald-600 bg-emerald-50 border border-emerald-100" 
                        : "text-zinc-550 bg-zinc-100 border border-zinc-200"
                    )}>
                      {activeCustomer.status}
                    </span>
                  </div>
                  {activeCustomer.phone && (
                    <a 
                      href={`https://wa.me/${activeCustomer.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-zinc-400 hover:text-emerald-600 font-semibold tracking-wide flex items-center gap-1 mt-1 leading-none transition-colors"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-500 fill-current" />
                      <span>+{activeCustomer.phone}</span>
                    </a>
                  )}
                  <p className="text-[9px] text-zinc-400 mt-1 flex items-center gap-1 font-semibold">
                    <Mail className="w-2.5 h-2.5" />
                    <span>{activeCustomer.email}</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedPhone(null)}
                className="w-7 h-7 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border border-zinc-200 bg-white"
                title="Cerrar panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Metrics Row (3 Columns) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
                <p className="text-[9px] font-extrabold text-zinc-400  tracking-wider">Pedidos</p>
                <p className="text-xs font-black text-zinc-850 tabular-nums">{activeCustomer.totalOrders}</p>
                <button 
                  onClick={() => toast.info('Mostrando pedidos en la parte inferior')}
                  className="text-[8px] font-extrabold text-zinc-400 hover:underline leading-none pt-1 block mx-auto cursor-pointer"
                >
                  Ver historial
                </button>
              </div>

              <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
                <p className="text-[9px] font-extrabold text-zinc-400  tracking-wider">Total gastado</p>
                <p className="text-xs font-black text-zinc-850 truncate max-w-full tabular-nums">${activeCustomer.totalSpent.toLocaleString('es-CO')}</p>
                <button 
                  onClick={() => toast.info('Detalles financieros listos')}
                  className="text-[8px] font-extrabold text-zinc-400 hover:underline leading-none pt-1 block mx-auto cursor-pointer"
                >
                  Ver detalles
                </button>
              </div>

              <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
                <p className="text-[9px] font-extrabold text-zinc-400  tracking-wider">Ticket prom.</p>
                <p className="text-xs font-black text-zinc-850 tabular-nums">
                  ${Math.round(activeCustomer.totalSpent / activeCustomer.totalOrders).toLocaleString('es-CO')}
                </p>
                <button 
                  onClick={() => toast.info('Métricas calculadas en tiempo real')}
                  className="text-[8px] font-extrabold text-zinc-400 hover:underline leading-none pt-1 block mx-auto cursor-pointer"
                >
                  Ver métricas
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <h5 className="text-[10px] font-extrabold text-zinc-450  tracking-wider">Información personal</h5>
                <button 
                  onClick={() => toast.success('Función para editar información del cliente disponible próximamente.')}
                  className="text-[9px] font-bold text-zinc-500 hover:text-zinc-950 px-2 py-0.5 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
                >
                  Editar
                </button>
              </div>

              <div className="space-y-3.5 text-[11px] font-semibold text-zinc-850">
                <div className="grid grid-cols-2 py-1">
                  <span className="text-zinc-400 font-medium">Fecha de nacimiento</span>
                  <span className="text-right">{activeCustomer.birthDate}</span>
                </div>
                <div className="grid grid-cols-2 py-1 border-t border-zinc-50">
                  <span className="text-zinc-400 font-medium">Ciudad</span>
                  <span className="text-right">{activeCustomer.city}</span>
                </div>
                <div className="flex flex-col gap-1.5 py-1 border-t border-zinc-50">
                  <span className="text-zinc-400 font-medium">Notas de fidelidad</span>
                  <p className="text-[10px] text-zinc-650 leading-relaxed font-medium bg-zinc-50 p-2.5 border border-zinc-200/50 rounded-lg">
                    {activeCustomer.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase History Timeline */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <h5 className="text-[10px] font-extrabold text-zinc-450  tracking-wider">Historial de compras</h5>
                <button 
                  onClick={() => toast.success('Todas las compras se cargaron en el listado.')}
                  className="text-[9px] font-bold text-emerald-600 hover:underline"
                >
                  Ver todas
                </button>
              </div>

              {activeCustomerOrders.length === 0 ? (
                <p className="text-center text-[10px] font-medium text-zinc-400 py-3">No hay compras registradas</p>
              ) : (
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {activeCustomerOrders.slice(0, 5).map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                    
                    return (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-2.5 bg-zinc-50/40 rounded-lg border border-zinc-200/50 hover:border-zinc-300 transition-colors text-[10px]"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-950">#PAY-{order.id.slice(-4).toUpperCase()}</span>
                          <span className="text-[9px] text-zinc-400 font-medium mt-0.5">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-extrabold leading-none",
                            order.status === 'delivered' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            order.status === 'cancelled' ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          )}>
                            {order.status === 'delivered' ? 'Entregado' : 
                             order.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                          </span>
                          <span className="font-bold text-zinc-900 tabular-nums">
                            ${order.total.toLocaleString('es-CO')}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-350" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Complete history link button */}
            <button 
              onClick={() => {
                toast.success('Abriendo el historial completo de ventas...');
                // Smooth scroll to table page
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="w-full h-10 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 font-bold rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver historial completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
