'use client'

import React from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Mail,
  X,
  ChevronRight,
  MapPin,
  Calendar,
  Edit3,
  Copy,
  ShoppingBag,
  StickyNote,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { CustomerRecord, SerializedOrder } from './types'

interface CustomerDetailPanelProps {
  customer: CustomerRecord | null
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
  totalOrdersCount,
  visibleCustomerOrders,
  showAllHistory,
  onToggleShowAllHistory,
  onStartEdit,
  onClose,
}: CustomerDetailPanelProps) {
  if (!customer) {
    return (
      <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 h-full bg-white border-l border-zinc-200 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-11 h-11 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mb-3">
          <UserCheck className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-extrabold text-zinc-950">
          Ficha de Comprador / Intención
        </h4>
        <p className="text-[11px] text-zinc-400 mt-1 max-w-[230px] leading-relaxed">
          Selecciona cualquier registro para ver qué compró y pagó o cuál fue su intención de compra.
        </p>
      </aside>
    )
  }

  const hasPaid = customer.paidOrders > 0

  const copyPhone = () => {
    if (!customer.phone) return
    navigator.clipboard.writeText(`+${customer.phone}`)
    toast.success('Teléfono copiado al portapapeles')
  }

  return (
    <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 h-full bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col overflow-hidden">
      {/* Cabecera Fija del Perfil */}
      <div className="p-4 border-b border-zinc-200 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs',
              hasPaid ? 'bg-zinc-950 text-white' : 'bg-amber-100 text-amber-900 border border-amber-200'
            )}
          >
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-zinc-950 truncate max-w-[180px]">
                {customer.name}
              </h3>
              {hasPaid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Comprador
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-2.5 h-2.5" />
                  Intención de compra
                </span>
              )}
            </div>

            {customer.phone ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-zinc-600 tabular-nums">
                  +{customer.phone}
                </span>
                <button
                  type="button"
                  onClick={copyPhone}
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                  title="Copiar número"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 mt-1">Sin teléfono WhatsApp</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onStartEdit}
            className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            title="Completar notas o datos del cliente"
          >
            <Edit3 className="w-3 h-3" />
            <span>Notas</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 flex items-center justify-center cursor-pointer transition-colors lg:hidden"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cinta Financiera: Compras Pagadas vs Intención Pendiente */}
      <div className="grid grid-cols-3 bg-zinc-50/70 border-b border-zinc-200 divide-x divide-zinc-200 shrink-0">
        <div className="p-3 text-center">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
            Pagados
          </span>
          <span className="text-sm font-black text-emerald-700 tabular-nums block mt-0.5">
            {customer.paidOrders} (${customer.totalSpent.toLocaleString('es-CO')})
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
            En Intención
          </span>
          <span className="text-sm font-black text-amber-800 tabular-nums block mt-0.5">
            {customer.intentOrders} (${customer.intentAmount.toLocaleString('es-CO')})
          </span>
        </div>
        <div className="p-3 text-center">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
            Estado
          </span>
          <span className="text-xs font-extrabold text-zinc-900 block mt-1">
            {hasPaid ? 'Cliente Real' : 'Por convertir'}
          </span>
        </div>
      </div>

      {/* Cuerpo Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Banner de Intención de Compra si tiene pedidos o carritos sin pagar */}
        {customer.intentAmount > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Intención de Compra Detectada
              </span>
              <span className="text-xs font-black text-amber-950 tabular-nums">
                ${customer.intentAmount.toLocaleString('es-CO')}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-amber-900/90 leading-snug">
              {customer.intentDetail || 'Inició el proceso de compra pero aún no registra pago confirmado.'}
            </p>
          </div>
        )}

        {/* Historial de Pedidos e Intenciones */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-zinc-500" />
              Compras e Intenciones ({totalOrdersCount})
            </span>
            {totalOrdersCount > 6 && (
              <button
                type="button"
                onClick={onToggleShowAllHistory}
                className="text-[10.5px] font-bold text-zinc-700 hover:text-zinc-950 cursor-pointer"
              >
                {showAllHistory ? 'Ver menos' : 'Ver todas'}
              </button>
            )}
          </div>

          {totalOrdersCount === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40 text-left space-y-1">
              <p className="text-xs font-bold text-zinc-800">
                Intención desde conversación de WhatsApp
              </p>
              <p className="text-[11px] text-zinc-500">
                {customer.intentDetail || 'El prospecto interactuó con el asistente de la tienda sin finalizar orden.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleCustomerOrders.map(order => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <Link
                    key={order.id}
                    href={order.paymentStatus === 'UPLOADED' ? '/verificaciones' : '/pedidos'}
                    className="block p-3 rounded-xl bg-zinc-50/60 hover:bg-zinc-100/80 border border-zinc-200/80 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-950 font-mono">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[9.5px] font-bold border',
                            order.isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.paymentStatus === 'UPLOADED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                          )}
                        >
                          {order.isPaid
                            ? 'Compró y pagó'
                            : order.paymentStatus === 'UPLOADED'
                              ? 'Comprobante por validar'
                              : 'Intención (Sin pago)'}
                        </span>
                        <span className="text-xs font-black text-zinc-950 tabular-nums">
                          ${order.total.toLocaleString('es-CO')}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>

                    <p className="text-[11px] font-medium text-zinc-500 truncate">
                      {order.itemsSummary}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Datos de Contacto */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
            Datos Registrados en Checkout
          </span>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 divide-y divide-zinc-200/70 text-xs">
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Correo
              </span>
              <span className="font-semibold text-zinc-900 truncate max-w-[200px]">
                {customer.email || 'Sin registrar'}
              </span>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                Ciudad / Destino
              </span>
              <span className="font-semibold text-zinc-900 truncate max-w-[200px]">
                {customer.city || 'Sin registrar'}
              </span>
            </div>
            {customer.birthDate && (
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Cumpleaños
                </span>
                <span className="font-semibold text-zinc-900">{customer.birthDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notas Internas */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <StickyNote className="w-3 h-3 text-zinc-500" />
            Notas de Seguimiento
          </span>
          <div
            onClick={onStartEdit}
            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200/80 text-xs text-zinc-700 font-medium leading-relaxed cursor-pointer transition-colors"
          >
            {customer.notes || 'Haz clic para añadir una nota de seguimiento sobre este comprador o intención.'}
          </div>
        </div>
      </div>

      {/* Pie Fijo: Seguimiento por CRM o WhatsApp */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50/60 grid grid-cols-2 gap-2 shrink-0">
        <Link
          href="/conversaciones"
          className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-zinc-600" />
          <span>Ver en CRM</span>
        </Link>

        {customer.phone ? (
          <a
            href={`https://wa.me/${customer.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{hasPaid ? 'Escribir por WA' : 'Recuperar Venta'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <Link
            href="/pedidos"
            className="h-9 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ver Pedidos</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
