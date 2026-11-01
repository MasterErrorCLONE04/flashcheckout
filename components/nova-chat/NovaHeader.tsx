'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronDown, Bot, Brain, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { NovaChatState } from './useNovaChatState'
import { AGENTS } from './constants'

interface NovaHeaderProps {
  chat: NovaChatState
}

export function NovaHeader({ chat }: NovaHeaderProps) {
  const {
    selectedAgent,
    setSelectedAgent,
    showAgentDropdown,
    setShowAgentDropdown,
    setShowMemoryModal
  } = chat

  return (
    <header className="flex items-center justify-between px-6 py-2.5 bg-white shrink-0 border-b border-zinc-100 relative z-30">
      <div className="flex flex-col text-left relative">
        <div 
          onClick={() => setShowAgentDropdown(!showAgentDropdown)}
          className="flex items-center gap-1 text-base font-bold text-zinc-900 cursor-pointer hover:bg-zinc-50 px-2 py-0.5 rounded transition-colors group select-none"
        >
          <span>{selectedAgent.name}</span>
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </div>

        {showAgentDropdown && (
          <div className="absolute left-0 mt-8 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-200 select-none">
            <span className="block px-4 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">Seleccionar Agente</span>
            <div className="max-h-80 overflow-y-auto">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent)
                    setShowAgentDropdown(false)
                    toast.success(`Agente cambiado a ${agent.name}`)
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-50 last:border-b-0",
                    selectedAgent.id === agent.id && "bg-zinc-50"
                  )}
                >
                  <div className={cn("w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border", agent.colorClass)}>
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs xl:text-sm text-zinc-905">{agent.name}</span>
                      <span className="text-[10px] text-zinc-400 font-bold font-sans">({agent.role})</span>
                    </div>
                    <p className="text-[10px] xl:text-[11px] font-semibold text-zinc-400 mt-1 leading-normal">{agent.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-zinc-500 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          <span>En línea · <span className="text-zinc-400 font-semibold">{selectedAgent.role}</span></span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowMemoryModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold rounded-lg border border-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Brain className="w-3.5 h-3.5 text-zinc-500" />
          <span>Mostrar memoria</span>
        </button>
        <Link href="/pricing">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95">
            <Sparkles className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
            <span>Mejorar el plan</span>
          </button>
        </Link>
      </div>
    </header>
  )
}
