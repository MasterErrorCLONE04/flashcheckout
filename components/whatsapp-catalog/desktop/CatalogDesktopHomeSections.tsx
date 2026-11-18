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

export function VisualCategoriesDesktopSection({
  settings,
  selectedCategory,
  setSelectedCategory,
}: {
  settings: CatalogResolvedSettings
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}) {
  const { sections, visualCategories } = settings
  if (!sections.visualCategories || visualCategories.length === 0) return null

  return (
    <section
      data-maker-section="visualCategories"
      data-maker-title="Categorías Visuales"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-8 select-none"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {visualCategories.map((catItem, idx) => (
          <button
            key={idx}
            type="button"
            data-maker-field={`visualCategories.${idx}`}
            data-maker-label={`Categoría Visual: ${catItem.category}`}
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
    </section>
  )
}

export function BentoDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { sections, bentoHighlights } = settings
  if (!sections.bentoHighlights || !bentoHighlights?.items || bentoHighlights.items.length === 0) return null

  return (
    <section
      data-maker-section="bentoHighlights"
      data-maker-title="Bento Grid de Destacados"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-10 select-none text-left"
    >
      <h3
        data-maker-field="bentoHighlights.title"
        data-maker-label="Título Grilla Bento"
        className="text-lg font-extrabold text-zinc-900 tracking-tight mb-4"
      >
        {bentoHighlights.title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bentoHighlights.items.map((item, idx) => (
          <div
            key={idx}
            data-maker-field={`bentoHighlights.items.${idx}`}
            data-maker-label={`Tarjeta Bento #${idx + 1}: ${item.title}`}
            className="bg-[#F6F6F4] rounded-[4px] p-6 text-left space-y-2"
          >
            <div className="text-2xl">{item.emoji || '✨'}</div>
            <h4 className="font-extrabold text-sm text-zinc-900">{item.title}</h4>
            <p className="text-xs font-medium text-zinc-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function IngredientsDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { sections, ingredientsSection } = settings
  if (!sections.ingredientsSection || !ingredientsSection) return null

  return (
    <section
      data-maker-section="ingredientsSection"
      data-maker-title="Ficha de Ingredientes y Pureza"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-12 select-none text-center"
    >
      <div className="bg-[#F6F6F4] rounded-[6px] p-8 lg:p-12 space-y-8">
        <h3
          data-maker-field="ingredientsSection.title"
          data-maker-label="Título de Ingredientes y Pureza"
          className="text-xl font-extrabold text-zinc-900 tracking-tight"
        >
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
    </section>
  )
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
  return (
    <>
      <VisualCategoriesDesktopSection
        settings={settings}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <BentoDesktopSection settings={settings} />
      <IngredientsDesktopSection settings={settings} />
    </>
  )
}

export function UgcDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { colors, sections, ugcGallery, testimonials } = settings
  const [reviewsExpanded, setReviewsExpanded] = useState(false)

  if (!sections.testimonials && !sections.ugcGallery) return null

  const collagePhotos = (() => {
    const src = ugcGallery.filter(Boolean)
    if (src.length === 0) return []
    const out: string[] = []
    while (out.length < 12) {
      out.push(src[out.length % src.length])
    }
    return out.slice(0, 12)
  })()

  const colOffsets = [
    'md:mt-24',
    'md:mt-12',
    'md:mt-0',
    'md:mt-14',
    'md:mt-8',
    'md:mt-20',
  ]

  return (
    <section
      data-maker-section="ugc"
      data-maker-title="Mural Social UGC & Reseñas"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 select-none pt-14"
    >
      {sections.testimonials && testimonials.enabled && (
        <div className="max-w-[560px] mx-auto text-center space-y-3.5 mb-12">
          <div
            className="text-[14px] tracking-[0.3em] font-black"
            style={{ color: colors.texto }}
          >
            ★★★★★
          </div>
          <h2
            data-maker-field="testimonials.title"
            data-maker-label="Título Testimonios"
            className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.036em] leading-[1.1]"
            style={{ color: colors.texto }}
          >
            {testimonials.title}
          </h2>
          <p
            data-maker-field="testimonials.subtitle"
            data-maker-label="Subtítulo Testimonios"
            className="text-xs sm:text-[13.5px] font-normal text-zinc-500 leading-relaxed"
          >
            {testimonials.subtitle}
          </p>
          {testimonials.items?.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setReviewsExpanded(v => !v)}
                className="px-5 py-2 rounded-full border border-zinc-200 bg-white text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition-all cursor-pointer shadow-2xs"
              >
                {reviewsExpanded ? 'Ocultar reseñas' : `Ver ${testimonials.items.length} reseñas verificadas`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Accordion List of Verified Reviews */}
      {reviewsExpanded && testimonials.items?.length > 0 && (
        <div className="max-w-2xl mx-auto mb-14 space-y-3 animate-in fade-in duration-300">
          {testimonials.items.map((review: any, idx: number) => (
            <div
              key={idx}
              data-maker-field={`testimonials.items.${idx}`}
              data-maker-label={`Reseña de ${review.name}`}
              className="bg-[#F6F6F4] rounded-[6px] p-4 text-left space-y-1.5 border border-zinc-200/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">{review.name}</span>
                <span className="text-[10px] text-zinc-400 font-semibold">{review.city}</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                &ldquo;{review.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 6-Column Staggered UGC Wall */}
      {sections.ugcGallery && collagePhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {collagePhotos.map((photoUrl, idx) => (
            <div
              key={idx}
              data-maker-field={`ugcGallery.${idx % Math.max(1, ugcGallery.length)}`}
              data-maker-label={`Foto UGC #${(idx % Math.max(1, ugcGallery.length)) + 1}`}
              className={cn(
                'aspect-[3/4] rounded-[4px] overflow-hidden bg-[#F6F6F4] relative group',
                colOffsets[idx % 6]
              )}
            >
              <img
                src={photoUrl}
                alt="Comunidad"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function RetailersDesktopSection({
  settings,
  store,
}: {
  settings: CatalogResolvedSettings
  store: Store
}) {
  const { colors, sections, retailers } = settings
  if (!sections.retailers || retailers.items.length === 0) return null

  return (
    <section
      data-maker-section="retailers"
      data-maker-title="Puntos de Entrega & Cobertura"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none pt-16"
    >
      <div className="space-y-1 mb-7">
        <h2
          data-maker-field="retailers.title"
          data-maker-label="Título de Cobertura"
          className="text-[22px] sm:text-[28px] font-extrabold tracking-[-0.03em]"
          style={{ color: colors.texto }}
        >
          {retailers.title}
        </h2>
        {retailers.subtitle && (
          <p
            data-maker-field="retailers.subtitle"
            data-maker-label="Subtítulo de Cobertura"
            className="text-[13px] font-normal text-zinc-500"
          >
            {retailers.subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        {retailers.items.map((item, idx) => (
          <div
            key={idx}
            data-maker-field={`retailers.items.${idx}`}
            data-maker-label={`Punto / Ciudad: ${item.name}`}
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
            <span>{retailers.ctaText || 'Consultar cobertura por WhatsApp'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      )}
    </section>
  )
}

export function StoryDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { sections, brandStory } = settings
  if (!sections.brandStory || !brandStory) return null

  return (
    <section
      data-maker-section="story"
      data-maker-title="Historia de Marca & Manifiesto"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 select-none pt-16"
    >
      <div className="relative h-[320px] w-full bg-zinc-950 rounded-[4px] flex items-center justify-center text-center p-8 overflow-hidden">
        {brandStory.bgUrl && (
          <img
            src={brandStory.bgUrl}
            alt={brandStory.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="relative z-10 max-w-xl space-y-3 text-white">
          <h2
            data-maker-field="brandStory.title"
            data-maker-label="Título Historia de Marca"
            className="text-2xl font-extrabold tracking-tight"
          >
            {brandStory.title}
          </h2>
          <p
            data-maker-field="brandStory.text"
            data-maker-label="Texto Historia de Marca"
            className="text-xs sm:text-sm font-medium text-white/85 leading-relaxed"
          >
            {brandStory.desc}
          </p>
        </div>
      </div>
    </section>
  )
}

export function FaqsDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { colors, sections, faqs } = settings
  if (!sections.faqs || !faqs.enabled || !faqs.items?.length) return null

  return (
    <section
      id="catalog-faqs"
      data-maker-section="faqs"
      data-maker-title="Preguntas Frecuentes"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none pt-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-2">
          <h2
            data-maker-field="faqs.title"
            data-maker-label="Título Preguntas Frecuentes"
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
            <details
              key={idx}
              data-maker-field={`faqs.items.${idx}`}
              data-maker-label={`Pregunta Frecuente #${idx + 1}`}
              className="group py-5"
              open={idx === 0}
            >
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
  )
}

export function GarantiasDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { sections, benefits, freeShipping } = settings
  if (!sections.beneficios || (benefits.items?.length ?? 0) === 0) return null

  return (
    <section
      data-maker-section="garantias"
      data-maker-title="Garantías Pre-Footer"
      className="w-full bg-[#F4F4F3] border-t border-[#EAEAE8] select-none pt-12 mt-16"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E3]">
        {(benefits.items || [])
          .slice(0, 3)
          .map((item: { icon: CatalogIconName; label: string; desc: string }, idx: number) => {
            const ItemIcon = IconMap[item.icon] || Award
            const desc =
              idx === 0 && freeShipping?.enabled && freeShipping.threshold
                ? `Envío sin costo adicional en pedidos desde $${freeShipping.threshold.toLocaleString('es-CO')}`
                : item.desc
            return (
              <div
                key={idx}
                data-maker-field={`benefits.items.${idx}`}
                data-maker-label={`Garantía #${idx + 1}: ${item.label}`}
                className="px-8 lg:px-14 py-9 text-left flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#E5E5E3] flex items-center justify-center shrink-0 shadow-2xs group-hover:border-[#111111] transition-colors">
                  <ItemIcon className="w-[18px] h-[18px] text-[#111111] stroke-[1.6]" />
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-[13.5px] font-extrabold text-[#111111] tracking-[-0.015em] leading-snug">
                    {item.label}
                  </h4>
                  <p className="text-[12px] font-normal text-[#52525B] leading-relaxed max-w-[280px]">
                    {desc}
                  </p>
                </div>
              </div>
            )
          })}
      </div>
    </section>
  )
}

export function CatalogDesktopHomeBottomSections({
  settings,
  store,
}: CatalogDesktopHomeBottomProps) {
  return (
    <div className="w-full space-y-16">
      <UgcDesktopSection settings={settings} />
      <RetailersDesktopSection settings={settings} store={store} />
      <StoryDesktopSection settings={settings} />
      <FaqsDesktopSection settings={settings} />
      <GarantiasDesktopSection settings={settings} />
    </div>
  )
}
