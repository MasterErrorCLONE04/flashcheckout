'use client'

import React from 'react'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
  MoreHorizontal,
  Percent,
  Truck,
  Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Coupon } from './types'

interface DescuentosTableProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  filterEstado: string
  setFilterEstado: (val: string) => void
  filterTipo: string
  setFilterTipo: (val: string) => void
  filterTipoDesc: string
  setFilterTipoDesc: (val: string) => void
  loading: boolean
  paginatedCoupons: Coupon[]
  filteredCoupons: Coupon[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  rowsPerPage: number
  setRowsPerPage: (val: number) => void
  isDeleting: string | null
  onToggleStatus: (c: Coupon) => void
  onOpenEdit: (c: Coupon) => void
  onDelete: (id: string) => void
}

export function DescuentosTable({
  searchQuery,
  setSearchQuery,
  filterEstado,
  setFilterEstado,
  filterTipo,
  setFilterTipo,
  filterTipoDesc,
  setFilterTipoDesc,
  loading,
  paginatedCoupons,
  filteredCoupons,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  isDeleting,
  onToggleStatus,
  onOpenEdit,
  onDelete,
}: DescuentosTableProps) {
  const getIcon = (tipoDesc: string) => {
    if (tipoDesc === 'Porcentaje') return Percent
    if (tipoDesc === 'Envío gratis') return Truck
    return Gift
  }

  const getIconStyles = (tipoDesc: string) => {
    if (tipoDesc === 'Porcentaje') return 'bg-purple-50 border-purple-100 text-purple-600'
    if (tipoDesc === 'Envío gratis') return 'bg-zinc-50 border-zinc-200 text-zinc-600'
    return 'bg-blue-50 border-blue-100 text-blue-600'
  }

  return (
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
            className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg shrink-0 flex items-center justify-center text-zinc-600 cursor-pointer select-none"
            title="Limpiar filtros"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white">
        <table className="w-full text-left border-collapse text-xs xl:text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] xl:text-xs font-black text-zinc-500 select-none">
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
                    <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
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
                        <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 tracking-tight">{c.valor.split(' ')[1]}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-zinc-900">{c.usos}</span>
                        <span className="text-[9px] font-semibold text-zinc-400 mt-0.5">usos</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">{c.validoHasta}</td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onToggleStatus(c)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold select-none cursor-pointer border hover:opacity-85 transition-all",
                          c.estado === 'Activo' && 'bg-zinc-100 border-zinc-200 text-zinc-800',
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
                          onClick={() => onOpenEdit(c)}
                          className="px-3 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-lg transition-all cursor-pointer select-none"
                        >
                          Editar
                        </button>
                        <button 
                          disabled={isDeleting === c.id}
                          onClick={() => onDelete(c.id)}
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
                  ? "bg-zinc-100 border-zinc-200 text-zinc-800"
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
              className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-1.5 font-bold text-zinc-700 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
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
  )
}
