'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  X,
  Loader2,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type ImageTargetType = 'banner' | 'logo' | 'heroPanel' | 'general'

interface AiImageGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  target: ImageTargetType
  targetLabel?: string
  storeName?: string
  onApplyImage: (imageUrl: string) => void
}

const TARGET_PRESETS: Record<ImageTargetType, { title: string; defaultPrompt: string; chips: string[] }> = {
  banner: {
    title: 'Banner / Portada Principal',
    defaultPrompt: 'Fotografía comercial editorial de portada en alta definición, iluminación de estudio suave, estética de marca de lujo contemporánea',
    chips: [
      'Ambiente cálido & artesanal con iluminación suave',
      'Minimalista de lujo contemporáneo en estudio',
      'Estilo cinematográfico 8K con profundidad de campo',
      'Texturas naturales, madera noble y tonos tierra',
      'Estilo urbano moderno con sombras geométricas limpias',
    ],
  },
  logo: {
    title: 'Logotipo de Marca',
    defaultPrompt: 'Logotipo vectorial minimalista de alta gama, isotipo geométrico elegante sobre fondo blanco puro',
    chips: [
      'Isotipo geométrico minimalista en negro sobre blanco',
      'Monograma tipográfico elegante de lujo',
      'Emblema circular moderno estilo nórdico',
      'Símbolo orgánico y botánico estilizado',
    ],
  },
  heroPanel: {
    title: 'Panel Editorial del Hero Collage',
    defaultPrompt: 'Fotografía vertical de producto en primer plano, composición limpia, enfoque nítido de alta resolución',
    chips: [
      'Primer plano de producto con iluminación lateral natural',
      'Textura en detalle macro de alta definición',
      'Bodegón minimalista sobre superficie de piedra o lino',
      'Toma editorial de catálogo de moda / lifestyle',
    ],
  },
  general: {
    title: 'Imagen Comercial',
    defaultPrompt: 'Fotografía profesional de producto en estudio con iluminación cinematográfica y alta resolución',
    chips: [
      'Composición limpia de producto en estudio',
      'Estética editorial de revista moderna',
      'Fondo neutro luminoso con sombras suaves',
    ],
  },
}

export function AiImageGeneratorModal({
  isOpen,
  onClose,
  target,
  targetLabel,
  storeName = 'Mi Tienda',
  onApplyImage,
}: AiImageGeneratorModalProps) {
  const preset = TARGET_PRESETS[target] || TARGET_PRESETS.general
  const [prompt, setPrompt] = useState(preset.defaultPrompt)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    const toastId = toast.loading('Generando imagen con IA (~8-10 segundos)...')

    try {
      const res = await fetch('/api/stores/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          target,
          aspectRatio: target === 'banner' ? '16:9' : target === 'logo' ? '1:1' : '4:5',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || 'No se pudo generar la imagen')
      }

      setGeneratedUrl(data.imageUrl)
      toast.success('¡Imagen generada exitosamente!', { id: toastId })
    } catch (err: any) {
      console.error('Error generating image:', err)
      toast.error(err?.message || 'Error al conectar con el servicio de IA.', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = () => {
    if (!generatedUrl) return
    onApplyImage(generatedUrl)
    toast.success('Imagen aplicada a tu tienda.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-zinc-800" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 leading-tight">
                Generar Imagen con IA
              </h3>
              <p className="text-[11px] font-medium text-zinc-400">
                {targetLabel || preset.title} • {storeName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Prompt textarea */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
              Describe lo que deseas generar
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={3}
              placeholder="Ej: Fotografía cinematográfica de una taza de café humeante sobre mesa de roble rústico..."
              className="w-full text-xs font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Inspiration chips */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Ideas rápidas para este bloque:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {preset.chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(chip)}
                  disabled={isGenerating}
                  className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/60 rounded-lg transition-colors cursor-pointer text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Preview if generated */}
          {generatedUrl ? (
            <div className="space-y-2 pt-2 text-left">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Resultado Generado:
              </span>
              <div className="relative rounded-xl border border-zinc-200 overflow-hidden bg-zinc-950 flex items-center justify-center max-h-64">
                <img
                  src={generatedUrl}
                  alt="Generado por IA"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-200 rounded-xl p-6 text-center bg-zinc-50/50 flex flex-col items-center justify-center gap-1.5">
              <ImageIcon className="w-8 h-8 text-zinc-300" />
              <p className="text-xs font-semibold text-zinc-500">
                La imagen generada por IA se previsualizará aquí
              </p>
              <p className="text-[10px] text-zinc-400">
                Impulsado por Gemini & Flux en alta resolución
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer',
              generatedUrl
                ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200'
                : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando (~8s)...</span>
              </>
            ) : generatedUrl ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerar otra</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generar con IA</span>
              </>
            )}
          </button>

          {generatedUrl && (
            <button
              type="button"
              onClick={handleApply}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar a mi Tienda</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

