'use client'

import React from 'react'
import {
  RefreshCw,
  ShoppingBag,
  Star,
  MessageSquare,
  Zap,
  Globe,
  Smile,
  Paperclip,
  Send,
  AlertCircle
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

  return (
    <div className="lg:col-span-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-900">Vista previa del chat</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Así verán tus clientes la conversación con tu agente.
        </p>
      </div>

      {/* WhatsApp Phone Mockup Frame */}
      <div className="flex flex-col h-[520px] bg-[#E5DDD5] border border-zinc-200 rounded-lg overflow-hidden shadow-none select-none relative">
        {/* WhatsApp Mock Top Bar */}
        <div className="bg-[#0B665C] px-3.5 py-2.5 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Left Back Arrow Mock */}
            <span className="text-sm font-bold opacity-80 cursor-pointer hover:opacity-100 shrink-0">{"‹"}</span>
            
            {/* Avatar Profile */}
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-700 font-extrabold text-[13px]">
              🤖
            </div>
            
            <div className="min-w-0 flex flex-col justify-center">
              <h4 className="text-xs font-bold leading-none truncate flex items-center gap-1">
                <span>{storeName}</span>
                {/* Green Verified Badge */}
                <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border border-emerald-600 text-[6px]">✔</span>
              </h4>
              <span className="text-[9px] opacity-75 font-semibold mt-0.5 leading-none">En línea</span>
            </div>
          </div>

          <button 
            onClick={() => setChatMessages([
              { 
                sender: 'bot', 
                text: settings.welcomeMessage || '¡Hola! Bienvenido.', 
                time: '10:30 AM',
                options: ['Ver productos', 'Recomendaciones', 'Consultar pedido'],
                actionButton: checkoutMode === 'WHATSAPP_FLOW'
                  ? { text: 'Ver Catálogo 🛍️', type: 'flow' }
                  : { text: '🛍️ Abrir Catálogo Web', type: 'web', url: `/tienda/${storeSlug}` }
              }
            ])}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center active:scale-90 transition-transform shrink-0 cursor-pointer"
            title="Reiniciar chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div className={cn("flex w-full", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  "relative max-w-[85%] rounded-lg px-3.5 py-2 text-[12px] shadow-none leading-relaxed",
                  msg.sender === 'user' 
                    ? 'bg-[#DCF8C6] text-zinc-900 rounded-tr-none' 
                    : 'bg-white text-zinc-900 rounded-tl-none'
                )}>
                  {/* Message text */}
                  <p className="font-semibold whitespace-pre-line">{msg.text}</p>
                  
                  <span className="block text-[8px] text-zinc-400 text-right mt-1 leading-none font-bold">
                    {msg.time}
                  </span>
                </div>
              </div>

              {/* Action Button (Flow vs Web button) */}
              {msg.actionButton && (
                <div className="flex justify-start pl-1 pt-0.5">
                  <div className="w-full max-w-[85%] bg-white border border-zinc-200/90 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        msg.actionButton.type === 'flow'
                          ? "bg-purple-600 text-white"
                          : "bg-emerald-600 text-white"
                      )}>
                        {msg.actionButton.type === 'flow' ? (
                          <Zap className="w-4 h-4 text-amber-300" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-zinc-900 block leading-tight">
                          {msg.actionButton.text}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium">
                          {msg.actionButton.type === 'flow' ? 'Formulario Nativo en WhatsApp' : `tienda.flashcheckout.com/${storeSlug}`}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                      msg.actionButton.type === 'flow'
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}>
                      {msg.actionButton.type === 'flow' ? '⚡ Flow' : '↗ Web'}
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive Button Options below welcome message */}
              {msg.options && (
                <div className="flex flex-wrap gap-1.5 justify-start pl-1">
                  {msg.options.map((opt, optIdx) => (
                    <button 
                      key={optIdx}
                      onClick={() => {
                        setInputText(opt)
                      }}
                      className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-none transition-all active:scale-95 cursor-pointer shrink-0"
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
              <div className="bg-white rounded-lg px-3.5 py-2 text-[10px] text-zinc-400 font-bold shadow-none rounded-tl-none">
                Agente escribiendo...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input form bar */}
        <form onSubmit={handleSendMessage} className="bg-white border-t border-zinc-200/80 p-2.5 flex items-center gap-2 shrink-0">
          <Smile className="w-5 h-5 text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-600" />
          <Paperclip className="w-5 h-5 text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-600" />
          
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-1.5 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all font-semibold"
          />
          
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 shrink-0 shadow-none cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </form>
      </div>

      {/* Simulated Chat Warning Footer */}
      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 font-bold leading-normal">
          El agente usará IA para entender y responder de forma automática según las instrucciones configuradas.
        </p>
      </div>
    </div>
  )
}
