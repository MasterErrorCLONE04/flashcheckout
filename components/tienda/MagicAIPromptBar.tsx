'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MagicAIPromptBarProps {
  onGenerate: (params: { prompt: string; scope: 'all' | 'style' | 'copy'; category?: string }) => Promise<void>
  onUndo: () => void
  canUndo: boolean
  isGenerating: boolean
}

const INSTANT_PILLS = [
  {
    label: '☕ Café de Especialidad',
    prompt: 'Tienda de café especial colombiano de origen. Tonos tierra, crema y acento verde bosque. Tipografía Cormorant Garamond elegante, fotos de café artesanal recién tostado y preguntas frecuentes sobre envíos contra entrega.',
  },
  {
    label: '👟 Streetwear Urbano',
    prompt: 'Marca de ropa urbana y zapatillas streetwear. Estética oscura moderna en negro y grafito con acento neón. Tipografía Sora bold, fotos urbanas con energía y garantía de cambios fáciles de talla.',
  },
  {
    label: '🌸 Skincare Natural',
    prompt: 'Línea de cuidado facial y cosméticos orgánicos. Fondo blanco puro, toques rosa cuarzo y verde oliva. Tipografía limpia Plus Jakarta Sans, fotos de pureza e ingredientes naturales.',
  },
  {
    label: '💎 Joyería Fina',
    prompt: 'Joyería fina en plata y oro con diseño minimalista contemporáneo. Lujo silencioso, fondo crema marfil, tipografía serif refinada y certificado de autenticidad garantizado.',
  },
  {
    label: '⚡ Tecnología & Audio',
    prompt: 'Tienda de gadgets tecnológicos, audífonos y accesorios inteligentes. Estilo limpio con acentos azul eléctrico, tipografía técnica Space Grotesk y despacho express 24h.',
  },
  {
    label: '🍔 Comida & Gourmet',
    prompt: 'Negocio de hamburguesas artesanales y comida gourmet. Tonos cálidos apetitosos, fotos irresistibles y botón destacado para pedir directo a domicilio por WhatsApp.',
  },
]

export function MagicAIPromptBar({
  onGenerate,
  onUndo,
  canUndo,
  isGenerating,
}: MagicAIPromptBarProps) {
  const [prompt, setPrompt] = useState('')
  const [activePill, setActivePill] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = prompt.trim()
    if (!text || isGenerating) return
    await onGenerate({ prompt: text, scope: 'all' })
  }

  const handlePillClick = async (pill: (typeof INSTANT_PILLS)[0]) => {
    if (isGenerating) return
    setActivePill(pill.label)
    setPrompt(pill.prompt)
    await onGenerate({ prompt: pill.prompt, scope: 'all' })
  }

  return (
    <div className="w-full bg-linear-to-r from-emerald-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-3 sm:p-3.5 shadow-lg border border-emerald-500/20 select-none text-left space-y-2.5 transition-all">
      {/* Main Command Input Row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none text-emerald-400">
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            )}
          </div>
          <input
            type="text"
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
              setActivePill(null)
            }}
            placeholder="Pídele a la IA: 'Tienda de café especial tonos tierra', 'Moda urbana negra y neón'..."
            disabled={isGenerating}
            className="w-full text-xs sm:text-[13px] font-medium bg-zinc-950/80 border border-zinc-700/60 rounded-xl pl-9 pr-24 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              'absolute right-1.5 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 shadow-xs',
              !prompt.trim() || isGenerating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
            )}
          >
            <span>{isGenerating ? 'Diseñando...' : 'Crear'}</span>
            {!isGenerating && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Undo Button if available */}
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shrink-0"
            title="Restaurar diseño anterior"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Deshacer</span>
          </button>
        )}
      </form>

      {/* 1-Click Instant Ideas Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0 mr-0.5">
          1-Clic:
        </span>
        {INSTANT_PILLS.map(pill => {
          const isSelected = activePill === pill.label

          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => handlePillClick(pill)}
              disabled={isGenerating}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer border shrink-0 whitespace-nowrap',
                isSelected
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-extrabold shadow-xs'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border-zinc-700/60'
              )}
            >
              {pill.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

