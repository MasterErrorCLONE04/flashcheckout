'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Copy,
  Package,
  Zap,
  Plus,
  Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatSessionsState } from './useChatSessions'

interface ChatCustomerDetailsPanelProps {
  chat: ChatSessionsState
}

export function ChatCustomerDetailsPanel({ chat }: ChatCustomerDetailsPanelProps) {
  const router = useRouter()
  const {
    activeSession,
    activeDetails,
    detailsLoading,
    copyToClipboard,
    handleSendPaymentLink,
    showAddTag,
    setShowAddTag,
    handleRemoveTag,
    toggleStatus
  } = chat

  if (!activeSession) {
    return (
      <div className="lg:col-span-12 xl:col-span-3 space-y-5">
        <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center justify-center text-center py-20 text-zinc-400">
          Selecciona un chat
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-12 xl:col-span-3 space-y-5">
      {/* Card 1: Información del cliente */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
        <h4 className="text-xs font-bold text-zinc-950 tracking-wider select-none">Información del cliente</h4>
        
        <div className="flex items-center gap-3.5 select-none">
          {activeSession.avatarUrl ? (
            <img 
              src={activeSession.avatarUrl} 
              alt={activeSession.customerName}
              className="w-12 h-12 rounded-full object-cover shrink-0 border border-zinc-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-lg font-extrabold text-zinc-600 uppercase shrink-0">
              {activeSession.customerName.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-zinc-950 truncate leading-tight">{activeSession.customerName}</h4>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[8px] px-1 py-0.2 rounded font-extrabold uppercase shrink-0">
                Cliente
              </span>
            </div>
            <span className="text-[10px] font-semibold text-zinc-400 mt-1 block flex items-center gap-1">
              <span>+{activeSession.phoneNumber}</span>
              <button 
                onClick={() => copyToClipboard('+' + activeSession.phoneNumber)}
                className="text-zinc-300 hover:text-zinc-500 cursor-pointer ml-0.5"
                title="Copiar"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            </span>
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        <div className="space-y-3.5 text-xs font-semibold text-zinc-600">
          <div className="flex justify-between items-baseline">
            <span className="text-zinc-400 select-none">Cliente desde:</span>
            <span className="text-zinc-950">
              {detailsLoading ? 'Cargando...' : activeDetails?.firstInteractionDate || '15 mar 2025'}
            </span>
          </div>
          
          <div className="flex justify-between items-baseline">
            <span className="text-zinc-400 select-none">Total compras:</span>
            <span className="text-zinc-950 font-bold">
              {detailsLoading ? 'Cargando...' : `$${activeDetails?.totalSpent.toLocaleString('es-CO') || '0'}`}
            </span>
          </div>
          
          <div className="flex justify-between items-baseline">
            <span className="text-zinc-400 select-none">Pedidos:</span>
            <span className="text-zinc-950">
              {detailsLoading ? 'Cargando...' : `${activeDetails?.ordersCount || 0} pedidos`}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/clientes?search=${activeSession.customerName}`)}
          className="w-full text-center py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all cursor-pointer mt-2 block"
        >
          Ver perfil completo
        </button>
      </div>

      {/* Card 2: Carrito actual */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
        <div className="flex justify-between items-baseline select-none">
          <h4 className="text-xs font-bold text-zinc-950 tracking-wider">Carrito actual</h4>
          <span className="text-[10px] text-zinc-400 font-bold">{activeDetails?.cartItems.length || 0} productos</span>
        </div>

        {activeDetails && activeDetails.cartItems.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {activeDetails.cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-center text-xs font-semibold text-zinc-700 py-1.5 border-b border-zinc-50 last:border-none">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-8.5 h-8.5 rounded border border-zinc-100 object-cover shrink-0" />
                  ) : (
                    <div className="w-8.5 h-8.5 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-center text-zinc-400 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-zinc-900 truncate text-[11px] leading-tight">{item.name}</h5>
                    <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Cant: {item.qty}</p>
                  </div>
                  <span className="font-bold text-zinc-900 shrink-0 text-[11px]">${(item.price * item.qty).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-zinc-100 pt-1" />

            <div className="space-y-2 text-[11px] font-semibold text-zinc-600">
              <div className="flex justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span>${activeDetails.cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Envío</span>
                <span className="text-emerald-600 font-bold">Gratis</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-zinc-950 pt-1.5 border-t border-zinc-50">
                <span>Total</span>
                <span>${activeDetails.cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <button
              onClick={handleSendPaymentLink}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 select-none active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Enviar link de pago</span>
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-zinc-400 font-semibold py-4 text-center select-none">No hay productos en el carrito</p>
        )}
      </div>

      {/* Card 3: Historial reciente */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
        <div className="flex justify-between items-baseline select-none">
          <h4 className="text-xs font-bold text-zinc-950 tracking-wider">Historial reciente</h4>
          <button 
            onClick={() => router.push(`/pedidos?search=${activeSession.customerName}`)} 
            className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        {activeDetails && activeDetails.orders.length > 0 ? (
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {activeDetails.orders.slice(0, 4).map((order, idx) => {
              const isPaid = order.status === 'paid' || order.paymentStatus === 'PAID'
              const statusText = isPaid ? 'Pagado' : order.status === 'failed' ? 'Reembolsado' : 'Pendiente'
              const statusColor = isPaid 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : order.status === 'failed'
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'

              return (
                <div key={idx} className="flex justify-between items-center text-[10px] font-semibold py-1.5 border-b border-zinc-50 last:border-none">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-zinc-800 truncate">Pedido #{order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border scale-90", statusColor)}>
                      {statusText}
                    </span>
                    <span className="font-bold text-zinc-950">${order.total.toLocaleString('es-CO')}</span>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isPaid ? "bg-emerald-500" : order.status === 'failed' ? "bg-rose-500" : "bg-amber-500")} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-[10px] text-zinc-400 font-semibold py-4 text-center select-none">No registra pedidos anteriores</p>
        )}
      </div>

      {/* Card 4: Etiquetas */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
        <div className="flex justify-between items-baseline select-none">
          <h4 className="text-xs font-bold text-zinc-950 tracking-wider">Etiquetas</h4>
          <button 
            onClick={() => setShowAddTag(!showAddTag)} 
            className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            Editar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeSession.tags.map((tag, tIdx) => {
            let color = 'text-[#6F42C1] bg-purple-50 border-purple-200'
            if (tag.toLowerCase().includes('compra')) color = 'text-emerald-700 bg-emerald-50 border-emerald-200'
            if (tag.toLowerCase().includes('envio') || tag.toLowerCase().includes('domicilio')) color = 'text-amber-700 bg-amber-50 border-amber-200'

            return (
              <span 
                key={tIdx} 
                className={cn(
                  "px-2 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 leading-none",
                  color
                )}
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(activeSession.id, tag)}
                  className="hover:text-zinc-950 text-[10px] ml-0.5 opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            )
          })}

          <button
            onClick={() => setShowAddTag(!showAddTag)}
            className="flex items-center justify-center gap-1 px-2 py-0.5 border border-dashed border-zinc-200 hover:border-zinc-300 rounded-md text-[9px] font-bold text-zinc-500 transition-colors bg-white cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5 text-zinc-500" />
            <span>Nueva etiqueta</span>
          </button>
        </div>
      </div>

      {/* Close session button action */}
      <button
        onClick={() => toggleStatus(activeSession.id)}
        className={cn(
          "w-full flex items-center justify-center gap-2 border rounded-lg py-3 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer",
          activeSession.status === 'closed'
            ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50"
            : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50/30"
        )}
      >
        <Lock className="w-3.5 h-3.5" />
        <span>{activeSession.status === 'closed' ? 'Reabrir conversación' : 'Cerrar conversación'}</span>
      </button>
    </div>
  )
}
