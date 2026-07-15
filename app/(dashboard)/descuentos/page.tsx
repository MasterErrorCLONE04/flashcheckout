"use client"

import { useState, useEffect } from 'react'
import { 
  Ticket, 
  Percent, 
  Plus, 
  Download, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Calendar, 
  XCircle, 
  RotateCcw, 
  Bot, 
  Truck, 
  Tag, 
  Gift, 
  Crown, 
  ShieldCheck, 
  Award, 
  HelpCircle,
  MoreHorizontal,
  MessageCircle,
  X,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'

type CouponEstado = 'Activo' | 'Programado' | 'Inactivo'
type CouponTipo = 'Código' | 'Automático'
type CouponTipoDesc = 'Porcentaje' | 'Envío gratis' | 'Monto fijo'
type TabId = 'Todas' | 'Activas' | 'Programadas' | 'Inactivas'

type Coupon = {
  id: string
  code: string
  desc: string
  tipo: CouponTipo
  tipoDesc: CouponTipoDesc
  valor: string
  validoHasta: string
  estado: CouponEstado
  usos: number
}

export default function DescuentosPage() {
  const [mounted, setMounted] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterTipo, setFilterTipo] = useState('Todos')
  const [filterTipoDesc, setFilterTipoDesc] = useState('Todos')
  
  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form Fields
  const [code, setCode] = useState('')
  const [desc, setDesc] = useState('')
  const [tipo, setTipo] = useState<CouponTipo>('Código')
  const [tipoDesc, setTipoDesc] = useState<CouponTipoDesc>('Porcentaje')
  const [valorNum, setValorNum] = useState('')
  const [validoHasta, setValidoHasta] = useState('')
  const [estado, setEstado] = useState<CouponEstado>('Activo')

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/coupons')
      const data = await res.json()
      if (res.ok) {
        setCoupons(data.coupons || [])
      } else {
        toast.error('Error al cargar descuentos')
      }
    } catch {
      toast.error('Error de conexión al cargar descuentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchCoupons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('El código es requerido')
      return
    }

    let finalValor = ''
    if (tipoDesc === 'Porcentaje') {
      if (!valorNum) {
        toast.error('El porcentaje es requerido')
        return
      }
      finalValor = `${valorNum}% Descuento`
    } else if (tipoDesc === 'Envío gratis') {
      finalValor = '$0 Envío'
    } else if (tipoDesc === 'Monto fijo') {
      if (!valorNum) {
        toast.error('El monto es requerido')
        return
      }
      const formatted = Number(valorNum).toLocaleString('es-CO')
      finalValor = `$${formatted} Descuento`
    }

    try {
      setFormLoading(true)
      const url = '/api/coupons'
      const method = editingId ? 'PUT' : 'POST'
      const body = {
        id: editingId || undefined,
        code: code.trim(),
        desc,
        tipo,
        tipoDesc,
        valor: finalValor,
        validoHasta: validoHasta || 'Sin fecha límite',
        estado
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingId ? 'Descuento actualizado exitosamente' : 'Descuento creado exitosamente')
        setIsModalOpen(false)
        // Reset form fields
        setEditingId(null)
        setCode('')
        setDesc('')
        setValorNum('')
        setValidoHasta('')
        setEstado('Activo')
        fetchCoupons()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar el descuento')
      }
    } catch {
      toast.error('Error al conectar con el servidor')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este descuento?')) return
    try {
      setIsDeleting(id)
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Descuento eliminado')
        fetchCoupons()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error de red al eliminar')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    const newEstado = coupon.estado === 'Activo' ? 'Inactivo' : 'Activo'
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          estado: newEstado
        })
      })
      if (res.ok) {
        toast.success(`Descuento ${newEstado === 'Activo' ? 'activado' : 'desactivado'}`)
        fetchCoupons()
      } else {
        toast.error('Error al actualizar el estado')
      }
    } catch {
      toast.error('Error de red al actualizar')
    }
  }

  const getIcon = (tipoDesc: string) => {
    if (tipoDesc === 'Porcentaje') return Percent
    if (tipoDesc === 'Envío gratis') return Truck
    return Gift
  }

  const getIconStyles = (tipoDesc: string) => {
    if (tipoDesc === 'Porcentaje') return 'bg-purple-50 border-purple-100 text-purple-600'
    if (tipoDesc === 'Envío gratis') return 'bg-emerald-50 border-emerald-100 text-emerald-655'
    return 'bg-blue-50 border-blue-100 text-blue-600'
  }

  // Filter Logic
  const filteredCoupons = coupons.filter(c => {
    if (activeTab === 'Activas' && c.estado !== 'Activo') return false
    if (activeTab === 'Programadas' && c.estado !== 'Programado') return false
    if (activeTab === 'Inactivas' && c.estado !== 'Inactivo') return false

    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.desc.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (filterEstado !== 'Todos' && c.estado !== filterEstado) return false
    if (filterTipo !== 'Todos' && c.tipo !== filterTipo) return false
    if (filterTipoDesc !== 'Todos' && c.tipoDesc !== filterTipoDesc) return false

    return true
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredCoupons.length / rowsPerPage)
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // Calculations for stat counters
  const totalCount = coupons.length
  const activeCount = coupons.filter(c => c.estado === 'Activo').length
  const scheduledCount = coupons.filter(c => c.estado === 'Programado').length
  const inactiveCount = coupons.filter(c => c.estado === 'Inactivo').length
  const totalUses = coupons.reduce((sum, c) => sum + c.usos, 0)

  // Chart data calculations
  const pctCount = coupons.filter(c => c.tipoDesc === 'Porcentaje').length
  const freeShipCount = coupons.filter(c => c.tipoDesc === 'Envío gratis').length
  const fixedCount = coupons.filter(c => c.tipoDesc === 'Monto fijo').length

  const pctPercent = totalCount > 0 ? Math.round((pctCount / totalCount) * 100) : 0
  const freeShipPercent = totalCount > 0 ? Math.round((freeShipCount / totalCount) * 100) : 0
  const fixedPercent = totalCount > 0 ? Math.round((fixedCount / totalCount) * 100) : 0

  const mostUsedCoupon = coupons.length > 0 
    ? [...coupons].sort((a, b) => b.usos - a.usos)[0]
    : null

  const mostUsedPercent = totalUses > 0 && mostUsedCoupon
    ? Math.round((mostUsedCoupon.usos / totalUses) * 100)
    : 0

  return (
    <>
      <div className="space-y-6 pb-6 animate-in duration-300 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Descuentos</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Crea y gestiona descuentos y cupones para tu negocio.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(coupons, null, 2))
              const downloadAnchor = document.createElement('a')
              downloadAnchor.setAttribute("href", dataStr)
              downloadAnchor.setAttribute("download", "descuentos.json")
              document.body.appendChild(downloadAnchor)
              downloadAnchor.click()
              downloadAnchor.remove()
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none"
          >
            <Download className="w-4 h-4 text-zinc-450" />
            Exportar
          </button>
          <button 
            onClick={() => {
              setEditingId(null)
              setCode('')
              setDesc('')
              setValorNum('')
              setValidoHasta('')
              setEstado('Activo')
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none active:scale-98 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            Nuevo descuento
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6">
        {([
          { id: 'Todas', label: 'Todas', count: totalCount },
          { id: 'Activas', label: 'Activas', count: activeCount },
          { id: 'Programadas', label: 'Programadas', count: scheduledCount },
          { id: 'Inactivas', label: 'Inactivas', count: inactiveCount },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setCurrentPage(1)
            }}
            className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-800' 
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {tab.label}
            <span className={cn(
              "px-1.5 py-0.2 rounded text-[10px] font-extrabold",
              activeTab === tab.id ? "bg-emerald-50 border border-emerald-100 text-emerald-850" : "bg-zinc-100 text-zinc-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid: Stat Cards (1x5) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Coupons */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider  leading-none">Descuentos totales</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-950 tracking-tight mt-1.5 block leading-none">{totalCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">Todos los descuentos</span>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider  leading-none">Activos</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{activeCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">
              {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% del total
            </span>
          </div>
        </div>

        {/* Scheduled Coupons */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider  leading-none">Programados</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{scheduledCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">
              {totalCount > 0 ? Math.round((scheduledCount / totalCount) * 100) : 0}% del total
            </span>
          </div>
        </div>

        {/* Inactive Coupons */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider  leading-none">Inactivos</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{inactiveCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">
              {totalCount > 0 ? Math.round((inactiveCount / totalCount) * 100) : 0}% del total
            </span>
          </div>
        </div>

        {/* Total Uses */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider  leading-none">Usos totales</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{totalUses.toLocaleString('es-CO')}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">En todos los descuentos</span>
          </div>
        </div>
      </div>

      {/* Main Grid split: Table filters (8/12) and Performance sidebar (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* LEFT COLUMN: Filters & Table (8/12) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-none p-5 space-y-4">
          
          {/* Search inputs and dropdown select filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar descuento por código..."
                className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs xl:text-sm font-semibold placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
              />
            </div>

            {/* Selector dropdown filters */}
            <div className="flex gap-2 shrink-0 overflow-x-auto scrollbar-none pb-0.5">
              {/* Estado Select */}
              <div className="relative shrink-0">
                <select
                  value={filterEstado}
                  onChange={e => setFilterEstado(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                >
                  <option value="Todos">Estado: Todos</option>
                  <option value="Activo">Activos</option>
                  <option value="Programado">Programados</option>
                  <option value="Inactivo">Inactivos</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>

              {/* Tipo Select */}
              <div className="relative shrink-0">
                <select
                  value={filterTipo}
                  onChange={e => setFilterTipo(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                >
                  <option value="Todos">Tipo: Todos</option>
                  <option value="Código">Código</option>
                  <option value="Automático">Automático</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>

              {/* Tipo de descuento Select */}
              <div className="relative shrink-0">
                <select
                  value={filterTipoDesc}
                  onChange={e => setFilterTipoDesc(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                >
                  <option value="Todos">Tipo de desc.: Todos</option>
                  <option value="Porcentaje">Porcentaje</option>
                  <option value="Envío gratis">Envío gratis</option>
                  <option value="Monto fijo">Monto fijo</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>

              <button 
                onClick={() => {
                  setFilterEstado('Todos')
                  setFilterTipo('Todos')
                  setFilterTipoDesc('Todos')
                  setSearchQuery('')
                }}
                className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg shrink-0 flex items-center justify-center text-zinc-650 cursor-pointer select-none"
                title="Limpiar filtros"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto border border-zinc-150 rounded-lg bg-white">
            <table className="w-full text-left border-collapse text-xs xl:text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] xl:text-xs font-black  text-zinc-500 select-none">
                  <th className="py-3 px-4">Descuento</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Tipo de descuento</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Usos</th>
                  <th className="py-3 px-4">Válido hasta</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                        <span>Cargando descuentos...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                      No se encontraron descuentos registrados.
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((c, idx) => {
                    const CouponIcon = getIcon(c.tipoDesc)
                    const iconStyleClass = getIconStyles(c.tipoDesc)
                    return (
                      <tr key={c.id || idx} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border", iconStyleClass)}>
                              <CouponIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-zinc-950 leading-tight text-xs xl:text-sm">{c.code}</h4>
                              <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 truncate max-w-[160px]">{c.desc || 'Sin descripción'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">{c.tipo}</td>
                        <td className="py-3.5 px-4">{c.tipoDesc}</td>

                        <td className="py-3.5 px-4 font-extrabold text-zinc-900 leading-none">
                          <div className="flex flex-col">
                            <span>{c.valor.split(' ')[0]}</span>
                            <span className="text-[9px] font-semibold text-zinc-405 mt-0.5 tracking-tight ">{c.valor.split(' ')[1]}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 tabular-nums">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-zinc-900">{c.usos}</span>
                            <span className="text-[9px] font-semibold text-zinc-405 mt-0.5 ">usos</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">{c.validoHasta}</td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold select-none cursor-pointer border hover:opacity-85 transition-all",
                              c.estado === 'Activo' && 'bg-emerald-50 border-emerald-100 text-emerald-700',
                              c.estado === 'Programado' && 'bg-amber-50 border-amber-100 text-amber-700',
                              c.estado === 'Inactivo' && 'bg-zinc-100 border-zinc-200 text-zinc-500'
                            )}
                          >
                            {c.estado}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => {
                                setEditingId(c.id)
                                setCode(c.code)
                                setDesc(c.desc)
                                setTipo(c.tipo)
                                setTipoDesc(c.tipoDesc)
                                setValorNum(c.valor.replace(/[^0-9]/g, ''))
                                setValidoHasta(c.validoHasta === 'Sin fecha límite' ? '' : c.validoHasta)
                                setEstado(c.estado)
                                setIsModalOpen(true)
                              }}
                              className="px-3 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-lg transition-all cursor-pointer select-none"
                            >
                              Editar
                            </button>
                            <button 
                              disabled={isDeleting === c.id}
                              onClick={() => handleDelete(c.id)}
                              className="p-1 text-zinc-400 hover:text-red-600 transition-colors shrink-0 disabled:opacity-40"
                              title="Eliminar descuento"
                            >
                              {isDeleting === c.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                              ) : (
                                <MoreHorizontal className="w-4 h-4" />
                              )}
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
            <span>Mostrando {filteredCoupons.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} - {Math.min(currentPage * rowsPerPage, filteredCoupons.length)} de {filteredCoupons.length} descuentos</span>
            
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-45 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "px-2.5 py-1 rounded border transition-all cursor-pointer",
                    currentPage === i + 1
                      ? "bg-emerald-50 border-emerald-150 text-emerald-800"
                      : "border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-45 cursor-pointer"
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

        {/* RIGHT COLUMN: Performance sidebar (4/12) */}
        <div className="lg:col-span-4 space-y-6 text-left shrink-0">
          
          {/* Card 1: Rendimiento de descuentos */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-5 shadow-none">
            <div className="flex items-center justify-between">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800  tracking-wider">Rendimiento</h3>
              <div className="relative shrink-0 select-none">
                <select className="bg-zinc-50 border border-zinc-200 rounded-md pl-2 pr-7 py-1 text-[10px] xl:text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer appearance-none">
                  <option value="month">Este mes</option>
                  <option value="week">Esta semana</option>
                  <option value="year">Este año</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-zinc-405 block tracking-wider  leading-none">Usos por tipo de descuento</span>
              
              {/* NATIVE INTERACTIVE SVG RING DOUGHNUT CHART */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0 select-none">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F4F4F5" strokeWidth="11" />
                    
                    {/* Segment 1: Porcentaje */}
                    {pctPercent > 0 && (
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#6F42C1" 
                        strokeWidth="11" 
                        strokeDasharray="251.327" 
                        strokeDashoffset={251.327 * (1 - pctPercent / 100)}
                      />
                    )}
                    
                    {/* Segment 2: Envío gratis */}
                    {freeShipPercent > 0 && (
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#22C55E" 
                        strokeWidth="11" 
                        strokeDasharray="251.327" 
                        strokeDashoffset={251.327 * (1 - freeShipPercent / 100)}
                        style={{ transform: `rotate(${pctPercent * 3.6}deg)`, transformOrigin: '50px 50px' }}
                      />
                    )}
                    
                    {/* Segment 3: Monto fijo */}
                    {fixedPercent > 0 && (
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#FF7A00" 
                        strokeWidth="11" 
                        strokeDasharray="251.327" 
                        strokeDashoffset={251.327 * (1 - fixedPercent / 100)}
                        style={{ transform: `rotate(${(pctPercent + freeShipPercent) * 3.6}deg)`, transformOrigin: '50px 50px' }}
                      />
                    )}
                  </svg>
                  
                  {/* Central Text inside Doughnut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-black text-zinc-955 tracking-tight leading-none">{totalUses}</span>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-1  tracking-tight">Total</span>
                  </div>
                </div>

                {/* Chart Legend */}
                <div className="flex-1 space-y-2 text-xs font-semibold text-zinc-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6F42C1] shrink-0" />
                      <span className="truncate text-zinc-650">Porcentaje</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">
                      {pctPercent}% <span className="text-zinc-400 font-semibold">({pctCount})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
                      <span className="truncate text-zinc-655">Envío gratis</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">
                      {freeShipPercent}% <span className="text-zinc-400 font-semibold">({freeShipCount})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
                      <span className="truncate text-zinc-650">Monto fijo</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">
                      {fixedPercent}% <span className="text-zinc-400 font-semibold">({fixedCount})</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-100" />

            {/* Descuento más usado widget */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-405 block tracking-wider  leading-none">Descuento más usado</span>
              {mostUsedCoupon ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-black text-zinc-900 leading-none">{mostUsedCoupon.code}</h5>
                      <span className="text-[10px] font-semibold text-zinc-400 mt-1 block">{mostUsedCoupon.tipoDesc}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-zinc-955 block leading-none">{mostUsedCoupon.usos} usos</span>
                      <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">{mostUsedPercent}% del total</span>
                    </div>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-550 rounded-full" style={{ width: `${mostUsedPercent}%` }} />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-zinc-400">Sin datos de usos de cupones</span>
              )}
            </div>
          </div>

          {/* Card 2: Actividad reciente */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800  tracking-wider">Actividad reciente</h3>
            
            <div className="space-y-3.5">
              {coupons.length > 0 ? (
                coupons.slice(0, 3).map((c, idx) => {
                  const stateColors = {
                    Activo: 'bg-emerald-500',
                    Programado: 'bg-amber-500',
                    Inactivo: 'bg-zinc-400'
                  }
                  return (
                    <div key={c.id || idx} className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stateColors[c.estado as keyof typeof stateColors] || 'bg-zinc-400')} />
                        <span className="truncate text-zinc-800 leading-tight">Descuento {c.code} registrado</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">Reciente</span>
                    </div>
                  )
                })
              ) : (
                <span className="text-xs font-semibold text-zinc-400">Sin actividad registrada</span>
              )}
            </div>

            <div className="h-px w-full bg-zinc-100 pt-1" />

            <button className="text-xs xl:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-between w-full px-1 pt-1 cursor-pointer select-none border-none bg-transparent">
              <span>Ver toda la actividad</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Nova help box */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <h4 className="text-xs xl:text-sm font-black text-zinc-950 tracking-tight leading-tight">¿Necesitas ayuda con descuentos?</h4>
                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 leading-relaxed">Nova puede ayudarte a crear estrategias de descuentos efectivas.</p>
              </div>
              <div className="shrink-0 select-none">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Bot className="w-7 h-7" />
                </div>
              </div>
            </div>

            <Link href="/hablar-con-nova" className="w-full select-none">
              <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-none flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all border-none">
                <MessageCircle className="w-4.5 h-4.5 fill-current" />
                Hablar con Nova
              </button>
            </Link>
          </div>

        </div>

      </div>

    </div>

    {/* MODAL: CREAR DESCUENTO */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-zinc-150 rounded-lg p-6 w-full max-w-md space-y-5 shadow-none relative animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-350 ease-out">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-zinc-955 leading-tight">Crear Nuevo Descuento</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Completa los campos para generar un código o regla.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">Código del cupón</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Ej: VERANO25"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">Descripción del beneficio</label>
                <input 
                  type="text" 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ej: Descuento aplicable en toda la tienda"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">Tipo de aplicación</label>
                  <select 
                    value={tipo}
                    onChange={e => setTipo(e.target.value as CouponTipo)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Código">Código promocional</option>
                    <option value="Automático">Automático al checkout</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">Tipo de descuento</label>
                  <select 
                    value={tipoDesc}
                    onChange={e => setTipoDesc(e.target.value as CouponTipoDesc)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Porcentaje">Porcentaje %</option>
                    <option value="Envío gratis">Envío gratis</option>
                    <option value="Monto fijo">Monto fijo $</option>
                  </select>
                </div>
              </div>

              {tipoDesc !== 'Envío gratis' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">
                    {tipoDesc === 'Porcentaje' ? 'Porcentaje de descuento' : 'Monto de descuento ($ COP)'}
                  </label>
                  <input 
                    type="number" 
                    value={valorNum}
                    onChange={e => setValorNum(e.target.value)}
                    placeholder={tipoDesc === 'Porcentaje' ? 'Ej: 15' : 'Ej: 5000'}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">Válido hasta</label>
                  <input 
                    type="text" 
                    value={validoHasta}
                    onChange={e => setValidoHasta(e.target.value)}
                    placeholder="Ej: 31 may. 2025"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400  tracking-wider block">Estado</label>
                  <select 
                    value={estado}
                    onChange={e => setEstado(e.target.value as CouponEstado)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Programado">Programado</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {formLoading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Descuento'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </>
  )
}
