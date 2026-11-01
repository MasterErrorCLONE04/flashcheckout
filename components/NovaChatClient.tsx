'use client'

import React from 'react'
import { Bot } from 'lucide-react'
import {
  NovaChatClientProps,
  useNovaChatState,
  NovaSidebar,
  NovaHeader,
  NovaMessageBubble,
  NovaEmptyState,
  NovaChatInput,
  NovaMemoryModal
} from './nova-chat'

export default function NovaChatClient({
  merchantName,
  store,
  activeProductsCount,
  ordersCount,
  activeChatsCount,
  initialSessions = []
}: NovaChatClientProps) {
  const chat = useNovaChatState(initialSessions)

  return (
    <div className="flex w-full h-full bg-white font-sans text-left overflow-hidden select-none">
      {/* 1. SESSIONS SIDEBAR */}
      <NovaSidebar chat={chat} />

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-full relative">
        {/* Header & Agent Selector */}
        <NovaHeader chat={chat} />

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto w-full scrollbar-none flex flex-col items-center select-text">
          {chat.messages.length === 0 ? (
            <NovaEmptyState
              selectedAgent={chat.selectedAgent}
              merchantName={merchantName}
              onSuggestionClick={chat.handleSuggestionClick}
            />
          ) : (
            <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
              {chat.messages.map((m) => (
                <NovaMessageBubble
                  key={m.id}
                  message={m}
                  selectedAgent={chat.selectedAgent}
                />
              ))}

              {chat.isTyping && (
                <div className="flex gap-4 items-start w-full text-left animate-in fade-in duration-300 py-2">
                  <div className="shrink-0 select-none mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center text-zinc-500 shadow-sm">
                      <Bot className="w-4.5 h-4.5 stroke-[2px]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 border-t-zinc-500 animate-spin shrink-0" />
                    <span className="text-xs font-semibold text-zinc-400 select-none animate-pulse">
                      Nova está pensando...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chat.messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <NovaChatInput chat={chat} />
      </div>

      {/* 3. MEMORY MODAL */}
      <NovaMemoryModal
        isOpen={chat.showMemoryModal}
        onClose={() => chat.setShowMemoryModal(false)}
        store={store}
        activeProductsCount={activeProductsCount}
        ordersCount={ordersCount}
        activeChatsCount={activeChatsCount}
      />
    </div>
  )
}
