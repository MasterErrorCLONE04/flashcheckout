'use client'

import React, { useState } from 'react'
import { ChevronDown, Check, Award, Sparkles, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconMap, CatalogIconName } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'

export interface MobileSectionsProps {
  settings: CatalogResolvedSettings
  activeNavTab: string
  device?: string
  sectionId?: string
  setSelectedCategory?: (cat: string) => void
}

const DEFAULT_RITUAL_PHOTOS = [
  'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=85',
]

export function MobileSections({
  settings,
  activeNavTab,
  device,
  sectionId,
  setSelectedCategory,
}: MobileSectionsProps) {
  const {
    sections,
    sectionOrder,
    colors,
    visualCategories,
    bentoHighlights,
    lifestyleGallery,
    ingredientsSection,
    brandStory,
    processTimeline,
    pressLogos,
    ambassadors,
    testimonials,
    ugcGallery,
    retailers,
    faqs,
    benefits,
    brandStoryPage,
  } = settings

  const [showReviews, setShowReviews] = useState(false)
  const isTablet = device === 'tablet'
  const textHex = colors?.texto || '#111111'

  if (activeNavTab === 'Historia') {
    return (
      <div
        data-maker-section="story"
        data-maker-title="Historia de Marca"
        className="space-y-8 select-none text-left animate-in fade-in duration-500 pb-8"
        style={{ color: textHex }}
      >
        <div className="space-y-2 text-center pb-2">
          <span
            data-maker-field="brandStoryPage.headerTrayectoria"
            data-maker-label="Subtítulo Misión"
            className="text-[9px] font-bold tracking-widest opacity-55 uppercase block"
          >
            {brandStoryPage.headerTrayectoria || 'NUESTRA MISIÓN'}
          </span>
          <h2
            data-maker-field="brandStoryPage.headerPerfil"
            data-maker-label="Título de Historia"
            className={cn('font-black tracking-tight leading-tight', isTablet ? 'text-2xl' : 'text-xl')}
          >
            {brandStoryPage.headerPerfil}
          </h2>
        </div>

        <div className="space-y-4">
          <p
            data-maker-field="brandStoryPage.narrativeP1"
            data-maker-label="Párrafo Principal"
            className="text-xs opacity-80 leading-relaxed font-medium"
          >
            {brandStoryPage.narrativeP1}
          </p>
          {brandStoryPage.imageHeritage && (
            <div
              data-maker-field="brandStoryPage.imageHeritage"
              data-maker-label="Imagen de Historia"
              className={cn('rounded-xl overflow-hidden bg-black/[0.04]', isTablet ? 'h-64' : 'h-48')}
            >
              <img
                src={brandStoryPage.imageHeritage}
                alt="Nuestra Historia"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p
            data-maker-field="brandStoryPage.narrativeP2"
            data-maker-label="Párrafo Secundario"
            className="text-xs opacity-70 leading-relaxed font-medium"
          >
            {brandStoryPage.narrativeP2}
          </p>
        </div>

        <div className={cn('grid gap-3', isTablet ? 'grid-cols-2' : 'grid-cols-1')}>
          <div className="bg-black/[0.04] rounded-xl p-4 space-y-1.5">
            <h4
              data-maker-field="brandStoryPage.pillar1Title"
              data-maker-label="Pilar 1 Título"
              className="font-bold text-xs"
            >
              {brandStoryPage.pillar1Title}
            </h4>
            <p
              data-maker-field="brandStoryPage.pillar1Desc"
              data-maker-label="Pilar 1 Descripción"
              className="text-[11px] opacity-75 leading-relaxed"
            >
              {brandStoryPage.pillar1Desc}
            </p>
          </div>
          <div className="bg-black/[0.04] rounded-xl p-4 space-y-1.5">
            <h4
              data-maker-field="brandStoryPage.pillar2Title"
              data-maker-label="Pilar 2 Título"
              className="font-bold text-xs"
            >
              {brandStoryPage.pillar2Title}
            </h4>
            <p
              data-maker-field="brandStoryPage.pillar2Desc"
              data-maker-label="Pilar 2 Descripción"
              className="text-[11px] opacity-75 leading-relaxed"
            >
              {brandStoryPage.pillar2Desc}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (activeNavTab !== 'Inicio') return null

  const renderSectionById = (id: string) => {
    switch (id) {
      case 'visualCategories':
        if (!sections.visualCategories || !visualCategories?.length) return null
        return (
          <section
            key="visualCategories"
            data-maker-section="visualCategories"
            data-maker-title="Categorías Visuales"
            className="space-y-3.5"
            style={{ color: textHex }}
          >
            <div className="flex items-center justify-between">
              <h3 className={cn('font-extrabold tracking-[-0.02em]', isTablet ? 'text-[20px]' : 'text-[17px]')}>
                Explora por Categoría
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-55">
                {visualCategories.length} colecciones
              </span>
            </div>
            <div className={cn('grid gap-3', isTablet ? 'grid-cols-3' : 'grid-cols-2')}>
              {visualCategories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-maker-field={`visualCategories.${idx}`}
                  data-maker-label={`Categoría: ${cat.category}`}
                  onClick={() => {
                    if (setSelectedCategory) {
                      setSelectedCategory(cat.category)
                      document
                        .getElementById('mobile-categories-row')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="group relative aspect-[4/3] rounded-[8px] overflow-hidden bg-black/[0.05] text-left border-0 p-0 cursor-pointer"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[12.5px] font-extrabold block leading-tight">
                        {cat.category}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/85 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )

      case 'bentoHighlights':
        if (!sections.bentoHighlights || !bentoHighlights?.items?.length) return null
        return (
          <section
            key="bentoHighlights"
            data-maker-section="bentoHighlights"
            data-maker-title="Grilla Bento de Beneficios"
            className="space-y-3.5"
            style={{ color: textHex }}
          >
            <div className="space-y-1">
              <h3
                data-maker-field="bentoHighlights.title"
                data-maker-label="Título Grilla Bento"
                className={cn('font-extrabold tracking-[-0.02em]', isTablet ? 'text-[21px]' : 'text-[18px]')}
              >
                {bentoHighlights.title}
              </h3>
            </div>
            <div className={cn('grid gap-3', isTablet ? 'grid-cols-2' : 'grid-cols-1')}>
              {bentoHighlights.items.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  data-maker-field={`bentoHighlights.items.${idx}`}
                  data-maker-label={`Tarjeta Bento #${idx + 1}: ${item.title}`}
                  className="p-4 rounded-[8px] border border-black/10 bg-black/[0.025] flex items-start gap-3.5"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base"
                    style={{ backgroundColor: colors.acento || '#DDF3E4', color: '#111111' }}
                  >
                    {item.emoji || '✨'}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-[13px] font-bold leading-snug">{item.title}</h4>
                    <p className="text-[11.5px] opacity-75 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )

      case 'ritual':
        if (sections.processTimeline === false || !processTimeline?.items?.length) return null
        return (
          <section
            key="ritual"
            data-maker-section="ritual"
            data-maker-title="Ritual Editorial (3 Pasos)"
            className="space-y-4"
            style={{ color: textHex }}
          >
            <h2
              data-maker-field="processTimeline.headline"
              data-maker-label="Titular Ritual (3 Pasos)"
              className={cn(
                'font-extrabold tracking-[-0.025em] leading-[1.18]',
                isTablet ? 'text-[23px]' : 'text-[20px]'
              )}
            >
              {processTimeline.headline || processTimeline.title}
            </h2>
            <div
              className={cn(
                isTablet
                  ? 'grid grid-cols-3 gap-3.5'
                  : 'flex gap-3 overflow-x-auto pb-2 scrollbar-none'
              )}
            >
              {processTimeline.items.slice(0, 3).map((step, idx) => {
                const photo =
                  step.imageUrl || DEFAULT_RITUAL_PHOTOS[idx % DEFAULT_RITUAL_PHOTOS.length]
                return (
                  <div
                    key={idx}
                    data-maker-field={`processTimeline.items.${idx}`}
                    data-maker-label={`Paso #${idx + 1}: ${step.title}`}
                    className={cn('space-y-2.5', !isTablet && 'w-[215px] shrink-0')}
                  >
                    <div className="aspect-[3/4] w-full rounded-[6px] overflow-hidden bg-black/[0.04]">
                      <img src={photo} alt={step.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold">{step.title}</h4>
                      <p className="text-[11px] opacity-75 leading-snug mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )

      case 'lifestyleGallery':
        if (!sections.lifestyleGallery || !lifestyleGallery?.length) return null
        return (
          <section
            key="lifestyleGallery"
            data-maker-section="lifestyleGallery"
            data-maker-title="Galería Editorial Lookbook"
            className="space-y-3"
          >
            <div className={cn('grid gap-2.5', isTablet ? 'grid-cols-3' : 'grid-cols-2')}>
              {lifestyleGallery.slice(0, isTablet ? 3 : 4).map((imgUrl, idx) => (
                <div
                  key={idx}
                  data-maker-field={`lifestyleGallery.${idx}`}
                  data-maker-label={`Foto Lookbook #${idx + 1}`}
                  className={cn(
                    'rounded-[6px] overflow-hidden bg-black/[0.04]',
                    idx === 0 && !isTablet ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/5]'
                  )}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )

      case 'ingredientsSection':
        if (!sections.ingredientsSection || !ingredientsSection) return null
        return (
          <section
            key="ingredientsSection"
            data-maker-section="ingredientsSection"
            data-maker-title="Materiales & Especificaciones"
            className="space-y-3.5"
            style={{ color: textHex }}
          >
            <h3
              data-maker-field="ingredientsSection.title"
              data-maker-label="Título Materiales"
              className={cn('font-extrabold tracking-[-0.02em]', isTablet ? 'text-[20px]' : 'text-[17px]')}
            >
              {ingredientsSection.title}
            </h3>
            <div className={cn('grid gap-3', isTablet ? 'grid-cols-3 items-center' : 'grid-cols-1')}>
              <div
                data-maker-field="ingredientsSection.left"
                data-maker-label="Bloque Izquierdo Materiales"
                className="p-3.5 rounded-[6px] border border-black/10 bg-black/[0.02] space-y-1"
              >
                <h4 className="text-[13px] font-bold">{ingredientsSection.leftTitle}</h4>
                <p className="text-[11px] opacity-75 leading-relaxed">{ingredientsSection.leftDesc}</p>
              </div>
              {ingredientsSection.centerImageUrl && (
                <div className="rounded-[6px] overflow-hidden bg-black/[0.04] max-h-44 flex items-center justify-center">
                  <img
                    src={ingredientsSection.centerImageUrl}
                    alt={ingredientsSection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                data-maker-field="ingredientsSection.right"
                data-maker-label="Bloque Derecho Materiales"
                className="p-3.5 rounded-[6px] border border-black/10 bg-black/[0.02] space-y-1"
              >
                <h4 className="text-[13px] font-bold">{ingredientsSection.rightTitle}</h4>
                <p className="text-[11px] opacity-75 leading-relaxed">{ingredientsSection.rightDesc}</p>
              </div>
            </div>
          </section>
        )

      case 'pressLogos':
        if (sections.pressLogos === false || !pressLogos.length) return null
        return (
          <section
            key="pressLogos"
            data-maker-section="pressLogos"
            data-maker-title="Barra de Prensa & Sellos"
            className="py-5 border-y border-black/10 flex items-center justify-around gap-5 overflow-x-auto scrollbar-none"
            style={{ color: textHex }}
          >
            {pressLogos.map((logo: { name: string; subtitle?: string }, idx: number) => {
              const styleVariant = idx % 4
              return (
                <div
                  key={idx}
                  data-maker-field={`pressLogos.${idx}`}
                  data-maker-label={`Sello de Prensa: ${logo.name}`}
                  className="text-center shrink-0 px-1"
                >
                  {styleVariant === 0 && (
                    <span className="text-[11px] font-light tracking-[0.22em] uppercase block">
                      {logo.name}
                    </span>
                  )}
                  {styleVariant === 1 && (
                    <span className="font-serif italic text-[15px] font-bold tracking-tight block">
                      {logo.name}
                    </span>
                  )}
                  {styleVariant === 2 && (
                    <span className="text-[14px] font-black tracking-[-0.05em] uppercase block">
                      {logo.name}
                    </span>
                  )}
                  {styleVariant === 3 && (
                    <span
                      className="inline-block border-[1.5px] px-1.5 py-0.5 text-[10px] font-black tracking-[0.1em] uppercase"
                      style={{ borderColor: textHex }}
                    >
                      {logo.name}
                    </span>
                  )}
                  {logo.subtitle && (
                    <span className="text-[7px] font-bold tracking-[0.16em] uppercase opacity-60 block mt-0.5">
                      {logo.subtitle}
                    </span>
                  )}
                </div>
              )
            })}
          </section>
        )

      case 'ambassadors':
        if (sections.ambassadors === false || !ambassadors.items.length) return null
        return (
          <section
            key="ambassadors"
            data-maker-section="ambassadors"
            data-maker-title="Embajadores & Atletas"
            className="space-y-3.5"
            style={{ color: textHex }}
          >
            <h3
              data-maker-field="ambassadors.title"
              data-maker-label="Título Embajadores"
              className={cn('font-extrabold tracking-[-0.02em]', isTablet ? 'text-[20px]' : 'text-[18px]')}
            >
              {ambassadors.title}
            </h3>
            <div className={cn('grid gap-3', isTablet ? 'grid-cols-4' : 'grid-cols-2')}>
              {ambassadors.items.slice(0, 4).map((person: { name: string; role: string; imageUrl: string }, idx: number) => (
                <div
                  key={idx}
                  data-maker-field={`ambassadors.items.${idx}`}
                  data-maker-label={`Embajador: ${person.name}`}
                  className="space-y-1.5"
                >
                  <div className="aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-black/[0.04]">
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[12.5px] font-bold block leading-tight">
                      {person.name}
                    </span>
                    <span className="text-[10.5px] opacity-65 block">{person.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )

      case 'ugc':
        if (sections.testimonials === false && sections.ugcGallery === false) return null
        return (
          <section
            key="ugc"
            data-maker-section="ugc"
            data-maker-title="Mural Social UGC & Reseñas"
            className="space-y-5 pt-2"
            style={{ color: textHex }}
          >
            {sections.testimonials !== false && testimonials.enabled && (
              <div className="text-center space-y-2.5 px-2">
                <div className="text-[13px] tracking-[0.22em]">★★★★★</div>
                <h3
                  data-maker-field="testimonials.title"
                  data-maker-label="Título Testimonios"
                  className={cn('font-extrabold tracking-[-0.02em]', isTablet ? 'text-[22px]' : 'text-[19px]')}
                >
                  {testimonials.title || 'Clientes felices en todo el país'}
                </h3>
                {testimonials.subtitle && (
                  <p
                    data-maker-field="testimonials.subtitle"
                    data-maker-label="Subtítulo Testimonios"
                    className="text-[11.5px] opacity-75 leading-relaxed"
                  >
                    {testimonials.subtitle}
                  </p>
                )}
                {testimonials.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReviews(prev => !prev)}
                    className="px-4 py-1.5 rounded-full border border-black/20 bg-transparent text-[9.5px] font-bold uppercase tracking-[0.08em] cursor-pointer"
                    style={{ color: textHex }}
                  >
                    {showReviews ? 'Ocultar reseñas' : 'Ver reseñas verificadas'}
                  </button>
                )}
                {showReviews && (
                  <div className={cn(' gap-2.5 pt-2 text-left grid', isTablet ? 'grid-cols-3' : 'grid-cols-1')}>
                    {testimonials.items.slice(0, 3).map((t: { name: string; city: string; comment: string }, idx: number) => (
                      <div
                        key={idx}
                        data-maker-field={`testimonials.items.${idx}`}
                        data-maker-label={`Reseña de ${t.name}`}
                        className="p-3.5 bg-black/[0.04] rounded-[6px] space-y-1.5"
                      >
                        <p className="text-[11.5px] opacity-85 leading-relaxed">
                          &ldquo;{t.comment}&rdquo;
                        </p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold">
                            {t.name} · {t.city}
                          </span>
                          <span className="text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Verificado
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sections.ugcGallery !== false && ugcGallery.length > 0 && (
              <div className={cn('grid gap-2 pb-2', isTablet ? 'grid-cols-6' : 'grid-cols-3')}>
                {ugcGallery.slice(0, 6).map((img: string, idx: number) => (
                  <div
                    key={idx}
                    data-maker-field={`ugcGallery.${idx}`}
                    data-maker-label={`Foto UGC #${idx + 1}`}
                    className={cn(
                      'aspect-[4/5] rounded-[4px] overflow-hidden bg-black/[0.04]',
                      idx % 2 === 1 && 'translate-y-2'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )

      case 'retailers':
        if (sections.retailers === false || !retailers.items.length) return null
        return (
          <section
            key="retailers"
            data-maker-section="retailers"
            data-maker-title="Puntos de Entrega & Cobertura"
            className="space-y-3 pt-2"
            style={{ color: textHex }}
          >
            <div>
              <h3
                data-maker-field="retailers.title"
                data-maker-label="Título Cobertura"
                className="text-[16px] font-extrabold tracking-[-0.02em]"
              >
                {retailers.title}
              </h3>
              {retailers.subtitle && (
                <p
                  data-maker-field="retailers.subtitle"
                  data-maker-label="Subtítulo Cobertura"
                  className="text-[11.5px] opacity-65 mt-0.5"
                >
                  {retailers.subtitle}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {retailers.items.map((item: { name: string }, idx: number) => (
                <span
                  key={idx}
                  data-maker-field={`retailers.items.${idx}`}
                  data-maker-label={`Punto / Ciudad: ${item.name}`}
                  className="h-10 px-4 bg-black/[0.03] border border-black/10 rounded-[4px] inline-flex items-center justify-center text-[10.5px] font-black uppercase tracking-[0.06em]"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </section>
        )

      case 'faqs':
        if (sections.faqs === false || !faqs.enabled || !faqs.items?.length) return null
        return (
          <section
            key="faqs"
            data-maker-section="faqs"
            data-maker-title="Preguntas Frecuentes"
            className="space-y-2 pt-2 border-t border-black/10"
            style={{ color: textHex }}
          >
            <h3
              data-maker-field="faqs.title"
              data-maker-label="Título Preguntas Frecuentes"
              className="text-[16px] font-extrabold tracking-[-0.02em] pb-1"
            >
              {faqs.title || 'Preguntas frecuentes'}
            </h3>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {faqs.items.map((faq: { q: string; a: string }, idx: number) => (
                <details
                  key={idx}
                  data-maker-field={`faqs.items.${idx}`}
                  data-maker-label={`Pregunta #${idx + 1}`}
                  className="group py-3"
                >
                  <summary className="w-full flex items-center justify-between font-semibold text-xs cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="pr-3">{faq.q}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pt-2 text-[11.5px] opacity-75 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )

      case 'garantias':
        if (sections.beneficios === false || !(benefits.items?.length ?? 0)) return null
        return (
          <section
            key="garantias"
            data-maker-section="garantias"
            data-maker-title="Garantías Pre-Footer"
            className={cn(
              'bg-black/[0.04] rounded-[6px] p-4',
              isTablet ? 'grid grid-cols-3 gap-4' : 'divide-y divide-black/10'
            )}
            style={{ color: textHex }}
          >
            {(benefits.items || [])
              .slice(0, 3)
              .map((item: { icon: CatalogIconName; label: string; desc: string }, idx: number) => {
                const ItemIcon = IconMap[item.icon] || Award
                return (
                  <div
                    key={idx}
                    data-maker-field={`benefits.items.${idx}`}
                    data-maker-label={`Garantía #${idx + 1}: ${item.label}`}
                    className={cn(
                      'flex items-start gap-3',
                      !isTablet && idx > 0 && 'pt-3',
                      !isTablet && idx < 2 && 'pb-3'
                    )}
                  >
                    <ItemIcon className="w-4 h-4 shrink-0 mt-0.5 stroke-[1.6]" />
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10.5px] opacity-70 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                )
              })}
          </section>
        )

      case 'story':
        if (!sections.brandStory || !brandStory) return null
        return (
          <section
            key="story"
            data-maker-section="story"
            data-maker-title="Historia de Marca"
            className={cn(
              'rounded-[8px] overflow-hidden border border-black/10 bg-black/[0.02]',
              isTablet ? 'grid grid-cols-2 items-center' : 'flex flex-col'
            )}
            style={{ color: textHex }}
          >
            {brandStory.bgUrl && (
              <div
                data-maker-field="brandStory.imageUrl"
                data-maker-label="Imagen Historia de Marca"
                className={cn('w-full overflow-hidden bg-black/[0.05]', isTablet ? 'h-full min-h-[220px]' : 'h-44')}
              >
                <img src={brandStory.bgUrl} alt={brandStory.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 space-y-2.5">
              <h3
                data-maker-field="brandStory.title"
                data-maker-label="Título Historia"
                className="text-[17px] font-extrabold leading-snug"
              >
                {brandStory.title}
              </h3>
              <p
                data-maker-field="brandStory.text"
                data-maker-label="Texto Historia"
                className="text-[11.5px] opacity-75 leading-relaxed"
              >
                {brandStory.desc}
              </p>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  if (sectionId) {
    return renderSectionById(sectionId)
  }

  return (
    <div className="space-y-10 pt-4 text-left select-none">
      {sectionOrder.map(id => renderSectionById(id))}
    </div>
  )
}
