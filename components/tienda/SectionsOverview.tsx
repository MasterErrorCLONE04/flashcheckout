'use client'

import React, { useState } from 'react'
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
  ChevronUp,
  ChevronDown,
  BookOpen,
  Plus,
  LayoutGrid,
  Grid,
  Award,
  Users,
  MapPin,
  HeartHandshake,
  Check,
  Pin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { TiendaFormState } from './useTiendaForm'
import { SectionId } from './types'

export { type SectionId }

interface SectionsOverviewProps {
  form: TiendaFormState
  onSelectSection: (sectionId: SectionId) => void
}

interface SectionDefinition {
  id: SectionId
  label: string
  desc: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  sectionKey: keyof TiendaFormState['sections']
  alwaysOn?: boolean
  category: 'portada' | 'comercio' | 'story' | 'confianza'
}

export const ALL_SECTIONS_CATALOG: SectionDefinition[] = [
  {
    id: 'hero',
    label: 'Portada & Hero Collage',
    desc: 'Fotos principales, llamado a la acción y títulos de portada',
    icon: ImageIcon,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    sectionKey: 'banner',
    category: 'portada',
  },
  {
    id: 'bestsellers',
    label: 'Colección Bestsellers & Tarjetas',
    desc: 'Catálogo destacado con pestañas, precios y tarjetas',
    icon: ShoppingBag,
    iconColor: 'text-zinc-900',
    iconBg: 'bg-zinc-100',
    sectionKey: 'destacados',
    category: 'comercio',
  },
  {
    id: 'visualCategories',
    label: 'Categorías Visuales (PDP Grid)',
    desc: 'Cuadrícula circular de fotos para navegar colecciones',
    icon: LayoutGrid,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    sectionKey: 'visualCategories',
    category: 'comercio',
  },
  {
    id: 'bentoHighlights',
    label: 'Bento Grid de Destacados',
    desc: 'Tarjetas de valor y diferenciales con emojis llamativos',
    icon: Grid,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    sectionKey: 'bentoHighlights',
    category: 'story',
  },
  {
    id: 'ritual',
    label: 'Ritual Editorial (3 Pasos)',
    desc: 'Línea de proceso en 3 pasos con fotos verticales 4:5',
    icon: Layers,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    sectionKey: 'processTimeline',
    category: 'story',
  },
  {
    id: 'lifestyleGallery',
    label: 'Galería de Estilo de Vida',
    desc: 'Fotos reales intercaladas entre las colecciones',
    icon: ImageIcon,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    sectionKey: 'lifestyleGallery',
    category: 'story',
  },
  {
    id: 'ingredientsSection',
    label: 'Ficha de Pureza e Ingredientes',
    desc: 'Layout simétrico explicativo de 3 columnas con foto central',
    icon: HeartHandshake,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    sectionKey: 'ingredientsSection',
    category: 'story',
  },
  {
    id: 'ugc',
    label: 'Mural Social UGC & Reseñas',
    desc: 'Fotos reales de compradores bajo la barra de 5 estrellas',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    sectionKey: 'ugcGallery',
    category: 'confianza',
  },
  {
    id: 'pressLogos',
    label: 'Barra de Prensa & Sellos',
    desc: 'Franja monocromática minimalista de medios y avales',
    icon: Award,
    iconColor: 'text-zinc-700',
    iconBg: 'bg-zinc-100',
    sectionKey: 'pressLogos',
    category: 'confianza',
  },
  {
    id: 'ambassadors',
    label: 'Embajadores & Creadores',
    desc: 'Carrusel de retratos editoriales con testimonios clave',
    icon: Users,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    sectionKey: 'ambassadors',
    category: 'confianza',
  },
  {
    id: 'retailers',
    label: 'Puntos de Entrega & Cobertura',
    desc: 'Ciudades express, aliados y despacho oficial a todo el país',
    icon: MapPin,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    sectionKey: 'retailers',
    category: 'confianza',
  },
  {
    id: 'faqs',
    label: 'Preguntas Frecuentes (FAQ)',
    desc: 'Acordeón de dudas sobre envíos, pagos y garantías',
    icon: HelpCircle,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    sectionKey: 'faqs',
    category: 'confianza',
  },
  {
    id: 'garantias',
    label: 'Garantías Pre-Footer',
    desc: 'Tira de 3 beneficios de compra segura y confianza',
    icon: ShieldCheck,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50',
    sectionKey: 'beneficios',
    category: 'confianza',
  },
  {
    id: 'story',
    label: 'Historia de Marca & Manifiesto',
    desc: 'Banner con foto de fondo y el propósito de tu negocio',
    icon: BookOpen,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-50',
    sectionKey: 'brandStory',
    category: 'story',
  },
  {
    id: 'footer',
    label: 'Pie de Página & Newsletter',
    desc: 'Caja de suscripción, redes sociales y avisos legales',
    icon: PanelBottom,
    iconColor: 'text-zinc-800',
    iconBg: 'bg-zinc-100',
    sectionKey: 'newsletterWidget',
    alwaysOn: true,
    category: 'portada',
  },
]

export function SectionsOverview({ form, onSelectSection }: SectionsOverviewProps) {
  const {
    sections,
    sectionOrder,
    handleSectionToggle,
    handleMoveSectionUp,
    handleMoveSectionDown,
    handleAddSection,
  } = form

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState<'todos' | 'comercio' | 'story' | 'confianza'>('todos')

  const catalogMap = React.useMemo(() => {
    const map = new Map<SectionId, SectionDefinition>()
    ALL_SECTIONS_CATALOG.forEach(s => map.set(s.id, s))
    return map
  }, [])

  // Ordered body sections (excluding fixed header and footer)
  const bodySections = React.useMemo(() => {
    const list: SectionDefinition[] = []
    sectionOrder.forEach(id => {
      if (id === 'hero' || id === 'footer') return
      const def = catalogMap.get(id)
      if (def) list.push(def)
    })
    // Append catalog items that are not header or footer and not in sectionOrder
    ALL_SECTIONS_CATALOG.forEach(def => {
      if (def.id === 'hero' || def.id === 'footer') return
      if (!list.some(s => s.id === def.id)) {
        list.push(def)
      }
    })
    return list
  }, [sectionOrder, catalogMap])

  const heroDef = catalogMap.get('hero')!
  const footerDef = catalogMap.get('footer')!

  const totalVisible =
    (sections.banner !== false ? 1 : 0) +
    (sections.newsletterWidget !== false ? 1 : 0) +
    bodySections.filter(s => Boolean(sections[s.sectionKey])).length

  const renderSectionCard = (
    item: SectionDefinition,
    options?: {
      isHeaderOrFooter?: boolean
      index?: number
      isFirst?: boolean
      isLast?: boolean
    }
  ) => {
    const Icon = item.icon
    const isEnabled = item.alwaysOn ? true : Boolean(sections[item.sectionKey])
    const { isHeaderOrFooter, index = 0, isFirst, isLast } = options || {}

    return (
      <div
        key={item.id}
        onClick={() => onSelectSection(item.id)}
        className={cn(
          'group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left',
          isEnabled
            ? 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xs'
            : 'bg-zinc-50/70 border-zinc-200/60 opacity-60 hover:opacity-90'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1.5 flex-1">
          {/* Reorder Buttons (Only for reorderable body sections) */}
          {!isHeaderOrFooter ? (
            <div
              className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-zinc-400"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={isFirst}
                onClick={() => handleMoveSectionUp(item.id)}
                className="p-0.5 rounded hover:bg-zinc-100 hover:text-zinc-950 transition-colors border-0 cursor-pointer disabled:opacity-20 disabled:hover:bg-transparent"
                title="Mover arriba"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => handleMoveSectionDown(item.id)}
                className="p-0.5 rounded hover:bg-zinc-100 hover:text-zinc-950 transition-colors border-0 cursor-pointer disabled:opacity-20 disabled:hover:bg-transparent"
                title="Mover abajo"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-4 flex items-center justify-center shrink-0 text-zinc-300">
              <Pin className="w-3 h-3" />
            </div>
          )}

          {/* Icon Badge */}
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors border',
              isEnabled
                ? 'bg-zinc-100 text-zinc-900 border-zinc-200/80 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950'
                : 'bg-zinc-100 text-zinc-400 border-zinc-200/50'
            )}
          >
            <Icon className="w-4 h-4" />
          </div>

          {/* Section Name & Description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-950 truncate">
                {item.label}
              </span>
              {!isEnabled && (
                <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.2 rounded shrink-0">
                  Oculta
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-zinc-400 truncate leading-tight mt-0.5">
              {item.desc}
            </p>
          </div>
        </div>

        {/* Visibility Toggle & Arrow */}
        <div className="flex items-center gap-1 shrink-0">
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
                  ? 'text-zinc-900 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-700 bg-transparent'
              )}
              title={isEnabled ? 'Ocultar bloque' : 'Mostrar bloque'}
            >
              {isEnabled ? (
                <Eye className="w-3.5 h-3.5 text-zinc-900" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-6 text-center text-[9px] text-zinc-300 font-bold select-none">
              Fijo
            </span>
          )}

          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 text-left select-none">
      {/* Sidebar Header Title & Status */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
            Plantilla de la Tienda
          </h3>
          <p className="text-[11px] text-zinc-500 font-medium leading-none mt-1">
            Organiza los bloques que verán tus clientes
          </p>
        </div>
        <span className="text-[10px] font-extrabold text-zinc-700 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200/60">
          {totalVisible} / {ALL_SECTIONS_CATALOG.length} activas
        </span>
      </div>

      {/* ZONE 1: CABECERA */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Cabecera & Portada
          </span>
        </div>
        {renderSectionCard(heroDef, { isHeaderOrFooter: true })}
      </div>

      {/* ZONE 2: CUERPO REORDENABLE DE PÁGINA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Secciones de la Página
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            Usa ⬆️ ⬇️ para reordenar
          </span>
        </div>

        <div className="space-y-1.5">
          {bodySections.map((item, idx) =>
            renderSectionCard(item, {
              index: idx,
              isFirst: idx === 0,
              isLast: idx === bodySections.length - 1,
            })
          )}
        </div>

        {/* Add Section Button (Sleek dashed block style at the end of sections) */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full mt-2 py-3 px-3 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 text-zinc-900" />
          <span>+ Añadir bloque a la página</span>
        </button>
      </div>

      {/* ZONE 3: PIE DE PÁGINA */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Pie de Página & Cierre
          </span>
        </div>
        {renderSectionCard(footerDef, { isHeaderOrFooter: true })}
      </div>

      {/* Section Library / Add Section Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catálogo de Secciones"
        description="Selecciona un bloque visual para agregarlo al diseño de tu tienda online."
        size="lg"
      >
        <div className="space-y-4 text-left">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'todos', label: 'Todos los Bloques' },
              { id: 'comercio', label: '🛍️ Catálogo & Productos' },
              { id: 'story', label: '✨ Storytelling & Valor' },
              { id: 'confianza', label: '🛡️ Prueba Social & FAQ' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCatalogFilter(f.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer shrink-0',
                  catalogFilter === f.id
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 border-transparent hover:bg-zinc-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid of Available Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {ALL_SECTIONS_CATALOG.filter(s =>
              catalogFilter === 'todos' ? true : s.category === catalogFilter
            ).map(sec => {
              const Icon = sec.icon
              const isEnabled = sec.alwaysOn ? true : Boolean(sections[sec.sectionKey])

              return (
                <div
                  key={sec.id}
                  className={cn(
                    'p-3.5 rounded-xl border flex flex-col justify-between transition-all text-left',
                    isEnabled
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xs'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          sec.iconBg,
                          sec.iconColor
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                          <Check className="w-3 h-3 text-zinc-900" /> Activo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                          Disponible
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950">{sec.label}</h4>
                      <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2 mt-0.5">
                        {sec.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3">
                    {isEnabled ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddModalOpen(false)
                          onSelectSection(sec.id)
                        }}
                        className="w-full py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-[11px] font-bold transition-all cursor-pointer border-0"
                      >
                        Personalizar bloque →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleAddSection(sec.id, sec.sectionKey)
                          setIsAddModalOpen(false)
                          onSelectSection(sec.id)
                        }}
                        className="w-full py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border-0 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir a la página
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
