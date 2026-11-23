'use client'

import React from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileCheck2,
  CreditCard,
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
  selectedPaymentId?: string | null
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
  formatCurrency,
  selectedPaymentId,
  onSelectPayment,
}: PagosTableProps) {
  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-white overflow-hidden">
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[820px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur-xs border-b border-zinc-200">
            <tr className="text-[10px] font-black uppercase tracking-wider text-zinc-400 select-none">
              <th className="py-2.5 px-4">Orden & Referencia</th>
              <th className="py-2.5 px-3">Cliente</th>
              <th className="py-2.5 px-3">Detalle del Pedido</th>
              <th className="py-2.5 px-3">Método de Cobro</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3 text-right">Fecha</th>
              <th className="py-2.5 px-4 text-right">Monto</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-400 select-none">
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-700" />
                    <span>Sincronizando libro de transacciones...</span>
                  </div>
                </td>
              </tr>
            ) : totalPaymentsCount === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-400 select-none">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-900">
                      No se encontraron transacciones con este filtro
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Los pagos recibidos por Mercado Pago, Stripe, Bre-B o Contra Entrega aparecerán aquí.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPayments.map(p => {
                const MetodoIcon = p.metodo.icon
                const isSelected = selectedPaymentId === p.id

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPayment(p)}
                    className={cn(
                      'transition-colors cursor-pointer group',
                      isSelected ? 'bg-zinc-950/[0.04]' : 'hover:bg-zinc-50/80'
                    )}
                  >
                    {/* Orden & Referencia */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : p.estado === 'Exitoso'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : p.estado === 'Por Validar'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : p.estado === 'Fallido'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          )}
                        >
                          {p.estado === 'Exitoso' && <CheckCircle2 className="w-4 h-4" />}
                          {p.estado === 'Por Validar' && <FileCheck2 className="w-4 h-4" />}
                          {p.estado === 'Pendiente' && <Clock className="w-4 h-4" />}
                          {p.estado === 'Fallido' && <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-zinc-950">
                              {p.pedido}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                              {p.source}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-mono font-medium text-zinc-400 truncate max-w-[140px]">
                            Ref: {p.ref}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-950 truncate max-w-[160px]">
                          {p.cliente.name}
                        </div>
                        <div className="text-[10.5px] font-medium text-zinc-400 tabular-nums">
                          {p.cliente.phone ? `+${p.cliente.phone}` : 'Sin teléfono'}
                        </div>
                      </div>
                    </td>

                    {/* Detalle del Pedido */}
                    <td className="py-3 px-3">
                      <div className="max-w-[200px] truncate font-medium text-zinc-700">
                        {p.itemsSummary}
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {p.prodCount} {p.prodCount === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </td>

                    {/* Método de Cobro */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/80 text-zinc-800 font-bold text-[11px]">
                        <MetodoIcon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span>{p.metodo.label}</span>
                        {p.proofImageUrl && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-blue-600"
                            title="Comprobante adjunto"
                          />
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                          p.estado === 'Exitoso' &&
                            'bg-emerald-50 border-emerald-200 text-emerald-700',
                          p.estado === 'Por Validar' &&
                            'bg-blue-50 border-blue-200 text-blue-700',
                          p.estado === 'Pendiente' &&
                            'bg-amber-50 border-amber-200 text-amber-800',
                          p.estado === 'Fallido' &&
                            'bg-rose-50 border-rose-200 text-rose-700'
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            p.estado === 'Exitoso' && 'bg-emerald-500',
                            p.estado === 'Por Validar' && 'bg-blue-600 animate-pulse',
                            p.estado === 'Pendiente' && 'bg-amber-500',
                            p.estado === 'Fallido' && 'bg-rose-500'
                          )}
                        />
                        {p.estado === 'Exitoso' ? 'Pagado' : p.estado}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-3 whitespace-nowrap text-right text-[11px] font-medium text-zinc-500">
                      {p.fecha}
                    </td>

                    {/* Monto */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-black text-zinc-950 tabular-nums">
                      ${formatCurrency(p.monto)}
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
          {totalPaymentsCount > 0
            ? `Mostrando ${startIndex + 1}–${Math.min(endIndex, totalPaymentsCount)} de ${totalPaymentsCount} transacciones`
            : '0 transacciones'}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
