'use client'

import React from 'react'
import {
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon,
  ShoppingBag,
  Layers,
  HelpCircle,
  ShieldCheck,
  PanelBottom,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TiendaFormState } from './useTiendaForm'

export type SectionId =
  | 'hero'
  | 'bestsellers'
  | 'ritual'
  | 'ugc'
  | 'faqs'
  | 'garantias'
  | 'story'
  | 'footer'

interface SectionsOverviewProps {
  form: TiendaFormState
  onSelectSection: (sectionId: SectionId) => void
}

export function SectionsOverview({ form, onSelectSection }: SectionsOverviewProps) {
  const { sections, handleSectionToggle } = form

  const SECTIONS_CONFIG: Array<{
    id: SectionId
    label: string
    desc: string
    icon: React.ElementType
    sectionKey: keyof typeof sections
    alwaysOn?: boolean
  }> = [
    {
      id: 'hero',
      label: 'Portada & Fotos Principales',
      desc: 'Título, subtítulo, botón y fotos del collage',
      icon: ImageIcon,
      sectionKey: 'banner',
    },
    {
      id: 'bestsellers',
      label: 'Productos Destacados',
      desc: 'Catálogo con pestañas, precios y tarjetas',
      icon: ShoppingBag,
      sectionKey: 'destacados',
    },
    {
      id: 'ritual',
      label: '3 Razones para Comprar',
      desc: 'Pasos de valor, fotos de proceso y diferencial',
      icon: Layers,
      sectionKey: 'processTimeline',
    },
    {
      id: 'ugc',
      label: 'Opiniones & Clientes',
      desc: 'Mural social, fotos de clientes y calificaciones',
      icon: Sparkles,
      sectionKey: 'ugcGallery',
    },
    {
      id: 'faqs',
      label: 'Preguntas Frecuentes',
      desc: 'Respuestas sobre envíos, pagos y garantías',
      icon: HelpCircle,
      sectionKey: 'faqs',
    },
    {
      id: 'garantias',
      label: 'Garantías de Compra',
      desc: 'Tira de confianza: envíos, cambios y calidad',
      icon: ShieldCheck,
      sectionKey: 'beneficios',
    },
    {
      id: 'story',
      label: 'Historia de la Marca',
      desc: 'Franja para conectar con tu comprador',
      icon: BookOpen,
      sectionKey: 'brandStory',
    },
    {
      id: 'footer',
      label: 'Pie de Página & Enlaces',
      desc: 'Redes sociales, suscripción y datos legales',
      icon: PanelBottom,
      sectionKey: 'newsletterWidget',
      alwaysOn: true,
    },
  ]

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
            Bloques de la Tienda
          </h3>
          <p className="text-[11px] text-zinc-400 font-medium leading-none mt-0.5">
            Toca un bloque para editarlo o el ojo para ocultarlo.
          </p>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
          8 Bloques
        </span>
      </div>

      {/* Sections List */}
      <div className="space-y-1.5 pt-1">
        {SECTIONS_CONFIG.map(item => {
          const Icon = item.icon
          const isEnabled = item.alwaysOn ? true : Boolean(sections[item.sectionKey])

          return (
            <div
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={cn(
                'group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none text-left',
                isEnabled
                  ? 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-2xs'
                  : 'bg-zinc-50/70 border-zinc-200/60 opacity-60 hover:opacity-85'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isEnabled
                      ? 'bg-zinc-100 text-zinc-900 group-hover:bg-zinc-950 group-hover:text-white'
                      : 'bg-zinc-200/50 text-zinc-400'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 truncate">
                      {item.label}
                    </span>
                    {!isEnabled && (
                      <span className="text-[9.5px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.2 rounded">
                        Oculta
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-zinc-400 truncate leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* One-click Visibility Toggle Eye */}
                {!item.alwaysOn ? (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      handleSectionToggle(item.sectionKey)
                    }}
                    className={cn(
                      'p-1.5 rounded-md transition-colors cursor-pointer border-0',
                      isEnabled
                        ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-700 bg-transparent'
                    )}
                    title={isEnabled ? 'Ocultar bloque' : 'Mostrar bloque'}
                  >
                    {isEnabled ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : (
                  <span className="w-6 text-center text-[10px] text-zinc-300 font-bold select-none">
                    Fijo
                  </span>
                )}

                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
