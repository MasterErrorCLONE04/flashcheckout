'use client'

import React from 'react'
import { Plus, MessageSquare, MoreVertical, AlignLeft } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { NovaChatState } from './useNovaChatState'
import { formatSessionTime } from './constants'

interface NovaSidebarProps {
  chat: NovaChatState
}

export function NovaSidebar({ chat }: NovaSidebarProps) {
  const {
    sessions,
    activeSessionId,
    handleNewChat,
    handleSelectSession,
    handleDeleteSession
  } = chat

  return (
    <aside className="w-64 border-r border-zinc-200/80 bg-[#FAFAFA] flex flex-col shrink-0 h-full justify-between">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-3">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 scrollbar-none select-none">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-semibold select-none leading-relaxed">
              No hay chats guardados.
              <br />
              <span className="text-[10px] text-zinc-350">¡Escribe algo para comenzar!</span>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = activeSessionId === s.id
              const formattedTime = formatSessionTime(s.updatedAt)
              return (
                <div 
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={cn(
                    "group w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-xs transition-all relative border cursor-pointer select-none",
                    isActive 
                      ? "bg-zinc-100 text-zinc-900 font-bold border-zinc-250" 
                      : "border-transparent text-zinc-650 hover:bg-zinc-100/50 hover:text-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                      isActive 
                        ? "bg-zinc-200 border-zinc-300 text-zinc-800" 
                        : "bg-white border-zinc-200 text-zinc-400 group-hover:border-zinc-300 group-hover:text-zinc-650"
                    )}>
                      <MessageSquare className="w-4 h-4 stroke-[2px]" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <span className={cn(
                        "block truncate font-bold text-xs leading-none",
                        isActive ? "text-zinc-900" : "text-zinc-805"
                      )}>
                        {s.title}
                      </span>
                      {formattedTime && (
                        <span suppressHydrationWarning className="block text-[10px] font-semibold text-zinc-400 mt-1.5 leading-none">
                          {formattedTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200/50 text-zinc-400 hover:text-red-650 rounded transition-all shrink-0 cursor-pointer absolute right-2.5 bg-transparent"
                    title="Eliminar conversación"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-zinc-450" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="p-3 border-t border-zinc-200/60 bg-[#FAFAFA] shrink-0">
        <button 
          onClick={() => toast.info('Historial completo de conversaciones próximamente')}
          className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <AlignLeft className="w-4 h-4 text-zinc-500" />
          <span>Ver todas las conversaciones</span>
        </button>
      </div>
    </aside>
  )
}
