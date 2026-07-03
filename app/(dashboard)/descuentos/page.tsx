"use client"

import { useState } from 'react'
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
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Coupon {
  code: string
  desc: string
  tipo: 'Código' | 'Automático'
  tipoDesc: 'Porcentaje' | 'Envío gratis' | 'Monto fijo'
  valor: string
  usos: number
  validoHasta: string
  estado: 'Activo' | 'Programado' | 'Inactivo'
  icon: any
  iconBg: string
  iconColor: string
}

export default function DescuentosPage() {
  const [activeTab, setActiveTab] = useState<'Todas' | 'Activas' | 'Programadas' | 'Inactivas'>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterTipo, setFilterTipo] = useState('Todos')
  const [filterTipoDesc, setFilterTipoDesc] = useState('Todos')
  
  // Simulated rows per page
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)

  // Full dataset matching the screenshot exactly
  const allCoupons: Coupon[] = [
    { code: 'VERANO25', desc: 'Para toda la tienda', tipo: 'Código', tipoDesc: 'Porcentaje', valor: '25% Descuento', usos: 124, validoHasta: '31 may. 2025', estado: 'Activo', icon: Ticket, iconBg: 'bg-purple-50 border-purple-100', iconColor: 'text-purple-600' },
    { code: 'ENVIOGRATIS', desc: 'Envío gratis en compras +$50.000', tipo: 'Código', tipoDesc: 'Envío gratis', valor: '$0 Envío', usos: 342, validoHasta: '31 may. 2025', estado: 'Activo', icon: Truck, iconBg: 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-600' },
    { code: 'BIENVENIDO10', desc: 'Para nuevos clientes', tipo: 'Código', tipoDesc: 'Porcentaje', valor: '10% Descuento', usos: 89, validoHasta: '30 jun. 2025', estado: 'Programado', icon: Tag, iconBg: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-600' },
    { code: 'BLACKFRIDAY', desc: 'Descuento especial Black Friday', tipo: 'Código', tipoDesc: 'Porcentaje', valor: '30% Descuento', usos: 680, validoHasta: '30 nov. 2025', estado: 'Programado', icon: Gift, iconBg: 'bg-red-50 border-red-100', iconColor: 'text-red-600' },
    { code: 'VIP15', desc: 'Clientes VIP', tipo: 'Código', tipoDesc: 'Porcentaje', valor: '15% Descuento', usos: 63, validoHasta: 'Sin fecha límite', estado: 'Activo', icon: Crown, iconBg: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-600' },
    { code: 'DESCUENTOS5', desc: 'Descuento de prueba', tipo: 'Código', tipoDesc: 'Porcentaje', valor: '5% Descuento', usos: 0, validoHasta: '15 abr. 2025', estado: 'Inactivo', icon: ShieldCheck, iconBg: 'bg-zinc-100 border-zinc-200', iconColor: 'text-zinc-500' },
    { code: 'CYBERMONDAY', desc: 'Cyber Monday 2024', tipo: 'Código', tipoDesc: 'Porcentaje', valor: '20% Descuento', usos: 245, validoHasta: '2 dic. 2024', estado: 'Inactivo', icon: Award, iconBg: 'bg-indigo-50 border-indigo-100', iconColor: 'text-indigo-600' },
    { code: 'ENVIO50', desc: 'Envío con descuento', tipo: 'Código', tipoDesc: 'Monto fijo', valor: '$5.000 Descuento', usos: 112, validoHasta: '30 abr. 2025', estado: 'Inactivo', icon: Ticket, iconBg: 'bg-pink-50 border-pink-100', iconColor: 'text-pink-600' },
  ]

  // Filtering Logic
  const filteredCoupons = allCoupons.filter(c => {
    // 1. Tab Filter (Todas, Activas, Programadas, Inactivas)
    if (activeTab === 'Activas' && c.estado !== 'Activo') return false
    if (activeTab === 'Programadas' && c.estado !== 'Programado') return false
    if (activeTab === 'Inactivas' && c.estado !== 'Inactivo') return false

    // 2. Search query filter
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.desc.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    // 3. Dropdowns filters
    if (filterEstado !== 'Todos' && c.estado !== filterEstado) return false
    if (filterTipo !== 'Todos' && c.tipo !== filterTipo) return false
    if (filterTipoDesc !== 'Todos' && c.tipoDesc !== filterTipoDesc) return false

    return true
  })

  // Calculation for stat counters
  const totalCount = allCoupons.length
  const activeCount = allCoupons.filter(c => c.estado === 'Activo').length
  const scheduledCount = allCoupons.filter(c => c.estado === 'Programado').length
  const inactiveCount = allCoupons.filter(c => c.estado === 'Inactivo').length
  const totalUses = allCoupons.reduce((sum, c) => sum + c.usos, 0)

  return (
    <div className="space-y-6 pb-6 animate-in duration-300 font-sans text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Descuentos</h1>
          <p className="text-xs xl:text-sm font-semibold text-zinc-400">Crea y gestiona descuentos y cupones para tu negocio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none">
            <Download className="w-4 h-4 text-zinc-450" />
            Exportar
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-sm active:scale-98 cursor-pointer select-none">
            <Plus className="w-4 h-4" />
            Nuevo descuento
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6">
        {[
          { id: 'Todas', label: 'Todas', count: totalCount },
          { id: 'Activas', label: 'Activas', count: activeCount },
          { id: 'Programadas', label: 'Programadas', count: scheduledCount },
          { id: 'Inactivas', label: 'Inactivas', count: inactiveCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
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
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Descuentos totales</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-950 tracking-tight mt-1.5 block leading-none">{totalCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">Todos los descuentos</span>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Activos</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{activeCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">56% del total</span>
          </div>
        </div>

        {/* Scheduled Coupons */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Programados</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{scheduledCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">19% del total</span>
          </div>
        </div>

        {/* Inactive Coupons */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Inactivos</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{inactiveCount}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">25% del total</span>
          </div>
        </div>

        {/* Total Uses */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Usos totales</span>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{totalUses.toLocaleString('es-CO')}</span>
            <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">En todos los descuentos</span>
          </div>
        </div>

      </div>

      {/* Main Grid split: Table filters (8/12) and Performance sidebar (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* LEFT COLUMN: Filters & Table (8/12) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
          
          {/* Search inputs and dropdown select filters */}
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar descuento por nombre o código..."
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

              {/* Más filtros button */}
              <button className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg shrink-0 flex items-center justify-center text-zinc-650 cursor-pointer select-none">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto border border-zinc-150 rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs xl:text-sm font-sans">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] xl:text-xs font-black uppercase text-zinc-500 select-none">
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
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                      No se encontraron cupones con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((c, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Name & desc */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border", c.iconBg, c.iconColor)}>
                            <c.icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-zinc-950 leading-tight text-xs xl:text-sm">{c.code}</h4>
                            <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 truncate max-w-[160px]">{c.desc}</p>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-4">{c.tipo}</td>

                      {/* Tipo de desc */}
                      <td className="py-3.5 px-4">{c.tipoDesc}</td>

                      {/* Valor */}
                      <td className="py-3.5 px-4 font-extrabold text-zinc-900 leading-none">
                        <div className="flex flex-col">
                          <span>{c.valor.split(' ')[0]}</span>
                          <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 tracking-tight uppercase">{c.valor.split(' ')[1]}</span>
                        </div>
                      </td>

                      {/* Usos */}
                      <td className="py-3.5 px-4 tabular-nums">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-900">{c.usos}</span>
                          <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 uppercase">usos</span>
                        </div>
                      </td>

                      {/* Valido hasta */}
                      <td className="py-3.5 px-4 whitespace-nowrap">{c.validoHasta}</td>

                      {/* Estado Capsule */}
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold select-none",
                          c.estado === 'Activo' && 'bg-emerald-50 border border-emerald-100 text-emerald-700',
                          c.estado === 'Programado' && 'bg-amber-50 border border-amber-100 text-amber-700',
                          c.estado === 'Inactivo' && 'bg-zinc-100 border border-zinc-200 text-zinc-500'
                        )}>
                          {c.estado}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="px-3 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-lg transition-all cursor-pointer select-none">
                            Ver
                          </button>
                          <button className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-zinc-500 select-none">
            <span>Mostrando 1 - {filteredCoupons.length} de {filteredCoupons.length} descuentos</span>
            
            <div className="flex items-center gap-1">
              <button disabled className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-2.5 py-1 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded">1</button>
              <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">2</button>
              <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">3</button>
              <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">4</button>
              <button className="p-1 border border-zinc-200 rounded hover:bg-zinc-50"><ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-2">
              <span>Filas por página:</span>
              <div className="relative shrink-0">
                <select
                  value={rowsPerPage}
                  onChange={e => setRowsPerPage(Number(e.target.value))}
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
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Rendimiento</h3>
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
              <span className="text-[10px] font-bold text-zinc-405 block tracking-wider uppercase leading-none">Usos por tipo de descuento</span>
              
              {/* NATIVE INTERACTIVE SVG RING DOUGHNUT CHART */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0 select-none">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Circle Background */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F4F4F5" strokeWidth="11" />
                    
                    {/* Segment 1: Porcentaje (68%) -> Value: 170.9, Offset: 0 */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#6F42C1" 
                      strokeWidth="11" 
                      strokeDasharray="251.327" 
                      strokeDashoffset="80.4" // (1 - 0.68) * 251.3
                    />
                    
                    {/* Segment 2: Envío gratis (20%) -> Value: 50.2, Offset: -170.9 */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#22C55E" 
                      strokeWidth="11" 
                      strokeDasharray="251.327" 
                      strokeDashoffset="201.0" // (1 - 0.20) * 251.3 - shift by 68% -> 251.3 - 50.2 = 201.0
                      className="origin-center rotate-[244.8deg]" // 68% * 360 = 244.8deg rotation
                    />

                    {/* Segment 3: Monto fijo (12%) -> Value: 30.1 */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#FF7A00" 
                      strokeWidth="11" 
                      strokeDasharray="251.327" 
                      strokeDashoffset="221.1" // 251.3 - 30.1 = 221.2
                      className="origin-center rotate-[316.8deg]" // 88% * 360 = 316.8deg
                    />
                  </svg>
                  
                  {/* Central Text inside Doughnut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-sans">
                    <span className="text-sm font-black text-zinc-950 tracking-tight leading-none">1.248</span>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-1 uppercase tracking-tight">Total</span>
                  </div>
                </div>

                {/* Chart Legend */}
                <div className="flex-1 space-y-2 text-xs font-semibold text-zinc-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6F42C1] shrink-0" />
                      <span className="truncate text-zinc-600">Porcentaje</span>
                    </div>
                    <span className="text-zinc-950 font-extrabold ml-2">68% <span className="text-zinc-400 font-semibold">(848)</span></span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
                      <span className="truncate text-zinc-600">Envío gratis</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">20% <span className="text-zinc-400 font-semibold">(250)</span></span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
                      <span className="truncate text-zinc-600">Monto fijo</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">12% <span className="text-zinc-400 font-semibold">(150)</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-100" />

            {/* Descuento más usado widget */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-405 block tracking-wider uppercase leading-none">Descuento más usado</span>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-black text-zinc-900 leading-tight">ENVIOGRATIS</h5>
                    <span className="text-[10px] font-semibold text-zinc-400">Envío gratis</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-zinc-955 block leading-none">342 usos</span>
                    <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">27% del total</span>
                  </div>
                </div>
                {/* Custom Progress Bar */}
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[27%]" />
                </div>
              </div>
            </div>

          </div>

          {/* Card 2: Actividad reciente */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Actividad reciente</h3>
            
            <div className="space-y-3.5">
              {[
                { text: 'VERANO25 fue activado', time: 'Hace 10 min', color: 'bg-purple-500' },
                { text: 'BIENVENIDO10 fue programado', time: 'Hace 1 hora', color: 'bg-amber-500' },
                { text: 'DESCUENTOS5 fue desactivado', time: 'Hace 3 horas', color: 'bg-zinc-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.color)} />
                    <span className="truncate text-zinc-800 leading-tight">{item.text}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-zinc-100 pt-1" />

            <button className="text-xs xl:text-sm font-bold text-[#6F42C1] hover:text-purple-700 flex items-center justify-between w-full px-1 pt-1 cursor-pointer select-none">
              <span>Ver toda la actividad</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Nova help box */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
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
              <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all">
                <MessageCircle className="w-4.5 h-4.5 fill-current" />
                Hablar con Nova
              </button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  )
}
