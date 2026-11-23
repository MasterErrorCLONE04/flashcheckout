'use client'

import React from 'react'
import {
  Check,
  Star,
  Tag,
  CheckCircle,
  Plus,
  Send,
  MessageCircle,
  Sparkles,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatSessionsState } from './useChatSessions'
import { ChatMessageBubble } from './ChatMessageBubble'

interface ChatActiveConversationProps {
  chat: ChatSessionsState
}

export function ChatActiveConversation({ chat }: ChatActiveConversationProps) {
  const {
    activeSession,
    handleAssigneeChange,
    toggleFavorite,
    showAddTag,
    setShowAddTag,
    toggleStatus,
    activeDetails,
    chatEndRef,
    newTagText,
    setNewTagText,
    handleAddTag,
    handleTakeover,
    takeoverText,
    setTakeoverText,
    sending,
    copyToClipboard
  } = chat

  if (!activeSession) {
    return (
      <section className="flex-1 min-w-0 bg-[#F4F4F5] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-zinc-900">Selecciona una conversación</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Elige un cliente en la columna izquierda para responder en tiempo real, enviar links de pago o gestionar su pedido.
        </p>
      </section>
    )
  }

  return (
    <section className="flex-1 min-w-0 bg-[#F4F4F5] flex flex-col justify-between h-full overflow-hidden relative">
      {/* Cabecera de la conversación activa */}
      <div className="bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative select-none shrink-0">
            {activeSession.avatarUrl ? (
              <img
                src={activeSession.avatarUrl}
                alt={activeSession.customerName}
                className="w-9 h-9 rounded-full object-cover border border-zinc-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-950 text-white text-xs font-extrabold flex items-center justify-center uppercase">
                {activeSession.customerName.slice(0, 2)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-zinc-950 truncate">
                {activeSession.customerName}
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard('+' + activeSession.phoneNumber)}
                className="text-[10.5px] text-zinc-500 hover:text-zinc-900 font-mono font-semibold inline-flex items-center gap-1 cursor-pointer"
                title="Copiar número de WhatsApp"
              >
                <span>+{activeSession.phoneNumber}</span>
                <Copy className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-zinc-400 font-semibold">Asignado a:</span>
              <select
                value={activeSession.assignedTo}
                onChange={e => handleAssigneeChange(activeSession.id, e.target.value)}
                className="bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.2 text-[10px] font-bold text-zinc-800 cursor-pointer focus:outline-none"
              >
                <option value="Tú">Tú (Humano)</option>
                <option value="Bot de IA">Nova (Bot IA)</option>
                <option value="Soporte Técnico">Soporte</option>
              </select>
            </div>
          </div>
        </div>

        {/* Acciones rápidas del chat */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => toggleFavorite(activeSession.id)}
            className={cn(
              'h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer',
              activeSession.isFavorite
                ? 'border-amber-200 bg-amber-50 text-amber-500'
                : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
            )}
            title="Marcar favorito"
          >
            <Star className={cn('w-3.5 h-3.5', activeSession.isFavorite && 'fill-current')} />
          </button>

          <button
            type="button"
            onClick={() => setShowAddTag(!showAddTag)}
            className={cn(
              'h-8 px-2.5 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer',
              showAddTag
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            )}
            title="Agregar etiqueta"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Etiquetar</span>
          </button>

          <button
            type="button"
            onClick={() => toggleStatus(activeSession.id)}
            className={cn(
              'h-8 px-3 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer',
              activeSession.status === 'closed'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
            )}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{activeSession.status === 'closed' ? 'Reabrir' : 'Resolver'}</span>
          </button>
        </div>
      </div>

      {/* Popover superior para nueva etiqueta */}
      {showAddTag && (
        <form
          onSubmit={handleAddTag}
          className="bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center gap-2 z-20 animate-in fade-in duration-150"
        >
          <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={newTagText}
            onChange={e => setNewTagText(e.target.value)}
            placeholder="Nueva etiqueta (ej. VIP, Pendiente pago, Mayorista)..."
            className="flex-1 h-8 bg-zinc-50 border border-zinc-200 rounded-lg px-3 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-950"
            required
          />
          <button
            type="submit"
            className="h-8 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Añadir</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddTag(false)
              setNewTagText('')
            }}
            className="h-8 px-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Área central de mensajes */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 flex flex-col">
        <div className="w-fit mx-auto text-[10px] font-bold text-zinc-500 bg-white border border-zinc-200/80 px-3 py-0.5 rounded-full shadow-2xs shrink-0 select-none">
          Historial de WhatsApp en Tiempo Real
        </div>

        <div className="space-y-4 flex-1">
          {activeSession.messages.map((msg, idx) => (
            <ChatMessageBubble
              key={idx}
              msg={msg}
              customerName={activeSession.customerName}
              avatarUrl={activeSession.avatarUrl}
            />
          ))}

          {activeDetails && activeDetails.cartItems.length > 0 && (
            <div className="w-fit mx-auto text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 select-none shadow-2xs">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>
                El cliente tiene {activeDetails.cartItems.length}{' '}
                {activeDetails.cartItems.length === 1 ? 'producto' : 'productos'} en su bolsa activa
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Compositor Inferior */}
      <div className="bg-white border-t border-zinc-200 p-3.5 space-y-2 shrink-0">
        <form onSubmit={handleTakeover} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={takeoverText}
              onChange={e => setTakeoverText(e.target.value)}
              placeholder="Escribe un mensaje para enviar al WhatsApp del cliente (Enter para enviar)..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 outline-none font-medium resize-none transition-all leading-relaxed"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleTakeover(e)
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!takeoverText.trim() || sending}
            className="h-10 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shrink-0 cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Enviando...' : 'Enviar'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium px-0.5">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            El bot responde automáticamente; al enviar un mensaje humano tomas el control de la sesión.
          </span>
          <span className="hidden sm:inline">Enter para enviar · Shift+Enter nueva línea</span>
        </div>
      </div>
    </section>
  )
}
