'use client'

import React from 'react'
import { X, Cpu, Activity, Coins, TrendingUp, Trash2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from './types'

interface AgentInspectorDrawerProps {
  selectedAgent: Agent | null
  processedSprites: Record<string, string>
  activeTab: 'console' | 'profile'
  setActiveTab: (tab: 'console' | 'profile') => void
  terminalLogs: Record<string, string[]>
  submitting: boolean
  terminalEndRef: React.RefObject<HTMLDivElement | null>
  instruction: string
  setInstruction: (val: string) => void
  agentStatus: Record<string, string>
  handleSendCommand: (e: React.FormEvent) => void
  handleDismissAgent: (id: string) => void
  onClose: () => void
}

export function AgentInspectorDrawer({
  selectedAgent,
  processedSprites,
  activeTab,
  setActiveTab,
  terminalLogs,
  submitting,
  terminalEndRef,
  instruction,
  setInstruction,
  agentStatus,
  handleSendCommand,
  handleDismissAgent,
  onClose
}: AgentInspectorDrawerProps) {
  if (!selectedAgent) return null

  const isBusy = !!agentStatus[selectedAgent.id] && agentStatus[selectedAgent.id] !== 'idle'

  return (
    <>
      {/* Dim backdrop cover */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/10 z-40 transition-all duration-300" 
      />

      {/* Slide-over Inspector Agent Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 select-text text-zinc-800 font-sans">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
              <img 
                src={processedSprites[selectedAgent.id] || selectedAgent.spriteUrl} 
                alt={selectedAgent.name} 
                className="w-9 h-9 object-contain mix-blend-multiply"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-zinc-900 text-sm xl:text-base">{selectedAgent.name}</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-250 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                  En línea
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{selectedAgent.role}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Tabs (Segmented control style) */}
        <div className="flex bg-zinc-100 p-1 rounded-xl gap-1 mx-4 my-2.5 select-none border border-zinc-200/60">
          <button 
            onClick={() => setActiveTab('console')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold text-center rounded-lg outline-none cursor-pointer transition-all",
              activeTab === 'console' ? "bg-white text-zinc-800 shadow-sm border border-zinc-200/40" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Consola del Agente
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold text-center rounded-lg outline-none cursor-pointer transition-all",
              activeTab === 'profile' ? "bg-white text-zinc-800 shadow-sm border border-zinc-200/40" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Especificaciones y Perfil
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 pt-1.5 select-text">
          {activeTab === 'console' ? (
            /* Monospace console logs */
            <div className="w-full h-full bg-zinc-95 border border-zinc-200 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-sm min-h-[300px]">
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-zinc-650 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                {terminalLogs[selectedAgent.id]?.map((log, index) => {
                  const isOrder = log.includes('> ORDEN')
                  const isError = log.includes('[ERROR]')
                  const isSystem = log.includes('[System]') || log.includes('inicializada') || log.includes('activo') || log.includes('en línea')
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "whitespace-pre-wrap leading-relaxed",
                        isOrder ? "text-purple-600 font-bold border-b border-zinc-100 pb-1" : 
                        isError ? "text-red-500 animate-pulse" :
                        isSystem ? "text-zinc-400 font-bold" : 
                        "text-zinc-600"
                      )}
                    >
                      {log}
                    </div>
                  )
                })}
                {submitting && (
                  <div className="text-zinc-500 font-bold animate-pulse flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <span>{selectedAgent.name} está procesando...</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          ) : (
            /* Technical Specs Profile cards */
            <div className="space-y-5 text-left text-zinc-700">
              <div>
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Descripción del Agente</h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-semibold mt-1.5">{selectedAgent.description}</p>
              </div>

              <div className="h-px bg-zinc-200" />

              {/* Tech specifications grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                  <Cpu className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Modelo LLM</span>
                    <span className="text-xs font-black text-zinc-900 mt-1 block truncate leading-none" title={selectedAgent.model}>
                      {selectedAgent.model.split('/').pop()}
                    </span>
                  </div>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                  <Activity className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Latencia Promedio</span>
                    <span className="text-xs font-black text-zinc-900 mt-1 block leading-none">{selectedAgent.latency}</span>
                  </div>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                  <Coins className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Tokens Consumidos</span>
                    <span className="text-xs font-black text-zinc-900 mt-1 block leading-none font-mono">{selectedAgent.tokensUsed.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                  <TrendingUp className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Efectividad (Acc)</span>
                    <span className="text-xs font-black text-zinc-900 mt-1 block leading-none">{selectedAgent.accuracy}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-zinc-200" />

              {/* Scope capabilities lists */}
              <div>
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Herramientas Autorizadas</h4>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedAgent.tools.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-650 font-mono text-[10px] rounded-lg">
                      🔧 {t}
                    </span>
                  ))}
                </div>

                {/* Dismiss agent option if it is custom */}
                {selectedAgent.id.startsWith('Custom_') && (
                  <button
                    onClick={() => handleDismissAgent(selectedAgent.id)}
                    className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-extrabold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer select-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    Despedir Agente de la Oficina
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Prompt Entry form bar (Only active in Console tab) */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 select-none">
          {activeTab === 'console' ? (
            <form onSubmit={handleSendCommand} className="flex gap-2 relative">
              <input
                type="text"
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                placeholder={
                  isBusy
                    ? `${selectedAgent.name} está ocupado moviéndose...`
                    : `Enviar orden a ${selectedAgent.name}...`
                }
                disabled={submitting || isBusy}
                className="flex-1 bg-white border border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none transition-all font-semibold pr-10 disabled:opacity-75 placeholder:text-zinc-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={!instruction.trim() || submitting || isBusy}
                className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg cursor-pointer transition-all active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:scale-100"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="py-2.5 text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              Visualización de Especificaciones Técnicas
            </div>
          )}
        </div>

      </div>
    </>
  )
}
