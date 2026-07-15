'use client'

import { useState } from 'react'
import { 
  Check, 
  X, 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  Maximize2, 
  FileText, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado') {
  return error instanceof Error ? error.message : fallback
}

type OrderItem = {
  name: string
  qty: number
  price: number
}

type Order = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  paymentStatus: string
  proofImageUrl: string | null
  adminComment: string | null
}

export default function ManualVerificationPanel({
  initialOrders
}: {
  initialOrders: Order[]
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrders.length > 0 ? initialOrders[0].id : null
  )
  const [loading, setLoading] = useState<string | null>(null) // holds orderId being updated
  const [rejectReason, setRejectReason] = useState<string>('')
  const [isRejecting, setIsRejecting] = useState<boolean>(false)
  const [isFullscreenImage, setIsFullscreenImage] = useState<boolean>(false)

  const activeOrder = orders.find(o => o.id === selectedOrderId) || null

  const handleAction = async (orderId: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !rejectReason.trim()) {
      toast.error('Por favor escribe un motivo para el rechazo.')
      return
    }

    setLoading(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comment: action === 'REJECT' ? rejectReason : undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la acción')
      }

      toast.success(
        action === 'APPROVE' 
          ? 'Pedido aprobado correctamente y cliente notificado. 🎉' 
          : 'Pedido rechazado y cliente notificado. ❌'
      )

      // Remover la orden de la lista del panel ya procesada
      const updatedOrders = orders.filter(o => o.id !== orderId)
      setOrders(updatedOrders)
      
      // Limpiar estados
      setRejectReason('')
      setIsRejecting(false)
      
      // Auto-seleccionar la siguiente
      if (updatedOrders.length > 0) {
        setSelectedOrderId(updatedOrders[0].id)
      } else {
        setSelectedOrderId(null)
      }

    } catch (err: unknown) {
      console.error(err)
      toast.error(getErrorMessage(err, 'Ocurrió un error inesperado'))
    } finally {
      setLoading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 premium-card rounded-lg border-dashed border-zinc-200 bg-white/50 max-w-5xl mx-auto flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-950 tracking-tight font-display">Todo verificado</h3>
        <p className="text-zinc-500 text-xs font-semibold tracking-wider mt-2 max-w-sm leading-relaxed">
          No hay comprobantes pendientes de pago por validar en este momento.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in duration-300">
      {/* 1. Left List Pane (Spans 4/12) */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-4">
        <div className="premium-card p-5 bg-white border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-zinc-950 tracking-wider">Pagos por verificar</h4>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-extrabold text-amber-700 tracking-wider">
              {orders.length} pendientes
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
            Revisa los comprobantes enviados por chat y aprueba para despachar.
          </p>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1 custom-scrollbar">
          {orders.map(order => {
            const isSelected = order.id === selectedOrderId
            return (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id)
                  setIsRejecting(false)
                  setRejectReason('')
                }}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-3 group relative overflow-hidden",
                  isSelected 
                    ? "bg-zinc-955 border-zinc-955 text-white"
                    : "bg-white border-zinc-200 text-zinc-955 hover:border-zinc-300 hover:bg-zinc-50/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn(
                    "text-[13px] font-bold truncate leading-none tracking-tight",
                    isSelected ? "text-white" : "text-zinc-950"
                  )}>
                    {order.customerName}
                  </span>
                  <span className="text-xs font-extrabold tabular-nums leading-none shrink-0 tracking-tight">
                    ${order.total.toLocaleString('es-CO')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-zinc-400 tracking-tight">
                    {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className={cn(
                    "text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded-md border leading-none flex items-center gap-1",
                    isSelected ? "text-white bg-white/10 border-white/20" : "text-amber-700 bg-amber-50 border-amber-200"
                  )}>
                    <Clock className="w-2.5 h-2.5" />
                    Subido
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Right Detail Pane (Spans 8/12) */}
      <div className="lg:col-span-7 xl:col-span-8">
        {activeOrder ? (
          <div className="premium-card bg-white border-zinc-200 overflow-hidden divide-y divide-zinc-100">
            
            {/* Header */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/10">
              <div>
                <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                  Verificación de Pedido #{activeOrder.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mt-1 flex items-center gap-1.5" suppressHydrationWarning>
                  <Calendar className="w-3.5 h-3.5" />
                  Recibido el {new Date(activeOrder.createdAt).toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            {/* Info and Screenshot */}
            <div className="p-6 grid md:grid-cols-12 gap-6">
              
              {/* Client and Items info (5 cols) */}
              <div className="md:col-span-5 space-y-5">
                <div>
                  <h5 className="text-[10px] font-extrabold tracking-widest text-zinc-400 flex items-center gap-1.5 mb-2">
                    <User className="w-3.5 h-3.5" />
                    Datos del cliente
                  </h5>
                  <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg space-y-1">
                    <p className="text-xs font-bold text-zinc-950">{activeOrder.customerName}</p>
                    {activeOrder.customerPhone && (
                      <p className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        {activeOrder.customerPhone}
                      </p>
                    )}
                    <p className="text-[10px] font-medium text-zinc-400 mt-1 leading-normal">
                      Dirección: {activeOrder.address}, {activeOrder.city}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-extrabold tracking-widest text-zinc-400 flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    Resumen del pedido
                  </h5>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-zinc-50/50 border border-zinc-100 text-xs">
                        <span className="font-semibold text-zinc-700">
                          <span className="font-bold text-zinc-950 mr-1">{item.qty}x</span> {item.name}
                        </span>
                        <span className="font-bold text-zinc-950 tabular-nums">
                          ${(item.price * item.qty).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 flex justify-between border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-widest">Total</span>
                    <span className="text-base font-extrabold text-zinc-955 tabular-nums">
                      ${activeOrder.total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Image (7 cols) */}
              <div className="md:col-span-7 space-y-3">
                <h5 className="text-[10px] font-extrabold tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Comprobante recibido
                </h5>

                {activeOrder.proofImageUrl ? (
                  <div className="relative group rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 max-h-[300px] flex items-center justify-center shadow-inner cursor-zoom-in">
                    <img
                      src={activeOrder.proofImageUrl}
                      alt="Comprobante"
                      onClick={() => setIsFullscreenImage(true)}
                      className="max-h-[300px] object-contain hover:scale-105 transition-all duration-300 w-full"
                    />
                    <div 
                      onClick={() => setIsFullscreenImage(true)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-all duration-200"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Ver pantalla completa
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-zinc-200 bg-zinc-50/50 rounded-lg flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-zinc-300 mb-2" />
                    <p className="text-xs text-zinc-400 font-semibold tracking-wider">No se cargó imagen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Actions Panel */}
            <div className="p-6 bg-zinc-50/10">
              {isRejecting ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 tracking-widest block mb-1">
                      Motivo del rechazo (Se enviará al cliente por WhatsApp)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ej. El valor transferido no coincide con el total / Comprobante de pago borroso."
                      rows={3}
                      className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-3 focus:outline-none focus:border-zinc-950 placeholder:text-zinc-450 text-zinc-950 transition-colors resize-none font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsRejecting(false)
                        setRejectReason('')
                      }}
                      className="px-4 py-2 text-[10px] font-bold tracking-wider bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-600 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAction(activeOrder.id, 'REJECT')}
                      disabled={loading === activeOrder.id}
                      className="px-4 py-2 text-[10px] font-bold tracking-wider bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm shadow-rose-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Confirmar rechazo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Valida los datos antes de proceder
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setIsRejecting(true)}
                      disabled={loading === activeOrder.id}
                      className="w-full sm:w-auto px-5 py-2.5 text-[10px] font-bold tracking-wider bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5 text-rose-500" />
                      Rechazar pago
                    </button>
                    <button
                      onClick={() => handleAction(activeOrder.id, 'APPROVE')}
                      disabled={loading === activeOrder.id}
                      className="w-full sm:w-auto px-6 py-2.5 text-[10px] font-bold tracking-wider bg-zinc-955 hover:bg-zinc-900 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Aprobar pago
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-zinc-200 bg-white/50 text-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-5 text-zinc-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-955 tracking-tight font-display">Ningún pedido seleccionado</h4>
            <p className="text-zinc-400 text-xs font-semibold max-w-xs mt-1.5 leading-relaxed uppercase tracking-wider">
              Elige una orden del listado izquierdo para revisar su comprobante de pago.
            </p>
          </div>
        )}
      </div>

      {/* 3. Fullscreen Image Modal */}
      {isFullscreenImage && activeOrder?.proofImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsFullscreenImage(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl p-2 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsFullscreenImage(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={activeOrder.proofImageUrl}
              alt="Comprobante en pantalla completa"
              className="max-h-[85vh] object-contain rounded-lg w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
