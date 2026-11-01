'use client'

import Link from 'next/link'
import { MessageCircle, Mail, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerRecord, SerializedOrder } from './types'

interface CustomerDetailPanelProps {
  customer: CustomerRecord
  activeAverageTicket: number
  totalOrdersCount: number
  visibleCustomerOrders: SerializedOrder[]
  showAllHistory: boolean
  onToggleShowAllHistory: () => void
  onStartEdit: () => void
  onClose: () => void
}

export function CustomerDetailPanel({
  customer,
  activeAverageTicket,
  totalOrdersCount,
  visibleCustomerOrders,
  showAllHistory,
  onToggleShowAllHistory,
  onStartEdit,
  onClose,
}: CustomerDetailPanelProps) {
  return (
    <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-lg p-5.5 space-y-5 animate-in slide-in-from-right-3 duration-250 sticky top-[75px]">
      {/* Header section with Close Trigger */}
      <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          {/* Big avatar circle */}
          <div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-600 ">
            {customer.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-zinc-955 leading-none">{customer.name}</h4>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[8px] font-black  tracking-wider',
                  customer.status === 'Activo'
                    ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                    : 'text-zinc-550 bg-zinc-100 border border-zinc-200'
                )}
              >
                {customer.status}
              </span>
            </div>
            {customer.phone && (
              <a
                href={`https://wa.me/${customer.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-zinc-400 hover:text-emerald-600 font-semibold tracking-wide flex items-center gap-1 mt-1 leading-none transition-colors"
              >
                <MessageCircle className="w-3 h-3 text-emerald-500 fill-current" />
                <span>+{customer.phone}</span>
              </a>
            )}
            <p className="text-[9px] text-zinc-400 mt-1 flex items-center gap-1 font-semibold">
              <Mail className="w-2.5 h-2.5" />
              <span>{customer.email || 'Sin email registrado'}</span>
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border border-zinc-200 bg-white"
          title="Cerrar panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Metrics Row (3 Columns) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
          <p className="text-[9px] font-extrabold text-zinc-400  tracking-wider">Pedidos</p>
          <p className="text-xs font-black text-zinc-850 tabular-nums">{customer.totalOrders}</p>
          <p className="text-[8px] font-extrabold text-zinc-400 leading-none pt-1">Historial real</p>
        </div>

        <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
          <p className="text-[9px] font-extrabold text-zinc-400  tracking-wider">Total gastado</p>
          <p className="text-xs font-black text-zinc-850 truncate max-w-full tabular-nums">
            ${customer.totalSpent.toLocaleString('es-CO')}
          </p>
          <p className="text-[8px] font-extrabold text-zinc-400 leading-none pt-1">Pedidos sumados</p>
        </div>

        <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
          <p className="text-[9px] font-extrabold text-zinc-400  tracking-wider">Ticket prom.</p>
          <p className="text-xs font-black text-zinc-850 tabular-nums">
            ${activeAverageTicket.toLocaleString('es-CO')}
          </p>
          <p className="text-[8px] font-extrabold text-zinc-400 leading-none pt-1">Promedio real</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
          <h5 className="text-[10px] font-extrabold text-zinc-450  tracking-wider">Información personal</h5>
          <button
            onClick={onStartEdit}
            className="text-[9px] font-bold text-zinc-500 hover:text-zinc-950 px-2 py-0.5 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Editar
          </button>
        </div>

        <div className="space-y-3.5 text-[11px] font-semibold text-zinc-850">
          <div className="grid grid-cols-2 py-1">
            <span className="text-zinc-400 font-medium">Fecha de nacimiento</span>
            <span className="text-right">{customer.birthDate || 'Sin registrar'}</span>
          </div>
          <div className="grid grid-cols-2 py-1 border-t border-zinc-50">
            <span className="text-zinc-400 font-medium">Ciudad</span>
            <span className="text-right">{customer.city || 'Sin registrar'}</span>
          </div>
          <div className="flex flex-col gap-1.5 py-1 border-t border-zinc-50">
            <span className="text-zinc-400 font-medium">Notas de fidelidad</span>
            <p className="text-[10px] text-zinc-650 leading-relaxed font-medium bg-zinc-50 p-2.5 border border-zinc-200/50 rounded-lg">
              {customer.notes || 'Sin notas registradas.'}
            </p>
          </div>
        </div>
      </div>

      {/* Purchase History Timeline */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
          <h5 className="text-[10px] font-extrabold text-zinc-450  tracking-wider">Historial de compras</h5>
          {totalOrdersCount > 5 && (
            <button
              onClick={onToggleShowAllHistory}
              className="text-[9px] font-bold text-emerald-600 hover:underline"
            >
              {showAllHistory ? 'Ver menos' : 'Ver todas'}
            </button>
          )}
        </div>

        {totalOrdersCount === 0 ? (
          <p className="text-center text-[10px] font-medium text-zinc-400 py-3">No hay compras registradas</p>
        ) : (
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {visibleCustomerOrders.map(order => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2.5 bg-zinc-50/40 rounded-lg border border-zinc-200/50 hover:border-zinc-300 transition-colors text-[10px]"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-950">#PAY-{order.id.slice(-4).toUpperCase()}</span>
                    <span className="text-[9px] text-zinc-400 font-medium mt-0.5">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[8px] font-extrabold leading-none',
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : order.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      )}
                    >
                      {order.status === 'delivered'
                        ? 'Entregado'
                        : order.status === 'cancelled'
                        ? 'Cancelado'
                        : 'Pendiente'}
                    </span>
                    <span className="font-bold text-zinc-900 tabular-nums">
                      ${order.total.toLocaleString('es-CO')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-350" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Complete history link button */}
      <Link
        href="/pedidos"
        className="w-full h-10 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 font-bold rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Ver historial completo</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

