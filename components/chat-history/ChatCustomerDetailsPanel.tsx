'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Copy,
  Package,
  Zap,
  Plus,
  Lock,
  Trash2,
  StickyNote,
  ExternalLink
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
    handleDeleteNote,
    toggleStatus
  } = chat

  if (!activeSession) {
    return (
      <aside className="w-full lg:w-[320px] xl:w-[350px] shrink-0 bg-white border-l border-zinc-200 p-6 flex items-center justify-center text-center text-xs font-semibold text-zinc-400">
        Selecciona una conversación para ver el expediente CRM del cliente
      </aside>
    )
  }

  return (
    <aside className="w-full lg:w-[320px] xl:w-[350px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col h-full overflow-y-auto divide-y divide-zinc-200 select-none">
      {/* 1. FICHA DEL CLIENTE */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
            Expediente CRM
          </span>
          <button
            type="button"
            onClick={() => router.push(`/clientes?search=${encodeURIComponent(activeSession.customerName)}`)}
            className="text-[10.5px] font-bold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Directorio</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeSession.avatarUrl ? (
            <img
              src={activeSession.avatarUrl}
              alt={activeSession.customerName}
              className="w-11 h-11 rounded-full object-cover shrink-0 border border-zinc-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-extrabold text-zinc-700 uppercase shrink-0">
              {activeSession.customerName.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-zinc-950 truncate">
              {activeSession.customerName}
            </h4>
            <button
              type="button"
              onClick={() => copyToClipboard('+' + activeSession.phoneNumber)}
              className="text-[11px] font-mono font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mt-0.5 cursor-pointer"
            >
              <span>+{activeSession.phoneNumber}</span>
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70">
            <span className="text-[9px] font-bold uppercase text-zinc-400 block">Compras</span>
            <span className="text-xs font-extrabold text-zinc-950 tabular-nums mt-0.5 block">
              {detailsLoading
                ? '...'
                : `$${(activeDetails?.totalSpent || 0).toLocaleString('es-CO')}`}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70">
            <span className="text-[9px] font-bold uppercase text-zinc-400 block">Pedidos</span>
            <span className="text-xs font-extrabold text-zinc-950 tabular-nums mt-0.5 block">
              {detailsLoading ? '...' : activeDetails?.ordersCount || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70">
            <span className="text-[9px] font-bold uppercase text-zinc-400 block">Desde</span>
            <span className="text-[10.5px] font-bold text-zinc-900 truncate mt-0.5 block">
              {detailsLoading
                ? '...'
                : activeDetails?.firstInteractionDate ||
                  new Date(activeSession.lastInteraction).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'short'
                  })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BOLSA / CARRITO EN VIVO */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
            Bolsa Activa en WhatsApp
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
            {activeDetails?.cartItems.length || 0} ítems
          </span>
        </div>

        {activeDetails && activeDetails.cartItems.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {activeDetails.cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-2.5 items-center text-xs py-1.5 border-b border-zinc-100 last:border-none"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-8 h-8 rounded border border-zinc-200 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-center text-zinc-400 shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-zinc-900 truncate text-[11px] leading-tight">
                      {item.name}
                    </h5>
                    <p className="text-[9.5px] text-zinc-400 font-semibold">Cant: {item.qty}</p>
                  </div>
                  <span className="font-extrabold text-zinc-950 shrink-0 text-[11px] tabular-nums">
                    ${(item.price * item.qty).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline text-xs font-extrabold text-zinc-950 pt-1 border-t border-zinc-100">
              <span>Total estimado</span>
              <span className="tabular-nums">
                $
                {activeDetails.cartItems
                  .reduce((acc, i) => acc + i.price * i.qty, 0)
                  .toLocaleString('es-CO')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendPaymentLink}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Enviar Link de Pago al Chat</span>
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-zinc-400 font-medium py-2">
            El cliente no tiene productos en su bolsa en este momento.
          </p>
        )}
      </div>

      {/* 3. NOTAS INTERNAS DEL EQUIPO (AHORA VISIBLES Y GESTIONABLES) */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5 text-amber-500" />
            Notas Internas ({activeSession.notes.length})
          </span>
        </div>

        {activeSession.notes.length === 0 ? (
          <p className="text-[11px] text-zinc-400 font-medium">
            Sin notas privadas. Usa la pestaña &ldquo;Nota Interna&rdquo; abajo en el chat para agregar una.
          </p>
        ) : (
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
            {activeSession.notes.map(note => (
              <div
                key={note.id}
                className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs space-y-1 relative group"
              >
                <p className="text-[11px] font-medium text-zinc-800 leading-relaxed pr-5">
                  {note.text}
                </p>
                <div className="flex items-center justify-between text-[9.5px] font-semibold text-amber-700/80">
                  <span>{note.author}</span>
                  <span>{note.createdAt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(activeSession.id, note.id)}
                  className="absolute top-2 right-2 text-zinc-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Eliminar nota"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ETIQUETAS Y PEDIDOS RECIENTES */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
            Etiquetas
          </span>
          <button
            type="button"
            onClick={() => setShowAddTag(!showAddTag)}
            className="text-[10.5px] font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Añadir</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeSession.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-2 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-800 text-[10px] font-bold flex items-center gap-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(activeSession.id, tag)}
                className="text-zinc-400 hover:text-rose-600 cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
          {activeSession.tags.length === 0 && (
            <span className="text-[11px] text-zinc-400 font-medium">Sin etiquetas asignadas</span>
          )}
        </div>
      </div>

      {/* 5. HISTORIAL DE PEDIDOS DEL CLIENTE */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
            Pedidos del Cliente
          </span>
          <button
            type="button"
            onClick={() => router.push(`/pedidos?search=${encodeURIComponent(activeSession.customerName)}`)}
            className="text-[10.5px] font-bold text-zinc-600 hover:text-zinc-950 cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        {activeDetails && activeDetails.orders.length > 0 ? (
          <div className="space-y-2">
            {activeDetails.orders.slice(0, 4).map((order, idx) => {
              const isPaid = order.status === 'paid' || order.paymentStatus === 'PAID'
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900 block text-[11px]">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[9.5px] text-zinc-400 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-zinc-950 block text-[11px] tabular-nums">
                      ${order.total.toLocaleString('es-CO')}
                    </span>
                    <span
                      className={cn(
                        'text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded border inline-block mt-0.5',
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      {isPaid ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-400 font-medium">
            Aún no registra órdenes cerradas.
          </p>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => toggleStatus(activeSession.id)}
            className={cn(
              'w-full h-8.5 flex items-center justify-center gap-1.5 border rounded-lg text-[11px] font-bold transition-all cursor-pointer',
              activeSession.status === 'closed'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50'
            )}
          >
            <Lock className="w-3 h-3" />
            <span>
              {activeSession.status === 'closed' ? 'Reabrir conversación' : 'Cerrar conversación'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
