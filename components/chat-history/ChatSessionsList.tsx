'use client'

import React from 'react'
import {
  Search,
  SlidersHorizontal,
  MessageCircle,
  Lock,
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
    activeTab,
    setActiveTab,
    setCurrentPage,
    totalCount,
    unreadCount,
    assignedCount,
    unassignedCount,
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
    <div className="lg:col-span-4 xl:col-span-3 bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between h-[680px]">
      <div className="p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-1 pb-1 overflow-x-auto border-b border-zinc-100 text-[10px] font-bold text-zinc-500">
          <button 
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={cn(
              "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
              activeTab === 'all' ? "text-emerald-600" : "hover:text-zinc-950"
            )}
          >
            Todas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{totalCount}</span>
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>

          <button 
            onClick={() => { setActiveTab('unread'); setCurrentPage(1); }}
            className={cn(
              "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
              activeTab === 'unread' ? "text-emerald-600" : "hover:text-zinc-950"
            )}
          >
            No leídas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{unreadCount}</span>
            {activeTab === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>

          <button 
            onClick={() => { setActiveTab('assigned'); setCurrentPage(1); }}
            className={cn(
              "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
              activeTab === 'assigned' ? "text-emerald-600" : "hover:text-zinc-950"
            )}
          >
            Asignadas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{assignedCount}</span>
            {activeTab === 'assigned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>

          <button 
            onClick={() => { setActiveTab('unassigned'); setCurrentPage(1); }}
            className={cn(
              "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
              activeTab === 'unassigned' ? "text-emerald-600" : "hover:text-zinc-950"
            )}
          >
            Sin asignar <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{unassignedCount}</span>
            {activeTab === 'unassigned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>
        </div>

        {/* Search conversations */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg text-xs font-semibold outline-none transition-all placeholder:text-zinc-400"
            />
          </div>
          <button className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors shrink-0 cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conversations list container */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar pr-0.5">
        {currentSessions.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
            <p className="font-semibold text-xs leading-relaxed">No hay conversaciones</p>
          </div>
        ) : (
          currentSessions.map(s => {
            const isSelected = s.id === activeSessionId
            const lastMsgObj = s.messages[s.messages.length - 1]
            let lastMsg = lastMsgObj ? lastMsgObj.text : 'Conversación iniciada'
            if (lastMsg.startsWith('[PRODUCT_CARD]')) {
              const parts = lastMsg.replace('[PRODUCT_CARD] ', '').split(' | ')
              lastMsg = `Tarjeta de producto: ${parts[0] || 'Producto'}`
            } else if (lastMsg.startsWith('[Link de Pago Enviado]')) {
              lastMsg = 'Link de Pago Enviado 🛒'
            }
            const lastTime = lastMsgObj ? lastMsgObj.time : '10:00'
            const isUnread = s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user'

            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id)
                  setNewNoteText('')
                  setNewTagText('')
                  setShowAddTag(false)
                }}
                className={cn(
                  "w-full text-left p-4 hover:bg-zinc-50 transition-colors flex items-start gap-3 relative group/session",
                  isSelected && "bg-zinc-50"
                )}
              >
                {/* Profile image with WhatsApp Badge */}
                <div className="relative shrink-0 select-none">
                  {s.avatarUrl ? (
                    <img 
                      src={s.avatarUrl} 
                      alt={s.customerName}
                      className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-zinc-200"
                    />
                  ) : (
                    <div className="w-8.5 h-8.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-extrabold text-zinc-600 flex items-center justify-center uppercase">
                      {s.customerName.slice(0, 2)}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white p-0.5">
                    <MessageCircle className="w-2.5 h-2.5 fill-current" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-zinc-950 text-xs truncate leading-tight">{s.customerName}</span>
                      {s.status === 'closed' && (
                        <Lock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-400 tabular-nums font-bold shrink-0">{lastTime}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate font-semibold">{lastMsg}</p>
                </div>

                {/* Unread dot indicator */}
                {isUnread && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold flex items-center justify-center shrink-0 ml-1.5 self-center">
                    {s.messages.filter(m => m.sender === 'user').length}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Paginated Footer */}
      {filteredSessions.length > 0 && (
        <div className="bg-white border-t border-zinc-100 p-3.5 flex items-center justify-between text-[10px] font-semibold text-zinc-400">
          <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSessions.length)} de {filteredSessions.length}</span>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-5.5 h-5.5 rounded border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={cn(
                  "w-5.5 h-5.5 rounded text-[9px] flex items-center justify-center transition-all cursor-pointer",
                  currentPage === idx + 1 ? "bg-zinc-950 text-white font-bold" : "border border-zinc-200 text-zinc-500"
                )}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-5.5 h-5.5 rounded border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
