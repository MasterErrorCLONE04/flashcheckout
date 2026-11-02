'use client'

import {
  Search,
  User,
  MessageCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerRecord } from './types'

interface CustomerDirectoryTableProps {
  hasDetailOpen: boolean
  search: string
  setSearch: (value: string) => void
  segmentFilter: string
  setSegmentFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
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
  hasDetailOpen,
  search,
  setSearch,
  segmentFilter,
  setSegmentFilter,
  statusFilter,
  setStatusFilter,
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
    <div
      className={cn(
        'premium-card p-6 bg-white border border-zinc-200/80 rounded-lg space-y-4 transition-all duration-300',
        hasDetailOpen ? 'lg:col-span-8' : 'lg:col-span-12'
      )}
    >
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

        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 transition-colors shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          <span>{hasActiveFilters ? 'Limpiar filtros' : 'Filtros'}</span>
        </button>
      </div>

      {/* Customer CRM Table */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white">
        <table className="w-full min-w-[850px] text-left border-collapse text-xs xl:text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] xl:text-xs font-bold text-zinc-500 select-none">
              <th className="py-3 px-2.5 xl:px-4">Cliente</th>
              <th className="py-3 px-2.5 xl:px-4">Contacto</th>
              <th className="py-3 px-2.5 xl:px-4">Última interacción</th>
              <th className="py-3 px-2.5 xl:px-4">Pedidos</th>
              <th className="py-3 px-2.5 xl:px-4">Ingresos (Lifetime Value)</th>
              <th className="py-3 px-2.5 xl:px-4">Estado</th>
              <th className="py-3 px-2.5 xl:px-4 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400 font-medium select-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="w-8 h-8 text-zinc-200" />
                    <span>No se encontraron clientes registrados en el directorio</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((c, idx) => {
                const isSelected = selectedCustomerKey === c.customerKey
                return (
                  <tr
                    key={c.customerKey || `${c.name}-${idx}`}
                    onClick={() => onSelectCustomer(c.customerKey)}
                    className={cn(
                      'hover:bg-zinc-50/50 transition-colors relative cursor-pointer group/row',
                      isSelected && 'bg-zinc-50'
                    )}
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-extrabold text-zinc-600 flex items-center justify-center shrink-0 select-none">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-900 leading-tight text-xs xl:text-sm truncate max-w-[160px]">{c.name}</h4>
                          <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 truncate max-w-[160px]">{c.email || 'Sin email registrado'}</p>
                        </div>
                      </div>
                    </td>

                    {/* WhatsApp Phone */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 text-zinc-800">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                          <span className="tabular-nums">+{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-300 italic">Sin teléfono</span>
                      )}
                    </td>

                    {/* Last order date */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap text-zinc-600">
                      {new Date(c.lastOrderDate).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Order count */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap text-zinc-800 tabular-nums">
                      {c.totalOrders}
                    </td>

                    {/* Lifetime Value LTV */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap font-bold text-zinc-900 text-xs xl:text-sm tabular-nums">
                      ${c.totalSpent.toLocaleString('es-CO')}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-2.5 xl:px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none border',
                          c.status === 'Activo'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        )}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3 px-2.5 xl:px-4 text-center" />
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CRM Directory Pagination Footer */}
      {filteredCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100 text-xs font-semibold text-zinc-500">
          <span>
            Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCount)} de {filteredCount} clientes
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
              if (totalPages > 4 && pageNum > 3 && pageNum < totalPages) {
                if (pageNum === 4) {
                  return (
                    <span key="ellipsis" className="px-2 select-none text-zinc-300">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    currentPage === pageNum
                      ? 'bg-zinc-800 hover:bg-zinc-900 text-white'
                      : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600'
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
  )
}

