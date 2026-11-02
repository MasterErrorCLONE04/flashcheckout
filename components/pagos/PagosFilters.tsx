'use client'

import { Search, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'

interface PagosFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  dateRangeLabel: string
  filterEstado: string
  onEstadoChange: (value: string) => void
  filterMetodo: string
  onMetodoChange: (value: string) => void
}

export function PagosFilters({
  searchQuery,
  onSearchChange,
  dateRangeLabel,
  filterEstado,
  onEstadoChange,
  filterMetodo,
  onMetodoChange,
}: PagosFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* Text Search query */}
      <div className="relative flex-grow">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
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
          onChange={e => onEstadoChange(e.target.value)}
          className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
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
          onChange={e => onMetodoChange(e.target.value)}
          className="bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-xs xl:text-sm font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
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
  )
}
