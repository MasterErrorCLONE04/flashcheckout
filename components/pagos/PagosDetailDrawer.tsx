'use client'

import React from 'react'
import Link from 'next/link'
import {
  X,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  FileText,
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Loader2,
  Ban,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Payment } from './types'

interface PagosDetailDrawerProps {
  selectedPayment: Payment | null
  onClose: () => void
  copiedRef: boolean
  onCopyRef: (ref: string) => void
  confirmingRefund: boolean
  setConfirmingRefund: (val: boolean) => void
  onApprovePayment?: (id: string) => void
  onRefund: (id: string) => void
  onDownloadReceipt: (id?: string) => void
  formatCurrency: (val: number) => string
  updatingStatusId?: string | null
}

export function PagosDetailDrawer({
  selectedPayment,
  onClose,
  copiedRef,
  onCopyRef,
  confirmingRefund,
  setConfirmingRefund,
  onApprovePayment,
  onRefund,
  onDownloadReceipt,
  formatCurrency,
  updatingStatusId,
}: PagosDetailDrawerProps) {
  if (!selectedPayment) {
    return (
      <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 h-full bg-white border-l border-zinc-200 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-11 h-11 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mb-3">
          <CreditCard className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-extrabold text-zinc-950">
          Inspector de Transacción
        </h4>
        <p className="text-[11px] text-zinc-400 mt-1 max-w-[230px] leading-relaxed">
          Selecciona cualquier pago de la tabla para ver su comprobante Bre-B, aprobar el recaudo o descargar la factura.
        </p>
      </aside>
    )
  }

  const isUpdating = updatingStatusId === selectedPayment.id

  return (
    <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 h-full bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col overflow-hidden">
      {/* Cabecera Fija de la Transacción */}
      <div className="p-4 border-b border-zinc-200 flex items-start justify-between gap-3 shrink-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-black text-zinc-950">
              {selectedPayment.pedido}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[9.5px] font-bold border',
                selectedPayment.estado === 'Exitoso' &&
                  'bg-emerald-50 border-emerald-200 text-emerald-700',
                selectedPayment.estado === 'Por Validar' &&
                  'bg-blue-50 border-blue-200 text-blue-700',
                selectedPayment.estado === 'Pendiente' &&
                  'bg-amber-50 border-amber-200 text-amber-800',
                selectedPayment.estado === 'Fallido' &&
                  'bg-rose-50 border-rose-200 text-rose-700'
              )}
            >
              {selectedPayment.estado === 'Exitoso' ? 'Pagado' : selectedPayment.estado}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">
              {selectedPayment.fecha}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono truncate">
            ID: {selectedPayment.id}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 flex items-center justify-center cursor-pointer lg:hidden"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bloque Principal de Monto */}
      <div className="px-4 py-3.5 bg-zinc-50/70 border-b border-zinc-200 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
            Valor de la Orden
          </span>
          <span className="text-2xl font-black text-zinc-950 tracking-tight tabular-nums block mt-0.5">
            ${formatCurrency(selectedPayment.monto)} COP
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
            Método
          </span>
          <span className="text-xs font-bold text-zinc-900 block mt-0.5">
            {selectedPayment.metodo.label}
          </span>
        </div>
      </div>

      {/* Contenido Scrollable del Inspector */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Visor de Comprobante Bre-B / Transferencia (si existe proofImageUrl) */}
        {selectedPayment.proofImageUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                Comprobante de Pago Adjunto
              </span>
              <a
                href={selectedPayment.proofImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10.5px] font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1"
              >
                <span>Abrir original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <a
              href={selectedPayment.proofImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 max-h-56 flex items-center justify-center"
            >
              <img
                src={selectedPayment.proofImageUrl}
                alt="Comprobante de pago"
                className="w-full h-auto max-h-56 object-contain"
              />
            </a>
          </div>
        )}

        {/* Acciones Rápidas de Aprobación cuando está Pendiente o Por Validar */}
        {(selectedPayment.estado === 'Por Validar' || selectedPayment.estado === 'Pendiente') &&
          onApprovePayment && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
              <p className="text-[11px] font-semibold text-emerald-950 leading-snug">
                {selectedPayment.proofImageUrl
                  ? 'El cliente subió soporte de transferencia. Verifica el ingreso en tu cuenta y aprueba el pago.'
                  : '¿Ya recibiste el pago de esta orden por transferencia o efectivo?'}
              </p>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onApprovePayment(selectedPayment.id)}
                className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Confirmar Pago Recibido</span>
              </button>
            </div>
          )}

        {/* Cliente Asociado */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
            Datos del Comprador
          </span>
          <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-black text-xs flex items-center justify-center shrink-0">
                {selectedPayment.cliente.initials}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-950 truncate">
                  {selectedPayment.cliente.name}
                </h4>
                <p className="text-[11px] font-medium text-zinc-500 tabular-nums mt-0.5">
                  {selectedPayment.cliente.phone
                    ? `+${selectedPayment.cliente.phone}`
                    : 'Sin teléfono registrado'}
                </p>
              </div>
            </div>

            {selectedPayment.cliente.phone && (
              <a
                href={`https://wa.me/${selectedPayment.cliente.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold inline-flex items-center gap-1 shrink-0 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Detalles Técnicos del Cobro */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
            Trazabilidad de Cobro
          </span>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 divide-y divide-zinc-200/70 text-xs">
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-medium">Canal de origen</span>
              <span className="font-bold text-zinc-900">{selectedPayment.source}</span>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-medium">Referencia</span>
              <button
                type="button"
                onClick={() => onCopyRef(selectedPayment.ref)}
                className="inline-flex items-center gap-1.5 font-mono font-bold text-zinc-900 hover:underline cursor-pointer"
              >
                <span className="truncate max-w-[160px]">{selectedPayment.ref}</span>
                {copiedRef ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-zinc-400" />
                )}
              </button>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-medium">ID de Pasarela</span>
              <span className="font-mono text-[11px] font-semibold text-zinc-600 truncate max-w-[170px]">
                {selectedPayment.gatewayId || 'Cobro directo / Manual'}
              </span>
            </div>
          </div>
        </div>

        {/* Artículos del Pedido */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-zinc-500" />
              Pedido Asociado ({selectedPayment.prodCount} uds)
            </span>
            <Link
              href="/pedidos"
              className="text-[10.5px] font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1"
            >
              <span>Abrir en Pedidos</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/40 text-xs font-semibold text-zinc-800 leading-relaxed">
            {selectedPayment.itemsSummary}
          </div>
        </div>
      </div>

      {/* Pie Fijo con Acciones del Recibo y Anulación */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50/60 space-y-2 shrink-0">
        {confirmingRefund ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5 text-left">
            <p className="text-[11px] font-semibold text-rose-800 leading-snug">
              ¿Confirmas anular o marcar como fallida esta transacción?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onRefund(selectedPayment.id)}
                className="flex-1 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                {isUpdating ? 'Procesando...' : 'Sí, anular'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRefund(false)}
                className="h-8 px-3 border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onDownloadReceipt(selectedPayment.id)}
              className="h-9 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Recibo / Factura</span>
            </button>

            {selectedPayment.estado !== 'Fallido' ? (
              <button
                type="button"
                onClick={() => setConfirmingRefund(true)}
                className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Anular Cobro</span>
              </button>
            ) : (
              <Link
                href="/verificaciones"
                className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Verificaciones</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
