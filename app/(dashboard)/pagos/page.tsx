"use client"

import { useState } from 'react'
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
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

  // Full payments dataset matching the mockup exactly
  const allPayments: Payment[] = [
    { id: 'PAY-000245', ref: '8F7G2A4H', cliente: { name: 'María González', phone: '+57 312 456 7890', initials: 'MG', bg: 'bg-purple-100 text-purple-700' }, pedido: '#FC-1058', prodCount: 2, metodo: { label: 'Mercado Pago', icon: Handshake, iconBg: 'bg-sky-50 border-sky-100', iconColor: 'text-sky-600' }, estado: 'Exitoso', fecha: 'Hoy, 10:45 a. m.', monto: 124900 },
    { id: 'PAY-000244', ref: '5K91L8M2N', cliente: { name: 'Carlos Ramírez', phone: '+57 300 123 4567', initials: 'CR', bg: 'bg-blue-100 text-blue-700' }, pedido: '#FC-1057', prodCount: 3, metodo: { label: 'Tarjeta **** 4242', icon: CreditCard, iconBg: 'bg-zinc-100 border-zinc-200', iconColor: 'text-zinc-700' }, estado: 'Pendiente', fecha: 'Hoy, 10:32 a. m.', monto: 89600 },
    { id: 'PAY-000243', ref: '9D4F5G3H', cliente: { name: 'Laura Martínez', phone: '+57 315 789 0123', initials: 'LM', bg: 'bg-pink-100 text-pink-700' }, pedido: '#FC-1056', prodCount: 1, metodo: { label: 'Nequi', icon: Wallet, iconBg: 'bg-indigo-50 border-indigo-100', iconColor: 'text-indigo-600' }, estado: 'Exitoso', fecha: 'Hoy, 10:15 a. m.', monto: 28900 },
    { id: 'PAY-000242', ref: 'FD2G3R4S', cliente: { name: 'Diego Salazar', phone: '+57 301 234 5678', initials: 'DS', bg: 'bg-emerald-100 text-emerald-700' }, pedido: '#FC-1055', prodCount: 4, metodo: { label: 'Tarjeta **** 1234', icon: CreditCard, iconBg: 'bg-zinc-100 border-zinc-200', iconColor: 'text-zinc-700' }, estado: 'Fallido', fecha: 'Hoy, 9:50 a. m.', monto: 64800 },
    { id: 'PAY-000241', ref: '5T6U7V8W', cliente: { name: 'Ana Torres', phone: '+57 320 456 7890', initials: 'AT', bg: 'bg-amber-100 text-amber-700' }, pedido: '#FC-1054', prodCount: 2, metodo: { label: 'Mercado Pago', icon: Handshake, iconBg: 'bg-sky-50 border-sky-100', iconColor: 'text-sky-600' }, estado: 'Exitoso', fecha: 'Ayer, 9:20 p. m.', monto: 93700 },
    { id: 'PAY-000240', ref: '7Y8P9Q20', cliente: { name: 'Sofía Herrera', phone: '+57 311 567 8901', initials: 'SH', bg: 'bg-red-100 text-red-700' }, pedido: '#FC-1053', prodCount: 3, metodo: { label: 'PSE', icon: Globe, iconBg: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-650' }, estado: 'Pendiente', fecha: 'Ayer, 8:45 p. m.', monto: 156800 },
    { id: 'PAY-000239', ref: '4S5C6D7E', cliente: { name: 'Andrés Felipe', phone: '+57 302 345 6789', initials: 'AF', bg: 'bg-indigo-100 text-indigo-700' }, pedido: '#FC-1052', prodCount: 1, metodo: { label: 'Tarjeta **** 9876', icon: CreditCard, iconBg: 'bg-zinc-100 border-zinc-200', iconColor: 'text-zinc-700' }, estado: 'Exitoso', fecha: 'Ayer, 8:10 p. m.', monto: 43800 },
    { id: 'PAY-000238', ref: '6F7G2H3J', cliente: { name: 'Valentina Ruiz', phone: '+57 310 222 3344', initials: 'VR', bg: 'bg-rose-100 text-rose-700' }, pedido: '#FC-1051', prodCount: 2, metodo: { label: 'Nequi', icon: Wallet, iconBg: 'bg-indigo-50 border-indigo-100', iconColor: 'text-indigo-600' }, estado: 'Exitoso', fecha: 'Ayer, 7:30 p. m.', monto: 21900 },
  ]

  // Recent refunds dataset
  const recentRefunds: Refund[] = [
    { name: 'Carlos Ramírez', ref: 'JD8K3L9M', time: 'Hoy, 11:20 a. m.', monto: -89600 },
    { name: 'Laura Martínez', ref: '4A5B6C7D', time: 'Ayer, 6:45 p. m.', monto: -28900 },
    { name: 'Diego Salazar', ref: 'LC7D4E2F', time: '28 abr, 3:10 p. m.', monto: -64800 },
  ]

  // Filtering Logic
  const filteredPayments = allPayments.filter(p => {
    // 1. Text Search query
    const matchesText = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.cliente.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.pedido.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesText) return false

    // 2. Estado filter
    if (filterEstado !== 'Todos' && p.estado !== filterEstado) return false

    // 3. Método filter
    if (filterMetodo !== 'Todos') {
      const matchMetodo = p.metodo.label.toLowerCase().includes(filterMetodo.toLowerCase())
      if (!matchMetodo) return false
    }

    return true
  })

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace('COP', '').trim()
  }

  return (
    <div className="space-y-6 pb-6 animate-in duration-300 font-sans text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-955">Pagos</h1>
          <p className="text-xs xl:text-sm font-semibold text-zinc-400">Gestiona y supervisa todos los pagos de tu negocio.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none self-end sm:self-auto">
          <Download className="w-4 h-4 text-zinc-450" />
          Exportar
        </button>
      </div>

      {/* Grid: Stat Cards (1x4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Volumen total */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Volumen total</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight block leading-none">$18.742.300</span>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 mt-1 select-none">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>15% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

        {/* Pagos exitosos */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Pagos exitosos</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight block leading-none">356</span>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 mt-1 select-none">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>14% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

        {/* Pagos pendientes */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Pagos pendientes</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight block leading-none">18</span>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-red-600 mt-1 select-none">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>8% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

        {/* Pagos fallidos */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3.5 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-650 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase leading-none">Pagos fallidos</span>
              <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
            </div>
            <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight block leading-none">6</span>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-red-600 mt-1 select-none">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>25% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid Split: Table column (8/12) and Performance sidebar (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* LEFT COLUMN: Filters, Table, Optimiza Banner (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Table Container Wrapper */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
            
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
                  value="01/05/2025 - 31/05/2025"
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
            <div className="overflow-x-auto border border-zinc-150 rounded-xl bg-white">
              <table className="w-full text-left border-collapse text-xs xl:text-sm font-sans">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] xl:text-xs font-black uppercase text-zinc-500 select-none">
                    <th className="py-3 px-4">Pago</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Pedido</th>
                    <th className="py-3 px-4">Método de pago</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                        No se encontraron registros de pagos.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p, idx) => {
                      const MetodoIcon = p.metodo.icon
                      return (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          
                          {/* Payment reference */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {p.estado === 'Exitoso' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                              {p.estado === 'Pendiente' && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                              {p.estado === 'Fallido' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-zinc-950 leading-tight text-xs xl:text-sm">{p.id}</h4>
                                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 select-all">Ref: {p.ref}</p>
                              </div>
                            </div>
                          </td>

                          {/* Client profile */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none", p.cliente.bg)}>
                                {p.cliente.initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-zinc-950 leading-tight text-xs xl:text-sm">{p.cliente.name}</h4>
                                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5">{p.cliente.phone}</p>
                              </div>
                            </div>
                          </td>

                          {/* Pedido */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#6F42C1] hover:underline cursor-pointer">{p.pedido}</span>
                              <span className="text-[9px] font-semibold text-zinc-450 mt-0.5">{p.prodCount} productos</span>
                            </div>
                          </td>

                          {/* Método de pago */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-7.5 h-7.5 rounded-lg flex items-center justify-center border shrink-0", p.metodo.iconBg, p.metodo.iconColor)}>
                                <MetodoIcon className="w-4 h-4" />
                              </div>
                              <span className="text-zinc-800 text-[11px] xl:text-xs">{p.metodo.label}</span>
                            </div>
                          </td>

                          {/* Estado Capsule */}
                          <td className="py-3.5 px-4">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold select-none",
                              p.estado === 'Exitoso' && 'bg-emerald-50 border border-emerald-100 text-emerald-700',
                              p.estado === 'Pendiente' && 'bg-amber-50 border border-amber-100 text-amber-700',
                              p.estado === 'Fallido' && 'bg-red-50 border border-red-100 text-red-700'
                            )}>
                              {p.estado}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-zinc-650">{p.fecha}</td>

                          {/* Monto */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-black text-zinc-950 text-xs xl:text-sm">
                            ${formatCurrency(p.monto)}
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
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table pagination footer */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-zinc-500 select-none">
              <span>Mostrando 1 - {filteredPayments.length} de 356 pagos</span>
              
              <div className="flex items-center gap-1">
                <button disabled className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button className="px-2.5 py-1 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded">1</button>
                <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">2</button>
                <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">3</button>
                <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">4</button>
                <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">5</button>
                <span className="px-1 text-zinc-400">...</span>
                <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-50">45</button>
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

          {/* Banner bottom: Optimiza tus cobros */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650 shrink-0 select-none">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs xl:text-sm font-black text-zinc-950 tracking-tight leading-tight">Optimiza tus cobros</h4>
                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 leading-normal">Conecta más métodos de pago y aumenta tus conversiones de venta virtual.</p>
              </div>
            </div>
            
            <Link href="/integraciones" className="shrink-0 select-none">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-sm transition-all cursor-pointer active:scale-98">
                Gestionar métodos de pago
              </button>
            </Link>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar stats (4/12) */}
        <div className="lg:col-span-4 space-y-6 text-left shrink-0">
          
          {/* Card 1: Métodos de pago (progress bars) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Métodos de pago</h3>
              <Link href="/integraciones" className="text-[10px] font-bold text-[#6F42C1] hover:underline cursor-pointer">Ver todos</Link>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Mercado Pago', percentage: 45, value: '$8.200', icon: Handshake, color: 'bg-sky-500' },
                { name: 'Tarjetas', percentage: 30, value: '$5.623.400', icon: CreditCard, color: 'bg-indigo-500' },
                { name: 'Nequi', percentage: 15, value: '$2.811.200', icon: Wallet, color: 'bg-indigo-600' },
                { name: 'PSE', percentage: 7, value: '$1.311.300', icon: Globe, color: 'bg-teal-500' },
                { name: 'Transferencia', percentage: 3, value: '$562.200', icon: Landmark, color: 'bg-emerald-500' },
              ].map((item, idx) => {
                const ItemIcon = item.icon
                return (
                  <div key={idx} className="space-y-1.5 font-semibold text-xs text-zinc-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <ItemIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate text-zinc-800">{item.name}</span>
                      </div>
                      <div className="text-right shrink-0 select-none">
                        <span className="font-extrabold text-zinc-950">{item.percentage}%</span>
                        <span className="text-[10px] text-zinc-400 ml-2">{item.value}</span>
                      </div>
                    </div>
                    {/* Progress indicator */}
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", item.color)} 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 2: Resumen de pagos ( doughnut ) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between select-none">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Resumen de pagos</h3>
              <div className="relative shrink-0">
                <select className="bg-zinc-50 border border-zinc-200 rounded-md pl-2 pr-7 py-1 text-[10px] xl:text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer appearance-none">
                  <option value="month">Este mes</option>
                  <option value="week">Esta semana</option>
                  <option value="year">Este año</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-6">
                
                {/* SVG Doughnut Ring */}
                <div className="relative w-28 h-28 shrink-0 select-none">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F4F4F5" strokeWidth="11" />
                    
                    {/* Segment 1: Exitosos (90%) -> Offset: (1-0.9)*251.3 = 25.1 */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#22C55E" 
                      strokeWidth="11" 
                      strokeDasharray="251.327" 
                      strokeDashoffset="25.1"
                    />

                    {/* Segment 2: Pendientes (5%) -> Offset: 251.3 - 12.5 = 238.8 */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#F59E0B" 
                      strokeWidth="11" 
                      strokeDasharray="251.327" 
                      strokeDashoffset="238.8"
                      className="origin-center rotate-[324deg]" // 90% * 360 = 324deg
                    />

                    {/* Segment 3: Fallidos (2%) -> Offset: 251.3 - 5.0 = 246.3 */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#EF4444" 
                      strokeWidth="11" 
                      strokeDasharray="251.327" 
                      strokeDashoffset="246.3"
                      className="origin-center rotate-[342deg]" // 95% * 360 = 342deg
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                    <span className="text-sm font-black text-zinc-955 leading-none">356</span>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-1 uppercase tracking-tight">Total</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-2 text-xs font-semibold text-zinc-750">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
                      <span className="truncate text-zinc-600">Exitosos</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">322 <span className="text-zinc-450 font-semibold text-[10px]">(90%)</span></span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                      <span className="truncate text-zinc-600">Pendientes</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">18 <span className="text-zinc-450 font-semibold text-[10px]">(5%)</span></span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                      <span className="truncate text-zinc-600">Fallidos</span>
                    </div>
                    <span className="text-zinc-955 font-extrabold ml-2">6 <span className="text-zinc-450 font-semibold text-[10px]">(2%)</span></span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Card 3: Reembolsos recientes */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Reembolsos recientes</h3>
              <button className="text-[10px] font-bold text-[#6F42C1] hover:underline cursor-pointer">Ver todos</button>
            </div>

            <div className="space-y-4">
              {recentRefunds.map((refund, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 text-[10px] shrink-0">
                      {refund.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-zinc-900 leading-tight truncate text-[11px] xl:text-xs">{refund.name}</h5>
                      <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block leading-none">Ref: {refund.ref}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-zinc-900 font-extrabold block leading-none">-${formatCurrency(Math.abs(refund.monto))}</span>
                    <span className="text-[9px] text-zinc-400 mt-1 block leading-none select-none">{refund.time.split(',')[1] || refund.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-zinc-100 pt-1" />

            <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-sm text-center select-none cursor-pointer">
              Ver todos los reembolsos
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
