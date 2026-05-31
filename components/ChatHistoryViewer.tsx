'use client'

import { useState } from 'react'
import { History, User, Bot, Send, MessageCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatSession = {
  id: string
  phoneNumber: string
  customerName: string
  lastInteraction: string
  step: string
  messages: {
    sender: 'user' | 'bot'
    text: string
    time: string
  }[]
}

export default function ChatHistoryViewer({
  initialSessions,
}: {
  initialSessions: ChatSession[]
}) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessions.length > 0 ? initialSessions[0].id : null
  )
  const [takeoverText, setTakeoverText] = useState('')

  const activeSession = sessions.find(s => s.id === activeSessionId)

  function handleTakeover(e: React.FormEvent) {
    e.preventDefault()
    if (!takeoverText.trim() || !activeSessionId) return

    const newMsg = takeoverText.trim()
    setTakeoverText('')

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                sender: 'bot', // Sending from merchant/system side
                text: `[Asesor Humano]: ${newMsg}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          }
        }
        return s
      })
    )
  }

  return (
    <div className="premium-card bg-white border border-zinc-200/60 shadow-sm rounded-2xl flex overflow-hidden h-[600px]">
      {/* Left Panel: Active Conversations List */}
      <div className="w-[300px] border-r border-zinc-200/60 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-100 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <span className="font-bold text-zinc-800 text-[13px] uppercase tracking-wider">Conversaciones</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50 custom-scrollbar">
          {sessions.length === 0 ? (
            <p className="text-center text-zinc-400 text-xs py-10 font-bold uppercase tracking-wider">Sin chats activos</p>
          ) : (
            sessions.map(s => {
              const lastMsg = s.messages[s.messages.length - 1]?.text || 'Sin mensajes'
              const lastTime = s.messages[s.messages.length - 1]?.time || ''
              
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-zinc-50 transition-colors flex items-start gap-3",
                    activeSessionId === s.id && "bg-zinc-50/80"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold shrink-0">
                    {s.customerName.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-zinc-800 text-xs truncate max-w-[120px]">{s.customerName}</span>
                      <span className="text-[9px] text-zinc-400 tabular-nums font-bold shrink-0">{lastTime}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate pr-2 font-medium">{lastMsg}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right Panel: Conversation Dialog transcript & takeover panel */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-50/50">
        {activeSession ? (
          <>
            {/* Active Session Header info */}
            <div className="bg-white p-4 border-b border-zinc-200/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-50 border flex items-center justify-center text-zinc-500 font-bold">
                  {activeSession.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 leading-none">{activeSession.customerName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1.5 tabular-nums">+{activeSession.phoneNumber} • Paso: <span className="font-bold text-zinc-950 uppercase">{activeSession.step}</span></p>
                </div>
              </div>
              <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Monitoreo Activo
              </span>
            </div>

            {/* Transcript Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-50/30 custom-scrollbar">
              {activeSession.messages.map((msg, idx) => {
                const isHumanTakeover = msg.text.startsWith('[Asesor Humano]')
                const cleanText = isHumanTakeover ? msg.text.replace('[Asesor Humano]: ', '') : msg.text
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex w-full",
                      msg.sender === 'user' ? "justify-start" : "justify-end"
                    )}
                  >
                    <div className="flex items-start gap-2.5 max-w-[75%]">
                      {msg.sender === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-600 font-bold shrink-0 mt-0.5 shadow-sm">
                          U
                        </div>
                      )}
                      <div className={cn(
                        "rounded-xl px-3.5 py-2 text-xs shadow-sm",
                        msg.sender === 'user' 
                          ? "bg-white text-zinc-900 rounded-tl-none border border-zinc-100 font-medium" 
                          : isHumanTakeover
                          ? "bg-blue-600 text-white rounded-tr-none font-bold shadow-md"
                          : "bg-zinc-900 text-white rounded-tr-none font-medium"
                      )}>
                        {isHumanTakeover && (
                          <span className="block text-[8px] opacity-75 font-black uppercase tracking-wider mb-1">
                            Intervención Humana
                          </span>
                        )}
                        <p className="leading-relaxed break-words">{cleanText}</p>
                        <span className={cn(
                          "block text-[8px] text-right mt-1.5 leading-none tabular-nums font-bold select-none",
                          msg.sender === 'user' || isHumanTakeover ? "opacity-60" : "text-zinc-400"
                        )}>
                          {msg.time}
                        </span>
                      </div>
                      {msg.sender === 'bot' && (
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm",
                          isHumanTakeover ? "bg-blue-100 text-blue-700 font-bold text-[9px]" : "bg-zinc-950 text-white"
                        )}>
                          {isHumanTakeover ? 'Yo' : <Bot className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Human Takeover Action Panel */}
            <div className="p-4 bg-white border-t border-zinc-200/60 shrink-0 space-y-3">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/50 rounded-xl p-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wide leading-none">
                  El bot está respondiendo automáticamente. Al enviar un mensaje tomarás el control.
                </p>
              </div>

              <form onSubmit={handleTakeover} className="flex gap-2">
                <input
                  type="text"
                  value={takeoverText}
                  onChange={e => setTakeoverText(e.target.value)}
                  placeholder="Escribe para intervenir y responder al cliente..."
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-zinc-300 font-medium"
                />
                <button
                  type="submit"
                  disabled={!takeoverText.trim()}
                  className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 text-xs shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
            <MessageCircle className="w-12 h-12 text-zinc-200 mb-2" />
            <p className="font-bold text-xs uppercase tracking-wider">Selecciona un chat para ver el historial</p>
          </div>
        )}
      </div>
    </div>
  )
}
