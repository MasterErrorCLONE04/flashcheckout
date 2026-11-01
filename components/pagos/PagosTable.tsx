'use client'

import {
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Payment } from './types'

interface PagosTableProps {
  loading: boolean
  totalPaymentsCount: number
  paginatedPayments: Payment[]
  startIndex: number
  endIndex: number
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  rowsPerPage: number
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
  formatCurrency: (val: number) => string
  onSelectPayment: (payment: Payment) => void
}

export function PagosTable({
  loading,
  totalPaymentsCount,
  paginatedPayments,
  startIndex,
  endIndex,
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  formatCurrency,
  onSelectPayment,
}: PagosTableProps) {
  return (
    <>
      {/* TRANSACTIONS TABLE */}
      <div className="overflow-x-auto border border-zinc-150 rounded-lg bg-white">
        <table className="w-full min-w-[850px] text-left border-collapse text-xs xl:text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] xl:text-xs font-bold text-zinc-500 select-none">
              <th className="py-3 px-2.5 xl:px-4">Pago</th>
              <th className="py-3 px-2.5 xl:px-4">Cliente</th>
              <th className="py-3 px-2.5 xl:px-4">Pedido</th>
              <th className="py-3 px-2.5 xl:px-4">Método de pago</th>
              <th className="py-3 px-2.5 xl:px-4">Estado</th>
              <th className="py-3 px-2.5 xl:px-4">Fecha</th>
              <th className="py-3 px-2.5 xl:px-4">Monto</th>
              <th className="py-3 px-2.5 xl:px-4 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#6F42C1]" />
                    <span>Cargando transacciones reales...</span>
                  </div>
                </td>
              </tr>
            ) : totalPaymentsCount === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400 font-medium select-none">
                  No se encontraron registros de pagos.
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p, idx) => {
                const MetodoIcon = p.metodo.icon
                return (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Payment reference */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {p.estado === 'Exitoso' && <CheckCircle className="w-4 h-4 text-zinc-500 shrink-0" />}
                        {p.estado === 'Pendiente' && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                        {p.estado === 'Fallido' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-900 leading-tight text-xs xl:text-sm">{p.id}</h4>
                          <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 select-all">Ref: {p.ref}</p>
                        </div>
                      </div>
                    </td>

                    {/* Client profile */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none", p.cliente.bg)}>
                          {p.cliente.initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-900 leading-tight text-xs xl:text-sm">{p.cliente.name}</h4>
                          <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5">{p.cliente.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Pedido */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#6F42C1] hover:underline cursor-pointer">{p.pedido}</span>
                        <span className="text-[9px] font-semibold text-zinc-450 mt-0.5">{p.prodCount} productos</span>
                      </div>
                    </td>

                    {/* Método de pago */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7.5 h-7.5 rounded-lg flex items-center justify-center border shrink-0", p.metodo.iconBg, p.metodo.iconColor)}>
                          <MetodoIcon className="w-4 h-4" />
                        </div>
                        <span className="text-zinc-800 text-[11px] xl:text-xs">{p.metodo.label}</span>
                      </div>
                    </td>

                    {/* Estado Capsule */}
                    <td className="py-3 px-2.5 xl:px-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none",
                        p.estado === 'Exitoso' && 'bg-zinc-100 border border-zinc-200 text-zinc-800',
                        p.estado === 'Pendiente' && 'bg-amber-50 border border-amber-100 text-amber-700',
                        p.estado === 'Fallido' && 'bg-red-50 border border-red-100 text-red-700'
                      )}>
                        {p.estado}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap text-zinc-650">{p.fecha}</td>

                    {/* Monto */}
                    <td className="py-3 px-2.5 xl:px-4 whitespace-nowrap font-bold text-zinc-900 text-xs xl:text-sm">
                      ${formatCurrency(p.monto)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2.5 xl:px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onSelectPayment(p)} 
                          className="px-3 py-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-lg transition-all cursor-pointer select-none"
                        >
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
        <span>Mostrando {totalPaymentsCount > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, totalPaymentsCount)} de {totalPaymentsCount} pagos</span>
        
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "px-2.5 py-1 rounded transition-all cursor-pointer text-xs font-bold",
                currentPage === page 
                  ? "bg-zinc-900 border border-zinc-900 text-white font-extrabold" 
                  : "border border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {page}
            </button>
          ))}
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
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
    </>
  )
}
