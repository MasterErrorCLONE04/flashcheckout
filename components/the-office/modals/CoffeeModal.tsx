'use client'

import React from 'react'
import { X, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '../types'

interface CoffeeModalProps {
  isOpen: boolean
  onClose: () => void
  agentsList: Agent[]
  boostedAgents: Record<string, boolean>
  onBoostAgent: (agent: Agent) => void
}

export function CoffeeModal({
  isOpen,
  onClose,
  agentsList,
  boostedAgents,
  onBoostAgent
}: CoffeeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4 select-none">
          <Coffee className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Bar de Café Premium</h2>
        </div>

        <p className="text-xs text-zinc-500 mb-4 font-semibold">
          Invita una taza de café recién preparado a tus agentes para optimizar sus tiempos de respuesta y darles un empujón de energía.
        </p>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {agentsList.map(agent => {
            const isBoosted = boostedAgents[agent.id]
            return (
              <div key={agent.id} className="flex justify-between items-center bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{agent.avatarEmoji}</span>
                  <div className="text-left">
                    <span className="text-xs font-bold text-zinc-900 block">{agent.name}</span>
                    <span className="text-[10px] text-zinc-500 block font-semibold">{agent.role}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onBoostAgent(agent)}
                  disabled={isBoosted}
                  className={cn(
                    "text-[10px] font-black rounded-lg px-3 py-1.5 select-none transition-all active:scale-95 cursor-pointer",
                    isBoosted 
                      ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed active:scale-100" 
                      : "bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                  )}
                >
                  {isBoosted ? 'Con Cafeína ⚡' : 'Invitar Café ☕'}
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
