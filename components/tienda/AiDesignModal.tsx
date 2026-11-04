'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  X,
  Loader2,
  Palette,
  FileText,
  Zap,
  Check,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AIScope = 'all' | 'style' | 'copy'

interface AiDesignModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (params: { prompt: string; scope: AIScope }) => Promise<void>
  isGenerating: boolean
  initialPrompt?: string
}

const INSPIRATION_CHIPS = [
  {
    label: '☕ Café Gourmet de Origen',
    prompt: 'Tienda de café especial colombiano de origen. Paleta cálida con tonos tierra, crema y acento verde bosque. Tipografía editorial elegante, hero enfocado en café artesanal recién tostado y preguntas frecuentes sobre envíos a todo el país y pago contra entrega.',
  },
  {
    label: '👟 Streetwear Urbano & Minimal',
    prompt: 'Marca de ropa urbana y zapatillas streetwear. Estética monocromática moderna en negro y grafito con acentos neón sutiles. Tipografía futurista bold, collage con fotos urbanas de alta energía y garantía de cambios fáciles de talla.',
  },
  {
    label: '🌸 Cosmética Natural & Skincare',
    prompt: 'Línea de cuidado facial y cosméticos orgánicos veganos. Fondo limpio, toques rosa cuarzo y verde oliva. Textos centrados en ingredientes botánicos, pureza y ritual de cuidado en 3 pasos con reseñas 5 estrellas.',
  },
  {
    label: '💎 Joyería de Lujo & Artesanal',
    prompt: 'Joyería fina en plata y oro con diseño minimalista contemporáneo. Estética de lujo silencioso Waterdrop, fuentes serif refinadas, fotografía macro de joyas y énfasis en certificado de autenticidad.',
  },
  {
    label: '⚡ Tecnología & Gadgets',
    prompt: 'Tienda de gadgets de alta tecnología y accesorios inteligentes. Estilo limpio y tecnológico, acentos azul eléctrico, tarjetas con especificaciones claras y respuestas rápidas sobre despacho express en 24 horas.',
  },
]

export function AiDesignModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  initialPrompt = '',
}: AiDesignModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [scope, setScope] = useState<AIScope>('all')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return
    await onGenerate({ prompt: prompt.trim(), scope })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden select-none text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-linear-to-r from-zinc-50 via-white to-emerald-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                <span>Copiloto de Diseño con IA</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Magic Studio
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-0.5">
                Especifica en lenguaje natural cómo quieres tu tienda y la transformaremos en vivo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Natural Language Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
              <span>¿Cómo imaginas tu tienda?</span>
              <span className="text-[11px] font-normal text-zinc-400">
                Giro, colores, público o sensaciones
              </span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ej: Quiero una tienda para vender café especial colombiano de origen. Tonos tierra y verde bosque, tipografía elegante, hero collage llamativo y preguntas frecuentes sobre envíos contra entrega..."
              className="w-full text-xs font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-zinc-400 leading-relaxed resize-none shadow-2xs"
              disabled={isGenerating}
              autoFocus
            />
          </div>

          {/* Quick Inspiration Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>O elige una idea con 1 clic:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setPrompt(chip.prompt)}
                  disabled={isGenerating}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors cursor-pointer border-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-zinc-800 block">
              Alcance de la transformación:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('all')}
                disabled={isGenerating}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  scope === 'all'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  {scope === 'all' && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <span className="text-[11.5px] font-extrabold leading-none mt-0.5">Tienda Completa</span>
                <span className="text-[10px] text-zinc-400 font-medium leading-tight">
                  Diseño, paleta y textos persuasivos
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('style')}
                disabled={isGenerating}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  scope === 'style'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  {scope === 'style' && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <span className="text-[11.5px] font-extrabold leading-none mt-0.5">Solo Estética</span>
                <span className="text-[10px] text-zinc-400 font-medium leading-tight">
                  Colores, tipografía y estilo visual
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('copy')}
                disabled={isGenerating}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                  scope === 'copy'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  {scope === 'copy' && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <span className="text-[11.5px] font-extrabold leading-none mt-0.5">Solo Copys</span>
                <span className="text-[10px] text-zinc-400 font-medium leading-tight">
                  Hero, historias y preguntas frecuentes
                </span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border-0 bg-transparent"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 text-white shadow-xs',
                !prompt.trim() || isGenerating
                  ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
                  : 'bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Diseñando tu tienda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transformar Tienda con IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

