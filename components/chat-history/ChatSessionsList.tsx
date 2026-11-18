'use client'

import React from 'react'
import {
  Search,
  MessageCircle,
  Lock,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatSessionsState } from './useChatSessions'

interface ChatSessionsListProps {
  chat: ChatSessionsState
}

export function ChatSessionsList({ chat }: ChatSessionsListProps) {
  const {
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    currentSessions,
    activeSessionId,
    setActiveSessionId,
    setNewNoteText,
    setNewTagText,
    setShowAddTag,
    filteredSessions,
    currentPage,
    itemsPerPage,
    totalPages
  } = chat

  return (
    <aside className="w-full lg:w-[320px] xl:w-[350px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-full overflow-hidden select-none">
      {/* Buscador superior fijo */}
      <div className="p-3 border-b border-zinc-200 bg-zinc-50/50 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o WhatsApp..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-8.5 pl-9 pr-3 bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg text-xs font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Lista desplazable de sesiones */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {currentSessions.length === 0 ? (
          <div className="py-16 px-4 text-center text-zinc-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
            <p className="font-bold text-xs text-zinc-600">Sin conversaciones en esta vista</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Los chats de WhatsApp aparecerán aquí en tiempo real.
            </p>
          </div>
        ) : (
          currentSessions.map(s => {
            const isSelected = s.id === activeSessionId
            const lastMsgObj = s.messages[s.messages.length - 1]
            let lastMsg = lastMsgObj ? lastMsgObj.text : 'Conversación iniciada'
            if (lastMsg.startsWith('[PRODUCT_CARD]')) {
              const parts = lastMsg.replace('[PRODUCT_CARD] ', '').split(' | ')
              lastMsg = `📦 ${parts[0] || 'Producto'}`
            } else if (lastMsg.startsWith('[Link de Pago Enviado]')) {
              lastMsg = '💳 Link de pago enviado'
            }
            const lastTime = lastMsgObj ? lastMsgObj.time : ''
            const isUnread =
              s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user'

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(s.id)
                  setNewNoteText('')
                  setNewTagText('')
                  setShowAddTag(false)
                }}
                className={cn(
                  'w-full text-left px-3.5 py-3 transition-colors flex items-start gap-3 relative cursor-pointer',
                  isSelected
                    ? 'bg-zinc-950/[0.04] border-l-2 border-l-zinc-950'
                    : 'hover:bg-zinc-50'
                )}
              >
                {/* Avatar con badge de WhatsApp */}
                <div className="relative shrink-0">
                  {s.avatarUrl ? (
                    <img
                      src={s.avatarUrl}
                      alt={s.customerName}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full border text-xs font-extrabold flex items-center justify-center uppercase',
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                      )}
                    >
                      {s.customerName.slice(0, 2)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                    <MessageCircle className="w-2 h-2 fill-current" />
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className={cn(
                          'text-xs truncate leading-tight',
                          isSelected || isUnread ? 'font-extrabold text-zinc-950' : 'font-bold text-zinc-800'
                        )}
                      >
                        {s.customerName}
                      </span>
                      {s.isFavorite && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                      {s.status === 'closed' && (
                        <Lock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[9.5px] text-zinc-400 tabular-nums font-semibold shrink-0">
                      {lastTime}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-[11px] truncate',
                      isUnread ? 'font-bold text-zinc-900' : 'font-medium text-zinc-500'
                    )}
                  >
                    {lastMsg}
                  </p>

                  {s.tags.length > 0 && (
                    <div className="flex items-center gap-1 pt-1 overflow-hidden">
                      {s.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 truncate max-w-[90px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center" />
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Footer de paginación compacto */}
      {filteredSessions.length > itemsPerPage && (
        <div className="bg-white border-t border-zinc-200 px-3.5 py-2.5 flex items-center justify-between text-[10px] font-semibold text-zinc-500 shrink-0">
          <span>
            {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredSessions.length)} de{' '}
            {filteredSessions.length}
          </span>
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-6 h-6 rounded border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-1.5 font-bold text-zinc-900 tabular-nums">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-6 h-6 rounded border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
