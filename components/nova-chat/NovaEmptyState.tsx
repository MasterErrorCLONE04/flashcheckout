'use client'

import React from 'react'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentItem } from './types'

interface NovaEmptyStateProps {
  selectedAgent: AgentItem
  merchantName: string
  onSuggestionClick: (suggestion: string) => void
}

export function NovaEmptyState({
  selectedAgent,
  merchantName,
  onSuggestionClick
}: NovaEmptyStateProps) {
  const firstName = merchantName.split(' ')[0] || 'Comerciante'

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 flex flex-col justify-center items-center text-center space-y-8 select-none py-12">
      <div className={cn("w-14 h-14 rounded-full border flex items-center justify-center shadow-sm", selectedAgent.colorClass)}>
        <Bot className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-lg">
        <h1 className="text-3xl font-medium text-zinc-800 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-300">
          ¿Cómo puedo ayudarte, {firstName}?
        </h1>
        <p className="text-xs xl:text-sm font-semibold text-zinc-400 animate-in fade-in duration-300">
          Hablas con <span className="font-bold text-zinc-900">{selectedAgent.name}</span> ({selectedAgent.role}). {selectedAgent.description}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center w-full max-w-lg">
        {[
          { label: '🛍️ Crear producto', value: 'producto' },
          { label: '📦 Ver pedidos', value: 'pedidos' },
          { label: '🏷️ Crear descuento', value: 'descuento' }
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(btn.value)}
            className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50/50 hover:border-zinc-300 text-zinc-700 text-xs font-semibold rounded-full transition-all shadow-sm cursor-pointer select-none active:scale-95 animate-in fade-in duration-300"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
