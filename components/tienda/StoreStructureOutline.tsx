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
  Palette,
  Globe,
  Share2,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ActiveTab } from './types'
import { TiendaFormState } from './useTiendaForm'

interface StoreStructureOutlineProps {
  form: TiendaFormState
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
}

export function StoreStructureOutline({
  form,
  activeTab,
  onSelectTab,
}: StoreStructureOutlineProps) {
  const { sections, handleSectionToggle } = form

  const SECTION_BLOCKS = [
    {
      id: 'encabezado' as ActiveTab,
      sectionKey: 'banner' as const,
      label: 'Portada & Hero Collage',
      desc: 'Banner 4 fotos / video y llamado a la acción',
      icon: ImageIcon,
      alwaysOn: false,
    },
    {
      id: 'productos' as ActiveTab,
      sectionKey: 'destacados' as const,
      label: 'Colección Bestsellers',
      desc: 'Carrusel con pestañas y productos en pedestal',
      icon: ShoppingBag,
      alwaysOn: false,
    },
    {
      id: 'secciones' as ActiveTab,
      sectionKey: 'processTimeline' as const,
      label: 'Ritual Editorial (3 Pasos)',
      desc: 'Fotografías de proceso y valor de marca',
      icon: Layers,
      alwaysOn: false,
    },
    {
      id: 'secciones' as ActiveTab,
      sectionKey: 'testimonials' as const,
      label: 'Mural UGC & Reseñas',
      desc: 'Fotos de la comunidad y calificaciones',
      icon: Sparkles,
      alwaysOn: false,
    },
    {
      id: 'secciones' as ActiveTab,
      sectionKey: 'faqs' as const,
      label: 'Preguntas Frecuentes',
      desc: 'Acordeón de dudas y respuestas',
      icon: HelpCircle,
      alwaysOn: false,
    },
    {
      id: 'secciones' as ActiveTab,
      sectionKey: 'beneficios' as const,
      label: 'Garantías Pre-Footer',
      desc: 'Tira de 3 beneficios de confianza',
      icon: ShieldCheck,
      alwaysOn: false,
    },
    {
      id: 'secciones' as ActiveTab,
      sectionKey: 'newsletterWidget' as const,
      label: 'Pie de Página & Newsletter',
      desc: 'Caja de suscripción y enlaces',
      icon: PanelBottom,
      alwaysOn: true,
    },
  ]

  const GLOBAL_SETTINGS = [
    { id: 'estilo' as ActiveTab, label: 'Paleta, Tipografía y Bordes', icon: Palette },
    { id: 'dominios' as ActiveTab, label: 'Dominio y Enlace Web', icon: Globe },
    { id: 'redes' as ActiveTab, label: 'Redes Sociales y WhatsApp', icon: Share2 },
    { id: 'politicas' as ActiveTab, label: 'Términos y Devoluciones', icon: FileText },
  ]

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-none text-left select-none">
      <div className="space-y-0.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
          <span>Estructura de la Página</span>
        </h3>
        <p className="text-[11px] text-zinc-400 font-medium leading-snug">
          Haz clic en cualquier bloque para editar sus contenidos o usa el ojito para activarlo/ocultarlo.
        </p>
      </div>

      {/* Lista de Secciones Ordenadas */}
      <div className="space-y-1.5 pt-0.5">
        {SECTION_BLOCKS.map(block => {
          const isSelected = activeTab === block.id
          const isVisible = block.alwaysOn ? true : sections[block.sectionKey] !== false
          const Icon = block.icon

          return (
            <div
              key={block.label}
              className={cn(
                'group flex items-center justify-between p-2 rounded-lg border transition-all text-xs cursor-pointer',
                isSelected
                  ? 'border-zinc-950 bg-zinc-50 shadow-xs'
                  : 'border-zinc-100 hover:border-zinc-200 bg-white hover:bg-zinc-50/50'
              )}
              onClick={() => onSelectTab(block.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center shrink-0 border',
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200/80 group-hover:border-zinc-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0 text-left">
                  <span
                    className={cn(
                      'font-bold block truncate text-[11.5px] leading-tight',
                      isVisible ? 'text-zinc-900' : 'text-zinc-400 line-through'
                    )}
                  >
                    {block.label}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block truncate leading-tight mt-0.5">
                    {block.desc}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {!block.alwaysOn && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      handleSectionToggle(block.sectionKey)
                    }}
                    className={cn(
                      'w-6 h-6 rounded flex items-center justify-center cursor-pointer border-0 transition-colors',
                      isVisible
                        ? 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/60'
                        : 'text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100'
                    )}
                    title={isVisible ? 'Ocultar sección' : 'Mostrar sección'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Ajustes Globales Rápidos */}
      <div className="pt-2 border-t border-zinc-100">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
          Ajustes Globales
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {GLOBAL_SETTINGS.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectTab(g.id)}
              className={cn(
                'flex items-center gap-1.5 p-2 rounded-lg border text-[10.5px] font-semibold text-left transition-all cursor-pointer',
                activeTab === g.id
                  ? 'border-zinc-950 bg-zinc-900 text-white shadow-xs'
                  : 'border-zinc-100 bg-zinc-50/70 text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950'
              )}
            >
              <g.icon className="w-3 h-3 shrink-0 stroke-[1.8]" />
              <span className="truncate">{g.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

