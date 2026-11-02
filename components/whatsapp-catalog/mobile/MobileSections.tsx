'use client'

import React, { useState } from 'react'
import { ChevronDown, Check, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconMap, CatalogIconName } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'

export interface MobileSectionsProps {
  settings: CatalogResolvedSettings
  activeNavTab: string
}

const DEFAULT_RITUAL_PHOTOS = [
  'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=85',
]

export function MobileSections({ settings, activeNavTab }: MobileSectionsProps) {
  const {
    sections,
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

  if (activeNavTab === 'Historia') {
    return (
      <div className="space-y-8 select-none text-left animate-in fade-in duration-500 pb-8">
        <div className="space-y-2 text-center pb-2">
          <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase block">
            {brandStoryPage.headerTrayectoria || 'NUESTRA MISIÓN'}
          </span>
          <h2 className="text-xl font-black text-zinc-950 tracking-tight leading-tight">
            {brandStoryPage.headerPerfil}
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
            {brandStoryPage.narrativeP1}
          </p>
          {brandStoryPage.imageHeritage && (
            <div className="rounded-xl overflow-hidden h-48 bg-[#F6F6F5]">
              <img
                src={brandStoryPage.imageHeritage}
                alt="Nuestra Historia"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            {brandStoryPage.narrativeP2}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="bg-[#F6F6F5] rounded-xl p-4 space-y-1.5">
            <h4 className="font-bold text-xs text-zinc-950">{brandStoryPage.pillar1Title}</h4>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {brandStoryPage.pillar1Desc}
            </p>
          </div>
          <div className="bg-[#F6F6F5] rounded-xl p-4 space-y-1.5">
            <h4 className="font-bold text-xs text-zinc-950">{brandStoryPage.pillar2Title}</h4>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {brandStoryPage.pillar2Desc}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (activeNavTab !== 'Inicio') return null

  return (
    <div className="space-y-11 pt-4 text-left select-none">
      {/* 1. Editorial Statement + 3-Photo Ritual (Horizontal Scroll on Mobile) */}
      {sections.processTimeline !== false && processTimeline?.items?.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[20px] font-extrabold text-[#111111] tracking-[-0.025em] leading-[1.18]">
            {processTimeline.headline || processTimeline.title}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {processTimeline.items.slice(0, 3).map((step, idx) => {
              const photo =
                step.imageUrl || DEFAULT_RITUAL_PHOTOS[idx % DEFAULT_RITUAL_PHOTOS.length]
              return (
                <div key={idx} className="w-[215px] shrink-0 space-y-2.5">
                  <div className="aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#F6F6F4]">
                    <img src={photo} alt={step.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#111111]">{step.title}</h4>
                    <p className="text-[11px] text-[#52525B] leading-snug mt-0.5">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 2. Monochrome Press & Seals Strip */}
      {sections.pressLogos !== false && pressLogos?.enabled && pressLogos.items.length > 0 && (
        <section className="py-5 border-y border-[#EAEAE8] flex items-center justify-around gap-5 overflow-x-auto scrollbar-none">
          {pressLogos.items.map((logo, idx) => {
            const styleVariant = idx % 4
            return (
              <div key={idx} className="text-center shrink-0 px-1 text-[#111111]">
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
                  <span className="inline-block border-[1.5px] border-[#111111] px-1.5 py-0.5 text-[10px] font-black tracking-[0.1em] uppercase">
                    {logo.name}
                  </span>
                )}
                {logo.subtitle && (
                  <span className="text-[7px] font-bold tracking-[0.16em] uppercase text-[#71717A] block mt-0.5">
                    {logo.subtitle}
                  </span>
                )}
              </div>
            )
          })}
        </section>
      )}

      {/* 3. Recommended by Top Performers / Ambassadors */}
      {sections.ambassadors !== false && ambassadors?.enabled && ambassadors.items.length > 0 && (
        <section className="space-y-3.5">
          <h3 className="text-[18px] font-extrabold text-[#111111] tracking-[-0.02em]">
            {ambassadors.title}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {ambassadors.items.slice(0, 4).map((person, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#F6F6F4]">
                  <img
                    src={person.imageUrl}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[12.5px] font-bold text-[#111111] block leading-tight">
                    {person.name}
                  </span>
                  <span className="text-[10.5px] text-[#71717A] block">{person.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Massive Social Proof + Staggered UGC Photo Wall */}
      {(sections.testimonials !== false || sections.ugcGallery !== false) && (
        <section className="space-y-5 pt-2">
          {sections.testimonials !== false && testimonials.enabled && (
            <div className="text-center space-y-2.5 px-2">
              <div className="text-[#111111] text-[13px] tracking-[0.22em]">★★★★★</div>
              <h3 className="text-[19px] font-extrabold text-[#111111] tracking-[-0.02em]">
                {testimonials.title || 'Clientes felices en todo el país'}
              </h3>
              {ugcGallery?.subtitle && (
                <p className="text-[11.5px] text-[#52525B] leading-relaxed">
                  {ugcGallery.subtitle}
                </p>
              )}
              {testimonials.items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowReviews(prev => !prev)}
                  className="px-4 py-1.5 rounded-full border border-[#D4D4D2] bg-white text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#111111] cursor-pointer"
                >
                  {showReviews ? 'Ocultar reseñas' : 'Ver reseñas verificadas'}
                </button>
              )}
              {showReviews && (
                <div className="space-y-2.5 pt-2 text-left">
                  {testimonials.items.slice(0, 3).map((t, idx) => (
                    <div key={idx} className="p-3.5 bg-[#F6F6F4] rounded-[4px] space-y-1.5">
                      <p className="text-[11.5px] text-[#3F3F46] leading-relaxed">
                        &ldquo;{t.comment}&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#111111]">
                          {t.name} · {t.city}
                        </span>
                        <span className="text-[#0D3B26] font-semibold inline-flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Verificado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sections.ugcGallery !== false && ugcGallery?.enabled && ugcGallery.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pb-2">
              {ugcGallery.images.slice(0, 6).map((img, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'aspect-[4/5] rounded-[4px] overflow-hidden bg-[#F6F6F4]',
                    idx % 2 === 1 && 'translate-y-2.5'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. Official Retailers / Coverage */}
      {sections.retailers !== false && retailers?.enabled && retailers.items.length > 0 && (
        <section className="space-y-3 pt-2">
          <div>
            <h3 className="text-[16px] font-extrabold text-[#111111] tracking-[-0.02em]">
              {retailers.title}
            </h3>
            {retailers.subtitle && (
              <p className="text-[11.5px] text-[#71717A] mt-0.5">{retailers.subtitle}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {retailers.items.map((item, idx) => (
              <span
                key={idx}
                className="h-10 px-4 bg-white border border-[#E6E6E4] rounded-[4px] inline-flex items-center justify-center text-[10.5px] font-black uppercase tracking-[0.06em] text-[#111111]"
              >
                {item.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 6. Minimalist FAQ Accordion */}
      {sections.faqs !== false && faqs.enabled && faqs.items?.length > 0 && (
        <section className="space-y-2 pt-2 border-t border-[#EAEAE8]">
          <h3 className="text-[16px] font-extrabold text-[#111111] tracking-[-0.02em] pb-1">
            {faqs.title || 'Preguntas frecuentes'}
          </h3>
          <div className="divide-y divide-[#EAEAE8] border-y border-[#EAEAE8]">
            {faqs.items.map((faq, idx) => (
              <details key={idx} className="group py-3">
                <summary className="w-full flex items-center justify-between font-semibold text-xs cursor-pointer text-[#111111] list-none [&::-webkit-details-marker]:hidden">
                  <span className="pr-3">{faq.q}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#71717A] shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pt-2 text-[11.5px] text-[#52525B] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 7. Pre-Footer 3-Row Guarantee Strip */}
      {sections.beneficios !== false && benefits?.items?.length > 0 && (
        <section className="bg-[#F4F4F3] rounded-[4px] p-4 divide-y divide-[#E4E4E2]">
          {benefits.items
            .slice(0, 3)
            .map((item: { icon: CatalogIconName; label: string; desc: string }, idx: number) => {
              const ItemIcon = IconMap[item.icon] || Award
              return (
                <div
                  key={idx}
                  className={cn('flex items-start gap-3', idx > 0 && 'pt-3', idx < 2 && 'pb-3')}
                >
                  <ItemIcon className="w-4 h-4 text-[#111111] shrink-0 mt-0.5 stroke-[1.6]" />
                  <div>
                    <span className="text-xs font-bold text-[#111111] block">{item.label}</span>
                    <span className="text-[10.5px] text-[#71717A] block mt-0.5">{item.desc}</span>
                  </div>
                </div>
              )
            })}
        </section>
      )}
    </div>
  )
}
