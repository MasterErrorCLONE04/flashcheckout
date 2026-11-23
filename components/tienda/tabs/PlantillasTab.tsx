'use client'

import React, { useState } from 'react'
import {
  LayoutTemplate,
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TiendaFormState } from '../useTiendaForm'

interface PlantillasTabProps {
  form: TiendaFormState
}

interface TemplatePreset {
  id: string
  name: string
  category: string
  tagline: string
  colors: string[]
  prompt: string
}

const STORE_TEMPLATES: TemplatePreset[] = [
  {
    id: 'cafe',
    name: 'Café de Especialidad',
    category: 'Gourmet & Origen',
    tagline: 'Estética cálida en tonos tierra, barismo artesanal y notas editoriales.',
    colors: ['#2B1E16', '#8C6239', '#C9A96E', '#F5EFEB'],
    prompt: 'Tienda de café especial de origen. Paleta cálida con tonos tierra, crema y acento café oscuro. Tipografía editorial elegante, hero enfocado en café recién tostado y preguntas frecuentes sobre envíos y trazabilidad.',
  },
  {
    id: 'streetwear',
    name: 'Streetwear & Moda Urbana',
    category: 'Moda & Calzado',
    tagline: 'Look contemporáneo monocromático negro y grafito de alta energía.',
    colors: ['#09090B', '#27272A', '#71717A', '#F4F4F5'],
    prompt: 'Marca de ropa urbana y zapatillas streetwear. Estética monocromática moderna en negro y grafito. Tipografía futurista bold y collage de alta energía.',
  },
  {
    id: 'skincare',
    name: 'Skincare Natural & Botánico',
    category: 'Belleza & Cuidado',
    tagline: 'Diseño limpio con tonos arena, pureza botánica y ritual en 3 pasos.',
    colors: ['#2D3748', '#8A9A86', '#D6C7B2', '#FAF7F2'],
    prompt: 'Línea de cuidado facial y cosméticos orgánicos botánicos. Fondo limpio, toques arena suave y oliva. Textos centrados en ingredientes limpios, pureza y ritual de 3 pasos.',
  },
  {
    id: 'joyeria',
    name: 'Joyería Fina & Silenciosa',
    category: 'Lujo & Accesorios',
    tagline: 'Lujo sutil Waterdrop con serif refinado, dorados nobles y fondos limpios.',
    colors: ['#1A1A1A', '#D4AF37', '#8E8E93', '#FFFFFF'],
    prompt: 'Joyería fina en oro y plata con diseño minimalista contemporáneo. Estética de lujo silencioso Waterdrop, fuentes serif refinadas y fotografía macro de joyas.',
  },
  {
    id: 'tecnologia',
    name: 'Tecnología & Gadgets',
    category: 'Electrónica & Audio',
    tagline: 'Estilo high-tech, contrastes sobrios y especificaciones claras.',
    colors: ['#0A0E17', '#1E3A8A', '#3B82F6', '#F8FAFC'],
    prompt: 'Tienda de gadgets de alta tecnología y accesorios inteligentes. Estilo limpio y tecnológico, acentos cobalto sobrio y tarjetas con especificaciones claras.',
  },
  {
    id: 'comida',
    name: 'Smash Burgers & Gourmet',
    category: 'Restaurante & Comida',
    tagline: 'Fotografía apetitosa, energía visual y proceso artesanal directo.',
    colors: ['#1C1917', '#EA580C', '#FDBA74', '#FFFBEB'],
    prompt: 'Hamburguesería gourmet y comida artesanal. Paleta apetitosa con acentos cálidos naranja y carbón, fotos de alta calidad de smash burgers y despacho express.',
  },
  {
    id: 'hogar',
    name: 'Hogar, Deco & Cerámica',
    category: 'Interiorismo',
    tagline: 'Ambientes cálidos con maderas nobles, lino y arquitectura interior.',
    colors: ['#1E1E1E', '#9C6644', '#DDB892', '#FBF8F5'],
    prompt: 'Tienda de decoración, cerámica artesanal y muebles para el hogar. Ambientes cálidos de interiorismo, maderas nobles y textiles naturales.',
  },
  {
    id: 'mascotas',
    name: 'Mascotas & Nutrición Pet',
    category: 'Cuidado Animal',
    tagline: 'Cuidado premium, ingredientes limpios veterinarios y bienestar animal.',
    colors: ['#111827', '#059669', '#34D399', '#F0FDF4'],
    prompt: 'Tienda de nutrición y accesorios premium para mascotas. Libre de químicos, avalado por veterinarios y despacho prioritario.',
  },
]

export function PlantillasTab({ form }: PlantillasTabProps) {
  const { handleAIPromptGenerate, isGeneratingAI } = form
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const handleApply = async (tpl: TemplatePreset) => {
    if (isGeneratingAI) return
    setApplyingId(tpl.id)
    try {
      await handleAIPromptGenerate({ prompt: tpl.prompt, scope: 'all' })
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="space-y-4 text-left">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-black text-zinc-900 leading-none">
          Plantillas & Blueprints de Tienda
        </h3>
        <p className="text-[11px] font-semibold text-zinc-400">
          Transforma toda tu tienda en un clic con diseños y fotos de nicho profesionales.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="space-y-3">
        {STORE_TEMPLATES.map(tpl => {
          const isCurrent = applyingId === tpl.id

          return (
            <div
              key={tpl.id}
              className="bg-white border border-zinc-200 hover:border-zinc-350 rounded-xl p-4 transition-all space-y-3 shadow-2xs hover:shadow-xs text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-zinc-900">{tpl.name}</h4>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                    {tpl.tagline}
                  </p>
                </div>

                {/* Color Palette Preview */}
                <div className="flex items-center gap-1 shrink-0 bg-zinc-50 p-1 rounded-md border border-zinc-200/60">
                  {tpl.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleApply(tpl)}
                disabled={isGeneratingAI}
                className={cn(
                  'w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border',
                  isCurrent
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-50 hover:bg-zinc-950 text-zinc-800 hover:text-white border-zinc-200 hover:border-zinc-950'
                )}
              >
                {isCurrent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Aplicando plantilla...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Aplicar esta Plantilla</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

