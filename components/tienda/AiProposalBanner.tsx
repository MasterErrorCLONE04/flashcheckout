'use client'

import React from 'react'
import { Sparkles, RotateCcw, Check, SlidersHorizontal } from 'lucide-react'

interface AiProposalBannerProps {
  isVisible: boolean
  onAccept: () => void
  onUndo: () => void
  onRefine: () => void
}

export function AiProposalBanner({
  isVisible,
  onAccept,
  onUndo,
  onRefine,
}: AiProposalBannerProps) {
  if (!isVisible) return null

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] animate-in slide-in-from-top-3 duration-300 select-none">
      <div className="bg-zinc-950/95 backdrop-blur-md text-white border border-zinc-700/80 rounded-2xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold leading-none text-zinc-100 flex items-center gap-1.5">
              <span>Propuesta IA aplicada al visor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-[10.5px] text-zinc-400 font-medium leading-none mt-1 truncate">
              ¿Te gusta cómo se ve o prefieres deshacer / ajustar?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refine */}
          <button
            type="button"
            onClick={onRefine}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border-0 bg-transparent"
            title="Ajustar prompt"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Ajustar</span>
          </button>

          {/* Undo */}
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer border border-amber-500/30 bg-transparent"
            title="Restaurar diseño anterior"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Deshacer</span>
          </button>

          {/* Keep */}
          <button
            type="button"
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer border-0 shadow-xs"
            title="Aceptar este diseño"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mantener</span>
          </button>
        </div>
      </div>
    </div>
  )
}

