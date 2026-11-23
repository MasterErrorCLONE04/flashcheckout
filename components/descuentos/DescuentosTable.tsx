'use client'

import React from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Percent,
  Truck,
  Gift,
  Copy,
  Trash2,
  Edit3,
  Share2,
  X,
  Ticket,
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
  editingId?: string | null
  onToggleStatus: (c: Coupon) => void
  onOpenEdit: (c: Coupon) => void
  onDelete: (id: string) => void
  onCopyCode?: (code: string) => void
  onCopyPromoText?: (c: Coupon) => void
}

export function DescuentosTable({
  searchQuery,
  setSearchQuery,
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
  isDeleting,
  editingId,
  onToggleStatus,
  onOpenEdit,
  onDelete,
  onCopyCode,
  onCopyPromoText,
}: DescuentosTableProps) {
  const getIcon = (tipoDesc: string) => {
    if (tipoDesc === 'Porcentaje') return Percent
    if (tipoDesc === 'Envío gratis') return Truck
    return Gift
  }

  const BENEFIT_PILLS = [
    { id: 'Todos', label: 'Todos los beneficios' },
    { id: 'Porcentaje', label: 'Porcentaje %' },
    { id: 'Monto fijo', label: 'Monto fijo $' },
    { id: 'Envío gratis', label: 'Envío gratis' },
  ]

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-white overflow-hidden">
      {/* Sub-barra fija de Búsqueda y Filtros por Tipo de Beneficio */}
      <div className="px-4 py-2.5 border-b border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Buscar cupón por código o descripción..."
            className="w-full h-8 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg pl-9 pr-8 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Benefit Type Pills */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
            {BENEFIT_PILLS.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setFilterTipoDesc(b.id)
                  setCurrentPage(1)
                }}
                className={cn(
                  'h-6 px-2.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border-0 whitespace-nowrap',
                  filterTipoDesc === b.id
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Application Type Select */}
          <select
            value={filterTipo}
            onChange={e => {
              setFilterTipo(e.target.value)
              setCurrentPage(1)
            }}
            className="h-7 px-2.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg text-[11px] font-bold text-zinc-700 outline-none cursor-pointer"
          >
            <option value="Todos">Aplicación: Todas</option>
            <option value="Código">Código manual</option>
            <option value="Automático">Automático</option>
          </select>
        </div>
      </div>

      {/* Scrollable Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[780px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur-xs border-b border-zinc-200">
            <tr className="text-[10px] font-black uppercase tracking-wider text-zinc-400 select-none">
              <th className="py-2.5 px-4">Código & Campaña</th>
              <th className="py-2.5 px-3">Aplicación</th>
              <th className="py-2.5 px-3">Beneficio</th>
              <th className="py-2.5 px-3 text-center">Redenciones</th>
              <th className="py-2.5 px-3">Vigencia</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-400 select-none">
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                    <span>Cargando reglas de descuento...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-400 select-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-900">
                      No hay cupones registrados en esta vista
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-sm">
                      Usa el constructor del panel derecho para lanzar un cupón de descuento o envío gratis en segundos.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCoupons.map(c => {
                const CouponIcon = getIcon(c.tipoDesc)
                const isSelected = editingId === c.id

                return (
                  <tr
                    key={c.id}
                    onClick={() => onOpenEdit(c)}
                    className={cn(
                      'transition-colors cursor-pointer group',
                      isSelected ? 'bg-zinc-950/[0.04]' : 'hover:bg-zinc-50/80'
                    )}
                  >
                    {/* Código & Descripción */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : c.estado === 'Activo'
                                ? 'bg-zinc-100 text-zinc-900 border-zinc-200 group-hover:bg-zinc-950 group-hover:text-white'
                                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                          )}
                        >
                          <CouponIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-zinc-950 tracking-wide">
                              {c.code}
                            </span>
                            {onCopyCode && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation()
                                  onCopyCode(c.code)
                                }}
                                className="p-1 rounded hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-950 cursor-pointer"
                                title="Copiar código"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10.5px] font-medium text-zinc-400 truncate max-w-[190px]">
                            {c.desc || 'Descuento general de tienda'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Aplicación */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10.5px] font-bold">
                        {c.tipo}
                      </span>
                    </td>

                    {/* Beneficio */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-black text-zinc-950">{c.valor}</div>
                      <span className="text-[10px] font-medium text-zinc-400">
                        {c.tipoDesc}
                      </span>
                    </td>

                    {/* Usos */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 font-bold text-[11px] tabular-nums">
                        {c.usos}
                      </span>
                    </td>

                    {/* Vigencia */}
                    <td className="py-3 px-3 whitespace-nowrap text-[11px] font-medium text-zinc-500">
                      {c.validoHasta}
                    </td>

                    {/* Estado (Click to Toggle) */}
                    <td
                      className="py-3 px-3 whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleStatus(c)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all',
                          c.estado === 'Activo' &&
                            'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
                          c.estado === 'Programado' &&
                            'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
                          c.estado === 'Inactivo' &&
                            'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200'
                        )}
                        title="Haz clic para activar o pausar"
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            c.estado === 'Activo' && 'bg-emerald-500',
                            c.estado === 'Programado' && 'bg-amber-500',
                            c.estado === 'Inactivo' && 'bg-zinc-400'
                          )}
                        />
                        {c.estado}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td
                      className="py-3 px-4 whitespace-nowrap text-right"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1">
                        {onCopyPromoText && (
                          <button
                            type="button"
                            onClick={() => onCopyPromoText(c)}
                            className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 cursor-pointer transition-colors"
                            title="Copiar mensaje promocional para WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenEdit(c)}
                          className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting === c.id}
                          onClick={() => onDelete(c.id)}
                          className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40"
                          title="Eliminar cupón"
                        >
                          {isDeleting === c.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pie fijo de paginación */}
      <div className="h-11 px-4 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between text-[11px] font-semibold text-zinc-500 shrink-0">
        <span>
          {filteredCoupons.length > 0
            ? `Mostrando ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredCoupons.length)} de ${filteredCoupons.length} descuentos`
            : '0 descuentos'}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-zinc-700 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
