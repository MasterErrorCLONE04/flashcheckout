'use client'

import React, { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Type,
  Image as ImageIcon,
  MousePointer,
  MoveVertical,
  Minus,
  Square,
  Layers,
  Columns2,
  Columns3,
  Images,
  Quote,
  FileText,
  ShoppingCart,
  BookOpen,
  Clock,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TiendaFormState } from '../useTiendaForm'
import { SectionId } from '../types'

interface ComponentesTabProps {
  form: TiendaFormState
  onSelectSection: (sectionId: SectionId) => void
}

interface ComponentItem {
  id: string
  label: string
  icon: React.ElementType
  targetSection?: SectionId
  actionHint?: string
  onClick?: (form: TiendaFormState, onSelectSection: (id: SectionId) => void) => void
}

interface ComponentGroup {
  id: string
  title: string
  items: ComponentItem[]
}

const COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: 'basicos',
    title: 'Básicos',
    items: [
      {
        id: 'texto',
        label: 'Texto',
        icon: Type,
        targetSection: 'hero',
        actionHint: 'Títulos, subtítulos y redacción de portada',
      },
      {
        id: 'imagen',
        label: 'Imagen',
        icon: ImageIcon,
        targetSection: 'hero',
        actionHint: 'Banner editorial, fotos de alta resolución y collage',
      },
      {
        id: 'boton',
        label: 'Botón',
        icon: MousePointer,
        targetSection: 'hero',
        actionHint: 'Llamados a la acción y botones de compra directa',
      },
      {
        id: 'espaciador',
        label: 'Espaciador',
        icon: MoveVertical,
        actionHint: 'Ajuste de margen y aire entre bloques',
        onClick: (form) => {
          toast.success('Espaciado visual armonizado automáticamente según el preset Waterdrop.')
        },
      },
      {
        id: 'divisor',
        label: 'Divisor',
        icon: Minus,
        actionHint: 'Líneas sutiles de separación entre módulos',
        onClick: (form) => {
          toast.success('Bordes y separadores minimalistas activos en tu plantilla.')
        },
      },
      {
        id: 'contenedor',
        label: 'Contenedor',
        icon: Square,
        targetSection: 'bentoHighlights',
        actionHint: 'Tarjetas Bento Grid y bloques contenedores',
      },
    ],
  },
  {
    id: 'estructura',
    title: 'Estructura',
    items: [
      {
        id: 'seccion',
        label: 'Sección',
        icon: Layers,
        targetSection: 'hero',
        actionHint: 'Añadir y configurar secciones completas',
      },
      {
        id: 'fila',
        label: 'Fila',
        icon: Columns2,
        targetSection: 'hero',
        actionHint: 'Disposición horizontal de 2 o 4 columnas',
      },
      {
        id: 'columna',
        label: 'Columna',
        icon: Columns3,
        targetSection: 'bestsellers',
        actionHint: 'Columnas del catálogo (3, 4 o 5 productos por fila)',
      },
    ],
  },
  {
    id: 'avanzados',
    title: 'Avanzados',
    items: [
      {
        id: 'carrusel',
        label: 'Carrusel',
        icon: Images,
        targetSection: 'lifestyleGallery',
        actionHint: 'Galería de estilo de vida y mural de fotos UGC',
      },
      {
        id: 'testimonios',
        label: 'Testimonios',
        icon: Quote,
        targetSection: 'ambassadors',
        actionHint: 'Reseñas 5 estrellas y opiniones verificadas de clientes',
      },
      {
        id: 'formulario',
        label: 'Formulario',
        icon: FileText,
        targetSection: 'footer',
        actionHint: 'Caja de suscripción a newsletter y captura de correo',
      },
    ],
  },
  {
    id: 'contenido',
    title: 'Contenido',
    items: [
      {
        id: 'productos',
        label: 'Productos',
        icon: ShoppingCart,
        targetSection: 'bestsellers',
        actionHint: 'Catálogo de mejores vendidos con filtros por categoría',
      },
      {
        id: 'blog',
        label: 'Blog',
        icon: BookOpen,
        targetSection: 'story',
        actionHint: 'Historia de marca, manifiesto editorial y artículos',
      },
      {
        id: 'cuenta-regresiva',
        label: 'Cuenta regresiva',
        icon: Clock,
        actionHint: 'Barra de anuncios con rotación de mensajes urgentes',
        onClick: (form) => {
          form.setAnnouncement(prev => ({
            ...prev,
            enabled: true,
            text: prev.text || '⚡ OFERTA LIMITADA: Envíos gratis por hoy | Compra protegida',
          }))
          toast.success('Barra de anuncios activada en la parte superior.')
        },
      },
    ],
  },
]

const SECTION_KEY_MAP: Record<SectionId, keyof TiendaFormState['sections']> = {
  hero: 'banner',
  bestsellers: 'destacados',
  visualCategories: 'visualCategories',
  bentoHighlights: 'bentoHighlights',
  ritual: 'processTimeline',
  lifestyleGallery: 'lifestyleGallery',
  ingredientsSection: 'ingredientsSection',
  ugc: 'ugcGallery',
  pressLogos: 'pressLogos',
  ambassadors: 'ambassadors',
  retailers: 'retailers',
  faqs: 'faqs',
  garantias: 'beneficios',
  story: 'brandStory',
  footer: 'newsletterWidget',
}

export function ComponentesTab({ form, onSelectSection }: ComponentesTabProps) {
  const [search, setSearch] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const handleItemClick = (item: ComponentItem) => {
    if (item.onClick) {
      item.onClick(form, onSelectSection)
      return
    }

    if (item.targetSection) {
      const secKey = SECTION_KEY_MAP[item.targetSection]
      // Enable section if not enabled
      if (secKey && !form.sections[secKey]) {
        form.handleAddSection(item.targetSection, secKey)
      } else if (!form.sectionOrder.includes(item.targetSection)) {
        form.handleAddSection(item.targetSection)
      }
      onSelectSection(item.targetSection)
      toast.success(`Componente "${item.label}" seleccionado para personalizar`)
    }
  }

  const normalizedSearch = search.trim().toLowerCase()

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      {/* Search Input Box (Figma / Webflow style with shortcut Ctrl+K) */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar componentes..."
          className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-zinc-200/90 rounded-2xl text-xs font-semibold text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950/10 shadow-2xs transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-zinc-400">
          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200/60 hidden sm:inline-block">
            Ctrl + K
          </span>
          <Search className="w-3.5 h-3.5 text-zinc-500" />
        </div>
      </div>

      {/* Component Groups */}
      <div className="space-y-4 pt-1">
        {COMPONENT_GROUPS.map(group => {
          const isCollapsed = collapsedGroups[group.id] || false

          // Filter items by search query if any
          const filteredItems = group.items.filter(item => {
            if (!normalizedSearch) return true
            return (
              item.label.toLowerCase().includes(normalizedSearch) ||
              (item.actionHint && item.actionHint.toLowerCase().includes(normalizedSearch))
            )
          })

          if (filteredItems.length === 0 && normalizedSearch) return null

          return (
            <div key={group.id} className="space-y-2">
              {/* Group Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between py-1 text-xs font-bold text-zinc-900 hover:text-zinc-700 transition-colors cursor-pointer border-0 bg-transparent text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="leading-tight">{group.title}</span>
                  <span className="text-[10.5px] text-zinc-400 font-semibold group-hover:text-zinc-600 transition-colors">
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronUp className="w-3.5 h-3.5 inline" />}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-zinc-400">
                  {filteredItems.length}
                </span>
              </button>

              {/* 3-Column Grid of Component Cards */}
              {!isCollapsed && (
                <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-150">
                  {filteredItems.map(item => {
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="group/card aspect-square rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-400 hover:shadow-xs active:scale-[0.97] transition-all p-3 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs text-center"
                        title={item.actionHint || item.label}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-850 group-hover/card:text-zinc-950 group-hover/card:scale-110 transition-transform">
                          <Icon className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <span className="text-[11.5px] font-bold text-zinc-800 group-hover/card:text-zinc-950 leading-none truncate max-w-full">
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
