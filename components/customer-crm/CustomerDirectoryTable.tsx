'use client'

import React from 'react'
import {
  Search,
  User,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  MapPin,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerRecord } from './types'
import type { SortMode } from './useCustomerCRMState'

interface CustomerDirectoryTableProps {
  search: string
  setSearch: (value: string) => void
  segmentFilter: string
  setSegmentFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  sortBy?: SortMode
  setSortBy?: (value: SortMode) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  paginatedCustomers: CustomerRecord[]
  filteredCount: number
  selectedCustomerKey: string | null
  onSelectCustomer: (key: string) => void
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  startIndex: number
  itemsPerPage: number
}

export function CustomerDirectoryTable({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortBy = 'recent',
  setSortBy,
  hasActiveFilters,
  onClearFilters,
  paginatedCustomers,
  filteredCount,
  selectedCustomerKey,
  onSelectCustomer,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  itemsPerPage,
}: CustomerDirectoryTableProps) {
  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-white overflow-hidden">
      {/* Sub-barra fija de Búsqueda, Filtro Pagado/Intención y Ordenamiento */}
      <div className="px-4 py-2.5 border-b border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, WhatsApp, producto en intención o ciudad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg pl-9 pr-8 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Filter Pills & Sort */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
            {[
              { id: 'Todos', label: 'Todos' },
              { id: 'Pagado', label: 'Compraron y Pagaron' },
              { id: 'Intención', label: 'Solo Intención (Sin pago)' },
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={cn(
                  'h-6 px-2.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border-0',
                  statusFilter === st.id
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                {st.label}
              </button>
            ))}
          </div>

          {setSortBy && (
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute left-2.5 pointer-events-none" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortMode)}
                className="h-7 pl-7 pr-2.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg text-[11px] font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="recent">Más recientes</option>
                <option value="ltv">Mayor monto pagado</option>
                <option value="intent">Mayor intención pendiente</option>
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-bold text-zinc-600 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[820px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur-xs border-b border-zinc-200">
            <tr className="text-[10px] font-black uppercase tracking-wider text-zinc-400 select-none">
              <th className="py-2.5 px-4">Cliente / Prospecto</th>
              <th className="py-2.5 px-3">WhatsApp & Ubicación</th>
              <th className="py-2.5 px-3">Resultado Comercial</th>
              <th className="py-2.5 px-3">Detalle / Intención</th>
              <th className="py-2.5 px-3 text-right">Valor Pagado / En Intención</th>
              <th className="py-2.5 px-4 text-right">Última Actividad</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 text-xs">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-zinc-400 select-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-900">
                      Aún no hay compradores ni intenciones registradas con este filtro
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-sm">
                      Aquí aparecerán automáticamente las personas que compren en tu tienda o inicien una intención de compra.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((c, idx) => {
                const isSelected = selectedCustomerKey === c.customerKey
                const hasPaid = c.paidOrders > 0

                return (
                  <tr
                    key={c.customerKey || `${c.name}-${idx}`}
                    onClick={() => onSelectCustomer(c.customerKey)}
                    className={cn(
                      'transition-colors cursor-pointer group',
                      isSelected ? 'bg-zinc-950/[0.04]' : 'hover:bg-zinc-50/80'
                    )}
                  >
                    {/* Cliente + Avatar */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl text-[11px] font-black flex items-center justify-center shrink-0 transition-colors border',
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : hasPaid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                          )}
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-950 truncate max-w-[180px]">
                            {c.name}
                          </div>
                          <div className="text-[10.5px] font-medium text-zinc-400 truncate max-w-[180px]">
                            {c.email || (hasPaid ? 'Comprador verificado' : 'Prospecto con intención')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* WhatsApp & Ciudad */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-800 tabular-nums">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>+{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10.5px] font-medium text-zinc-400 italic">
                            Sin teléfono
                          </span>
                        )}
                        {c.city && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate max-w-[130px]">{c.city}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Resultado Comercial (Compró y Pagó vs Intención) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {hasPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {c.paidOrders >= 2
                            ? `★ Frecuente (${c.paidOrders} pagos)`
                            : 'Compró y pagó'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Intención de compra
                        </span>
                      )}
                    </td>

                    {/* Detalle de Compra o Intención */}
                    <td className="py-3 px-3">
                      <div className="max-w-[230px] truncate text-[11px] font-medium text-zinc-600">
                        {hasPaid ? (
                          <span>
                            {c.paidOrders} {c.paidOrders === 1 ? 'pedido pagado' : 'pedidos pagados'}
                            {c.intentOrders > 0 ? ` · +${c.intentOrders} en intención` : ''}
                          </span>
                        ) : (
                          <span className="text-amber-900 font-semibold">
                            {c.intentDetail || 'Inició pedido sin completar pago'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Valor Pagado vs Monto en Intención */}
                    <td className="py-3 px-3 whitespace-nowrap text-right tabular-nums">
                      {hasPaid ? (
                        <div>
                          <span className="font-black text-zinc-950 block">
                            ${c.totalSpent.toLocaleString('es-CO')}
                          </span>
                          {c.intentAmount > 0 && (
                            <span className="text-[10px] font-bold text-amber-700 block">
                              +${c.intentAmount.toLocaleString('es-CO')} en intención
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-amber-800 block">
                            ${c.intentAmount.toLocaleString('es-CO')} en intención
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400 block">
                            $0 pagado
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Última actividad */}
                    <td className="py-3 px-4 whitespace-nowrap text-right text-[11px] font-medium text-zinc-500">
                      {new Date(c.lastOrderDate).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
          {filteredCount > 0
            ? `Mostrando ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredCount)} de ${filteredCount} registros`
            : '0 registros'}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-zinc-700 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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
