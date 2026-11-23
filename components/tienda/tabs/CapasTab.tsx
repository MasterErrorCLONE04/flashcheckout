'use client'

import React from 'react'
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  ChevronRight,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TiendaFormState } from '../useTiendaForm'
import { SectionId } from '../types'
import { ALL_SECTIONS_CATALOG } from '../SectionsOverview'

interface CapasTabProps {
  form: TiendaFormState
  onSelectSection: (sectionId: SectionId) => void
}

export function CapasTab({ form, onSelectSection }: CapasTabProps) {
  const { sectionOrder, setSectionOrder, sections, setSections } = form

  const moveLayer = (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return

    setSectionOrder(prev => {
      const next = [...prev]
      const temp = next[idx]
      next[idx] = next[targetIdx]
      next[targetIdx] = temp
      return next
    })
  }

  const toggleLayerVisibility = (sectionKey: keyof typeof sections, e: React.MouseEvent) => {
    e.stopPropagation()
    setSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
  }

  return (
    <div className="space-y-4 text-left">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-black text-zinc-900 leading-none">
          Árbol de Capas de la Página
        </h3>
        <p className="text-[11px] font-semibold text-zinc-400">
          Reordena el flujo vertical de tu tienda y controla la visibilidad de cada bloque.
        </p>
      </div>

      {/* Layer List */}
      <div className="space-y-1.5">
        {sectionOrder.map((sectionId, idx) => {
          const comp = ALL_SECTIONS_CATALOG.find(c => c.id === sectionId)
          if (!comp) return null

          const Icon = comp.icon
          const isActive = sections[comp.sectionKey] !== false
          const isFirst = idx === 0
          const isLast = idx === sectionOrder.length - 1

          return (
            <div
              key={sectionId}
              onClick={() => onSelectSection(sectionId)}
              className={cn(
                'group p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs select-none',
                isActive
                  ? 'bg-white border-zinc-200 hover:border-zinc-350 hover:shadow-xs'
                  : 'bg-zinc-50/60 border-zinc-200/60 opacity-60 hover:opacity-100 hover:bg-white'
              )}
            >
              {/* Left: Drag grip / index and name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-mono font-bold text-zinc-400 w-4 text-right shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200/60',
                    isActive ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-100 text-zinc-400'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 truncate">
                    {comp.label}
                  </div>
                  <span className="text-[9px] font-medium text-zinc-400 block truncate">
                    {isActive ? 'Visible en storefront' : 'Oculto'}
                  </span>
                </div>
              </div>

              {/* Right: Reorder buttons & Eye toggle */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Reorder Up */}
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={e => moveLayer(idx, 'up', e)}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center transition-colors border',
                    isFirst
                      ? 'border-transparent text-zinc-300 cursor-not-allowed'
                      : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer'
                  )}
                  title="Subir posición"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                {/* Reorder Down */}
                <button
                  type="button"
                  disabled={isLast}
                  onClick={e => moveLayer(idx, 'down', e)}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center transition-colors border',
                    isLast
                      ? 'border-transparent text-zinc-300 cursor-not-allowed'
                      : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer'
                  )}
                  title="Bajar posición"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Eye Visibility */}
                <button
                  type="button"
                  onClick={e => toggleLayerVisibility(comp.sectionKey, e)}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center transition-colors border ml-0.5',
                    isActive
                      ? 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 cursor-pointer'
                      : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-400 cursor-pointer'
                  )}
                  title={isActive ? 'Ocultar capa' : 'Mostrar capa'}
                >
                  {isActive ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

