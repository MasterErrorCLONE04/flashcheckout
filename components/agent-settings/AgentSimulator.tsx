'use client'

import React, { useRef, useEffect } from 'react'
import {
  RefreshCw,
  ShoppingBag,
  Star,
  MessageSquare,
  Zap,
  Globe,
  Send,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentSettingsState } from './useAgentSettingsState'

interface AgentSimulatorProps {
  agent: AgentSettingsState
  storeName: string
  storeSlug: string
}

export function AgentSimulator({
  agent,
  storeName,
  storeSlug
}: AgentSimulatorProps) {
  const {
    settings,
    checkoutMode,
    chatMessages,
    setChatMessages,
    isTyping,
    inputText,
    setInputText,
    handleSendMessage
  } = agent

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isTyping])

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Cabecera del Inspector / Simulador */}
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
            Simulador de WhatsApp en Vivo
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            setChatMessages([
              {
                sender: 'bot',
                text: settings.welcomeMessage || '¡Hola! Bienvenido.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                options: ['Ver productos', 'Recomendaciones', 'Consultar pedido'],
                actionButton:
                  checkoutMode === 'WHATSAPP_FLOW'
                    ? { text: 'Ver Catálogo 🛍️', type: 'flow' }
                    : { text: '🛍️ Abrir Catálogo Web', type: 'web', url: `/tienda/${storeSlug}` }
              }
            ])
          }
          className="h-7 px-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          title="Reiniciar conversación"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* Marco del Chat de WhatsApp */}
      <div className="flex-1 min-h-0 p-3.5 bg-[#F4F4F5] flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col bg-[#E5DDD5] border border-zinc-300/80 rounded-2xl overflow-hidden shadow-sm">
          {/* Barra superior de WhatsApp */}
          <div className="bg-[#0B665C] px-3.5 py-2.5 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-700 font-extrabold text-[13px]">
                🤖
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold leading-none truncate flex items-center gap-1">
                  <span>{storeName}</span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border border-emerald-600 text-[6px]">
                    ✔
                  </span>
                </h4>
                <span className="text-[9.5px] opacity-80 font-semibold mt-0.5 block leading-none">
                  {settings.active ? 'Agente IA en línea' : 'Agente en pausa'}
                </span>
              </div>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20 text-emerald-100">
              {checkoutMode === 'WHATSAPP_FLOW' ? 'Flows' : 'Web'}
            </span>
          </div>

          {/* Flujo de mensajes */}
          <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className={cn('flex w-full', msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'relative max-w-[86%] rounded-xl px-3.5 py-2 text-[12px] leading-relaxed shadow-2xs',
                      msg.sender === 'user'
                        ? 'bg-[#DCF8C6] text-zinc-900 rounded-tr-none'
                        : 'bg-white text-zinc-900 rounded-tl-none'
                    )}
                  >
                    <p className="font-medium whitespace-pre-line">{msg.text}</p>
                    <span className="block text-[8.5px] text-zinc-400 text-right mt-1 leading-none font-bold">
                      {msg.time}
                    </span>
                  </div>
                </div>

                {/* Tarjeta de botón interactivo (Flow vs Web) */}
                {msg.actionButton && (
                  <div className="flex justify-start pl-1">
                    <div className="w-full max-w-[86%] bg-white border border-zinc-200/90 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                            msg.actionButton.type === 'flow'
                              ? 'bg-zinc-950 text-white'
                              : 'bg-emerald-600 text-white'
                          )}
                        >
                          {msg.actionButton.type === 'flow' ? (
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                          ) : (
                            <Globe className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-zinc-900 block truncate leading-tight">
                            {msg.actionButton.text}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium block truncate">
                            {msg.actionButton.type === 'flow'
                              ? 'Formulario Nativo en WhatsApp'
                              : `/tienda/${storeSlug}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                        {msg.actionButton.type === 'flow' ? '⚡ Flow' : '↗ Web'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Sugerencias rápidas */}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 justify-start pl-1">
                    {msg.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => setInputText(opt)}
                        className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        {opt === 'Ver productos' && <ShoppingBag className="w-3 h-3 text-zinc-400" />}
                        {opt === 'Recomendaciones' && <Star className="w-3 h-3 text-zinc-400" />}
                        {opt === 'Consultar pedido' && <MessageSquare className="w-3 h-3 text-zinc-400" />}
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex w-full justify-start animate-pulse">
                <div className="bg-white rounded-xl px-3.5 py-2 text-[10.5px] text-zinc-500 font-bold rounded-tl-none">
                  Nova está respondiendo...
                </div>
              </div>
            )}
          </div>

          {/* Barra de escritura */}
          <form
            onSubmit={handleSendMessage}
            className="bg-white border-t border-zinc-200/80 p-2 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe para probar tu agente en vivo..."
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-3.5 py-1.5 text-xs outline-none focus:bg-white focus:border-zinc-950 transition-all font-medium text-zinc-900"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Pie informativo */}
      <div className="px-4 py-2.5 border-t border-zinc-200 bg-zinc-50/70 flex items-center gap-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <p className="text-[10.5px] text-zinc-500 font-medium leading-snug">
          Conectado al motor real de tu tienda (catálogo, FAQs y automatizaciones).
        </p>
      </div>
    </div>
  )
}
