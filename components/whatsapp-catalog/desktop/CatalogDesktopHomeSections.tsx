'use client'

import React, { useState } from 'react'
import { Award, ChevronRight, ArrowRight, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconMap, CatalogIconName, Store } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'

export interface CatalogDesktopHomeBottomProps {
  settings: CatalogResolvedSettings
  store: Store
}

export function CatalogDesktopHomeSections({
  settings,
  selectedCategory,
  setSelectedCategory,
}: {
  settings: CatalogResolvedSettings
  total?: number
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}) {
  const { sections, visualCategories, bentoHighlights, ingredientsSection } = settings

  return (
    <>
      {sections.visualCategories && visualCategories.length > 0 && (
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-8 select-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {visualCategories.map((catItem, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCategory(catItem.category)}
                className={cn(
                  'bg-[#F6F6F4] rounded-[4px] p-4 flex flex-col items-center text-center cursor-pointer transition-all border',
                  selectedCategory === catItem.category
                    ? 'border-zinc-950'
                    : 'border-transparent hover:border-zinc-300'
                )}
              >
                {catItem.imageUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2.5 bg-white">
                    <img
                      src={catItem.imageUrl}
                      alt={catItem.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span className="text-xs font-bold text-zinc-900">{catItem.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {sections.bentoHighlights && bentoHighlights?.items && bentoHighlights.items.length > 0 && (
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-10 select-none text-left">
          <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight mb-4">
            {bentoHighlights.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bentoHighlights.items.map((item, idx) => (
              <div key={idx} className="bg-[#F6F6F4] rounded-[4px] p-6 text-left space-y-2">
                <div className="text-2xl">{item.emoji || '✨'}</div>
                <h4 className="font-extrabold text-sm text-zinc-900">{item.title}</h4>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.ingredientsSection && ingredientsSection && (
        <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-12 select-none text-center">
          <div className="bg-[#F6F6F4] rounded-[6px] p-8 lg:p-12 space-y-8">
            <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              {ingredientsSection.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:text-right space-y-2">
                <h4 className="font-extrabold text-sm text-zinc-900">
                  {ingredientsSection.leftTitle}
                </h4>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                  {ingredientsSection.leftDesc}
                </p>
              </div>
              <div className="flex justify-center">
                {ingredientsSection.centerImageUrl && (
                  <img
                    src={ingredientsSection.centerImageUrl}
                    alt={ingredientsSection.title}
                    className="max-h-[220px] rounded-[4px] object-contain"
                  />
                )}
              </div>
              <div className="md:text-left space-y-2">
                <h4 className="font-extrabold text-sm text-zinc-900">
                  {ingredientsSection.rightTitle}
                </h4>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                  {ingredientsSection.rightDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function CatalogDesktopHomeBottomSections({
  settings,
  store,
}: CatalogDesktopHomeBottomProps) {
  const {
    colors,
    sections,
    accordionSpecs,
    brandStory,
    ugcGallery,
    retailers,
    benefits,
    freeShipping,
    testimonials,
    faqs,
  } = settings

  const [reviewsExpanded, setReviewsExpanded] = useState(false)

  // Ensure 12 photos for the iconic 6-column staggered Waterdrop UGC wave collage
  const collagePhotos = (() => {
    const src = ugcGallery.filter(Boolean)
    if (src.length === 0) return []
    const out: string[] = []
    while (out.length < 12) {
      out.push(src[out.length % src.length])
    }
    return out.slice(0, 12)
  })()

  // Exact organic wave offsets matching Waterdrop's center-peaked silhouette (slice 4)
  const colOffsets = [
    'md:mt-24',
    'md:mt-12',
    'md:mt-0',
    'md:mt-14',
    'md:mt-8',
    'md:mt-20',
  ]

  return (
    <div className="w-full pt-24 space-y-24">
      {/* 1. WATERDROP MASSIVE SOCIAL PROOF + 6-COLUMN STAGGERED UGC WAVE WALL */}
      {(sections.testimonials || sections.ugcGallery) && (
        <section className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 select-none">
          {sections.testimonials && testimonials.enabled && (
            <div className="max-w-[560px] mx-auto text-center space-y-3.5 mb-12">
              <div
                className="text-[14px] tracking-[0.3em] font-black"
                style={{ color: colors.texto }}
              >
                ★★★★★
              </div>
              <h2
                className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.036em] leading-[1.1]"
                style={{ color: colors.texto }}
              >
                {testimonials.title}
              </h2>
              <p className="text-xs sm:text-[13.5px] font-normal text-zinc-500 leading-relaxed">
                {testimonials.subtitle}
              </p>
              {testimonials.items.length > 0 && (
                <div className="pt-2.5">
                  <button
                    type="button"
                    onClick={() => setReviewsExpanded(v => !v)}
                    className="px-7 py-2.5 rounded-full border border-zinc-900 hover:bg-zinc-950 hover:text-white bg-transparent text-[11px] font-extrabold uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer"
                    style={!reviewsExpanded ? { color: colors.texto } : undefined}
                  >
                    {reviewsExpanded ? 'Ocultar opiniones' : 'Leer reseñas de clientes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Expandable Verified Written Reviews */}
          {sections.testimonials && reviewsExpanded && testimonials.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 text-left animate-in fade-in duration-300">
              {testimonials.items.map(
                (
                  t: { name: string; city: string; stars: number; comment: string },
                  idx: number
                ) => (
                  <div
                    key={idx}
                    className="p-6 rounded-[4px] bg-[#F6F6F4] flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-[0.18em] text-zinc-950">
                          {'★'.repeat(t.stars || 5)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                          <Check className="w-3 h-3 stroke-[2.5] text-emerald-600" />
                          Verificado
                        </span>
                      </div>
                      <p className="text-[13px] font-normal text-zinc-700 leading-relaxed">
                        “{t.comment}”
                      </p>
                    </div>
                    <div className="text-xs pt-2 border-t border-zinc-200/70">
                      <span className="font-bold text-zinc-950">{t.name}</span>
                      {t.city && <span className="text-zinc-500"> · {t.city}</span>}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* 6-Column Staggered UGC Photo Wall */}
          {sections.ugcGallery && collagePhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 items-start">
              {[0, 1, 2, 3, 4, 5].map(colIdx => {
                const topPhoto = collagePhotos[colIdx * 2]
                const bottomPhoto = collagePhotos[colIdx * 2 + 1]
                return (
                  <div key={colIdx} className={cn('space-y-3.5', colOffsets[colIdx])}>
                    {topPhoto && (
                      <div
                        className={cn(
                          'w-full rounded-[4px] overflow-hidden bg-[#F6F6F4]',
                          colIdx % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square'
                        )}
                      >
                        <img
                          src={topPhoto}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                    )}
                    {bottomPhoto && (
                      <div
                        className={cn(
                          'w-full rounded-[4px] overflow-hidden bg-[#F6F6F4]',
                          colIdx % 2 === 0 ? 'aspect-square' : 'aspect-[4/5]'
                        )}
                      >
                        <img
                          src={bottomPhoto}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* 2. WATERDROP "OUR RETAILERS" / COVERAGE & OFFICIAL CHANNELS */}
      {sections.retailers && retailers.items.length > 0 && (
        <section className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none">
          <div className="space-y-1 mb-7">
            <h2
              className="text-[22px] sm:text-[28px] font-extrabold tracking-[-0.03em]"
              style={{ color: colors.texto }}
            >
              {retailers.title}
            </h2>
            {retailers.subtitle && (
              <p className="text-[13px] font-normal text-zinc-500">{retailers.subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            {retailers.items.map((item, idx) => (
              <div
                key={idx}
                className="h-14 px-6 rounded-[4px] bg-white border border-zinc-200/90 hover:border-zinc-900 transition-colors flex items-center gap-3"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-5 object-contain" />
                ) : (
                  <span className="text-[13px] font-black tracking-[-0.02em] text-zinc-950">
                    {item.name}
                  </span>
                )}
                {item.badge && (
                  <span
                    className="px-2 py-0.5 rounded-[3px] text-[9.5px] font-extrabold uppercase tracking-[0.06em]"
                    style={{ backgroundColor: colors.acento || '#8CE5A7', color: '#111111' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {store.whatsapp && (
            <div className="mt-6 flex justify-end">
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${store.name}, quiero consultar tiempos de entrega en mi ciudad.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-[13px] font-bold underline underline-offset-4 hover:opacity-70 transition-opacity"
                style={{ color: colors.texto }}
              >
                <span>{retailers.ctaText || 'Consultar cobertura'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          )}
        </section>
      )}

      {/* Optional Brand Story Banner */}
      {sections.brandStory && brandStory && (
        <section className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 select-none">
          <div className="relative h-[320px] w-full bg-zinc-950 rounded-[4px] flex items-center justify-center text-center p-8 overflow-hidden">
            {brandStory.bgUrl && (
              <img
                src={brandStory.bgUrl}
                alt={brandStory.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            )}
            <div className="relative z-10 max-w-xl space-y-3 text-white">
              <h2 className="text-2xl font-extrabold tracking-tight">{brandStory.title}</h2>
              <p className="text-xs sm:text-sm font-medium text-white/85 leading-relaxed">
                {brandStory.desc}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Optional Specs Accordion */}
      {sections.accordionSpecs && accordionSpecs.length > 0 && (
        <section className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left">
          <div className="max-w-3xl divide-y divide-zinc-200 border-y border-zinc-200">
            {accordionSpecs.map((tab, idx) => (
              <details key={idx} className="group py-4">
                <summary className="flex items-center justify-between font-bold text-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span style={{ color: colors.texto }}>{tab.title}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="pt-3 text-xs font-medium text-zinc-500 leading-relaxed whitespace-pre-wrap">
                  {tab.content}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 3. CLEAN MINIMALIST FAQ SECTION */}
      {sections.faqs && faqs.enabled && faqs.items.length > 0 && (
        <section
          id="catalog-faqs"
          className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-2">
              <h2
                className="text-[22px] sm:text-[28px] font-extrabold tracking-[-0.03em]"
                style={{ color: colors.texto }}
              >
                {faqs.title || 'Preguntas Frecuentes'}
              </h2>
              <p className="text-[13px] font-normal text-zinc-500 leading-relaxed">
                Respuestas claras sobre pedidos, tiempos de despacho y garantía directa.
              </p>
            </div>
            <div className="lg:col-span-8 divide-y divide-zinc-200 border-y border-zinc-200">
              {faqs.items.map((faq: { q: string; a: string }, idx: number) => (
                <details key={idx} className="group py-5" open={idx === 0}>
                  <summary className="flex items-center justify-between font-bold text-[14px] cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span style={{ color: colors.texto }}>{faq.q}</span>
                    <Plus className="w-4 h-4 text-zinc-400 transition-transform duration-200 group-open:rotate-45 shrink-0 ml-4 stroke-[1.8]" />
                  </summary>
                  <p className="pt-3 text-[13px] font-normal text-zinc-500 leading-relaxed whitespace-pre-wrap max-w-2xl">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. WATERDROP PRE-FOOTER 3-COLUMN ARCHITECTURAL GUARANTEE STRIP */}
      {sections.beneficios && (benefits.items?.length ?? 0) > 0 && (
        <section className="w-full bg-[#F4F4F3] border-t border-zinc-200/80 select-none">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-300/70">
            {(benefits.items || [])
              .slice(0, 3)
              .map((item: { icon: CatalogIconName; label: string; desc: string }, idx: number) => {
                const ItemIcon = IconMap[item.icon] || Award
                const desc =
                  idx === 0 && freeShipping?.enabled && freeShipping.threshold
                    ? `Envío sin costo adicional en pedidos desde $${freeShipping.threshold.toLocaleString('es-CO')}`
                    : item.desc
                return (
                  <div key={idx} className="px-6 lg:px-12 py-10 text-left space-y-2.5">
                    <ItemIcon className="w-[22px] h-[22px] text-zinc-950 stroke-[1.5]" />
                    <div className="space-y-0.5">
                      <h4 className="text-[13.5px] font-bold text-zinc-950 tracking-[-0.01em]">
                        {item.label}
                      </h4>
                      <p className="text-xs font-normal text-zinc-600 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      )}
    </div>
  )
}
