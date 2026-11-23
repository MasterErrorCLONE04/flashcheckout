'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Download,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  QrCode,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ChatSessionInit,
  useWhatsAppConnection,
  WhatsAppConnectCard,
  useChatSessions,
  ChatSessionsList,
  ChatActiveConversation,
  ChatCustomerDetailsPanel,
} from './chat-history'

export default function ChatHistoryViewer({
  initialSessions,
  whatsappConnected,
}: {
  initialSessions: ChatSessionInit[]
  whatsappConnected: boolean
}) {
  const conn = useWhatsAppConnection(whatsappConnected)
  const chat = useChatSessions(conn.isConnected ? initialSessions : [])
  const [showCrmPanel, setShowCrmPanel] = useState(true)
  const [showQrModal, setShowQrModal] = useState(false)

  // Clear local sessions immediately if WhatsApp is disconnected
  useEffect(() => {
    if (!conn.isConnected) {
      chat.setSessions([])
      chat.setActiveSessionId(null)
    }
  }, [conn.isConnected])

  // Lock body scroll on desktop so /conversaciones behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const filterTabs = [
    { id: 'all' as const, label: 'Todas', count: chat.totalCount },
    { id: 'unread' as const, label: 'No leídas', count: chat.unreadCount },
    { id: 'assigned' as const, label: 'Asignadas', count: chat.assignedCount },
    { id: 'unassigned' as const, label: 'Sin asignar', count: chat.unassignedCount },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO CRM (TOP STUDIO BAR) ────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Conversaciones
          </h1>
        </div>

        {/* Centro: Filtros de Bandeja de Entrada */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {filterTabs.map(tab => {
            const isActive = chat.activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  chat.setActiveTab(tab.id)
                  chat.setCurrentPage(1)
                }}
                className={cn(
                  'h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs border border-zinc-200/60'
                    : 'text-zinc-500 hover:text-zinc-900'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[9px] font-extrabold px-1.5 py-0.2 rounded tabular-nums',
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-200/70 text-zinc-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Derecha: Acciones Globales de Bandeja */}
        <div className="flex items-center gap-2 shrink-0">
          {!conn.isConnected ? (
            <button
              type="button"
              onClick={() => {
                setShowQrModal(true)
                if (!conn.qrCodeBase64) conn.handleRegenerateQr()
              }}
              className="h-8 px-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Vincular QR</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={conn.handleDisconnect}
                disabled={conn.disconnecting}
                className="hidden md:inline-flex h-8 px-2.5 bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 text-zinc-600 hover:text-rose-600 rounded-lg text-[11px] font-bold items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                title="Desconectar sesión de WhatsApp"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Desconectar WA</span>
              </button>

              {chat.totalCount > 0 && (
                <button
                  type="button"
                  onClick={chat.exportChats}
                  className="hidden sm:inline-flex h-8 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-[11px] font-bold items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Exportar CSV</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowCrmPanel(v => !v)}
                className={cn(
                  'hidden lg:inline-flex h-8 w-8 rounded-lg border items-center justify-center cursor-pointer transition-all',
                  showCrmPanel
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                )}
                title={showCrmPanel ? 'Ocultar panel CRM' : 'Mostrar panel CRM'}
              >
                {showCrmPanel ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── 2. ÁREA DE TRABAJO ──────────────────────────────────────────── */}
      {!conn.isConnected ? (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-[#F4F4F5]">
          <WhatsAppConnectCard
            loadingQr={conn.loadingQr}
            qrCodeBase64={conn.qrCodeBase64}
            onRegenerateQr={conn.handleRegenerateQr}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          <ChatSessionsList chat={chat} />
          <ChatActiveConversation chat={chat} />
          {showCrmPanel && <ChatCustomerDetailsPanel chat={chat} />}
        </div>
      )}

      {/* Modal QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <WhatsAppConnectCard
              loadingQr={conn.loadingQr}
              qrCodeBase64={conn.qrCodeBase64}
              onRegenerateQr={conn.handleRegenerateQr}
            />
          </div>
        </div>
      )}
    </div>
  )
}
