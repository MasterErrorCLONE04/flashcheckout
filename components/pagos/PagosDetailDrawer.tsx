'use client'

import Link from 'next/link'
import {
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
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
  onRefund: (id: string) => void
  onDownloadReceipt: () => void
  formatCurrency: (val: number) => string
}

export function PagosDetailDrawer({
  selectedPayment,
  onClose,
  copiedRef,
  onCopyRef,
  confirmingRefund,
  setConfirmingRefund,
  onRefund,
  onDownloadReceipt,
  formatCurrency,
}: PagosDetailDrawerProps) {
  if (!selectedPayment) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-zinc-955/20 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 ease-out">
          
          {/* Drawer Content */}
          <div className="flex-1 h-0 overflow-y-auto p-6 space-y-6">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none",
                    selectedPayment.estado === 'Exitoso' && 'bg-zinc-100 border border-zinc-200 text-zinc-800',
                    selectedPayment.estado === 'Pendiente' && 'bg-amber-50 border border-amber-100 text-amber-700',
                    selectedPayment.estado === 'Fallido' && 'bg-red-50 border border-red-100 text-red-700'
                  )}>
                    {selectedPayment.estado}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 select-none">{selectedPayment.fecha}</span>
                </div>
                <h2 className="text-xl font-bold text-zinc-955 tracking-tight">{selectedPayment.id}</h2>
                <p className="text-xs text-zinc-450">Referencia de transacción del checkout</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg border border-zinc-200 hover:bg-zinc-55 text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-px bg-zinc-100 w-full" />

            {/* Amount breakdown */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-4 space-y-3 text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Monto de la transacción</span>
                <span className="text-2xl font-bold text-zinc-900">${formatCurrency(selectedPayment.monto)}</span>
              </div>
              
              <div className="h-px bg-zinc-200/60 w-full" />

              <div className="space-y-2 text-xs font-semibold text-zinc-600">
                <div className="flex justify-between">
                  <span>Comisión de plataforma (1.5% + $900)</span>
                  <span>-${formatCurrency(Math.round(selectedPayment.monto * 0.015 + 900))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retenciones e IVA (ReteICA + ReteIVA)</span>
                  <span>-${formatCurrency(Math.round(selectedPayment.monto * 0.009))}</span>
                </div>
                <div className="h-px bg-zinc-200/60 w-full" />
                <div className="flex justify-between font-bold text-zinc-900 text-sm">
                  <span>Neto a transferir</span>
                  <span>${formatCurrency(Math.round(selectedPayment.monto - (selectedPayment.monto * 0.015 + 900) - (selectedPayment.monto * 0.009)))}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cliente</h3>
              <div className="flex items-center gap-3 bg-white border border-zinc-200/80 rounded-lg p-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", selectedPayment.cliente.bg)}>
                  {selectedPayment.cliente.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-900 leading-tight truncate">{selectedPayment.cliente.name}</h4>
                  <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">{selectedPayment.cliente.phone}</p>
                  <p className="text-[10px] font-semibold text-zinc-400 mt-0.5 truncate">{selectedPayment.cliente.name.toLowerCase().replace(/ /g, '.')}@example.com</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detalles del pago</h3>
              <div className="border border-zinc-200/80 rounded-lg divide-y divide-zinc-100 text-xs font-semibold text-zinc-600 bg-white">
                <div className="flex justify-between p-3">
                  <span>Método de pago</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <span>{selectedPayment.metodo.label}</span>
                  </div>
                </div>
                <div className="flex justify-between p-3 items-center">
                  <span>Referencia de pago</span>
                  <button 
                    onClick={() => onCopyRef(selectedPayment.ref)}
                    className="inline-flex items-center gap-1.5 font-bold text-[#6F42C1] hover:underline cursor-pointer"
                  >
                    <span>{selectedPayment.ref}</span>
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-zinc-850" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  </button>
                </div>
                <div className="flex justify-between p-3">
                  <span>ID de Pasarela</span>
                  <span className="font-mono text-zinc-500 font-bold select-all">mp_{selectedPayment.ref.toLowerCase()}8412</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pedido Asociado</h3>
              <div className="flex items-center justify-between bg-white border border-zinc-200/80 rounded-lg p-3 text-xs font-semibold text-zinc-650">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#6F42C1] block text-sm">{selectedPayment.pedido}</span>
                  <span className="text-[10px] text-zinc-400 block">{selectedPayment.prodCount} productos comprados</span>
                </div>
                <Link href="/pedidos" className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-900">
                  <span>Ver pedido</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Drawer Actions */}
          <div className="border-t border-zinc-200 p-4 bg-zinc-50 space-y-2">
            {confirmingRefund ? (
              <div className="bg-white border border-red-200 rounded-lg p-3 space-y-3 text-left">
                <p className="text-xs font-semibold text-red-700 leading-normal">
                  ¿Estás seguro de que deseas reembolsar este pago? Esta acción cambiará el estado de la transacción a Fallido y sumará el registro a los reembolsos recientes.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onRefund(selectedPayment.id)}
                    className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Confirmar Reembolso
                  </button>
                  <button 
                    onClick={() => setConfirmingRefund(false)}
                    className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {selectedPayment.estado === 'Exitoso' && (
                  <button 
                    onClick={() => setConfirmingRefund(true)}
                    className="w-full py-2 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-650 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                    Reembolsar Transacción
                  </button>
                )}
                
                <button 
                  onClick={onDownloadReceipt}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  Descargar Recibo de Compra
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
