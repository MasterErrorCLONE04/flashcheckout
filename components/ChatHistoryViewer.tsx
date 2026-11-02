'use client'

import React from 'react'
import { ShieldAlert, Download } from 'lucide-react'
import {
  ChatSessionInit,
  useWhatsAppConnection,
  WhatsAppConnectCard,
  useChatSessions,
  ChatSessionsList,
  ChatActiveConversation,
  ChatCustomerDetailsPanel
} from './chat-history'

export default function ChatHistoryViewer({
  initialSessions,
  whatsappConnected,
}: {
  initialSessions: ChatSessionInit[]
  whatsappConnected: boolean
}) {
  const conn = useWhatsAppConnection(whatsappConnected)
  const chat = useChatSessions(initialSessions)

  if (!conn.isConnected) {
    return (
      <WhatsAppConnectCard
        loadingQr={conn.loadingQr}
        qrCodeBase64={conn.qrCodeBase64}
        onRegenerateQr={conn.handleRegenerateQr}
      />
    )
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Conversaciones</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gestiona y responde todas tus conversaciones.
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={chat.exportChats}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-700 transition-all cursor-pointer select-none"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Exportar conversaciones</span>
          </button>

          <button
            onClick={conn.handleDisconnect}
            disabled={conn.disconnecting}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 rounded-lg text-xs font-bold text-rose-600 transition-all cursor-pointer select-none disabled:opacity-50 active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Desconectar WhatsApp</span>
          </button>
        </div>
      </div>

      {/* THREE-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <ChatSessionsList chat={chat} />
        <ChatActiveConversation chat={chat} />
        <ChatCustomerDetailsPanel chat={chat} />
      </div>
    </div>
  )
}
