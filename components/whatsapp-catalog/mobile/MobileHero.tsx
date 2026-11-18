'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Store } from '../types'

export interface MobileHeroProps {
  heroType: string
  heroStyle?: string
  bannerUrls: string[]
  heroPanels?: string[]
  heroVideoUrl: string
  currentBannerIdx: number
  setCurrentBannerIdx: React.Dispatch<React.SetStateAction<number>>
  bannerTitle: string
  bannerSubtitle: string
  bannerButton: {
    text?: string
    action?: 'scroll' | 'whatsapp' | 'link'
    link?: string
  }
  handleBannerButtonClick: () => void
  colors: {
    primario: string
    secundario: string
    acento?: string
    fondo: string
    texto: string
  }
  heroBadge: string
  store: Store
  device?: string
}

const DEFAULT_MOBILE_PANELS = [
  'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=85',
]

export function MobileHero({
  heroType,
  heroStyle = 'waterdrop-collage',
  bannerUrls,
  heroPanels = [],
  heroVideoUrl,
  currentBannerIdx,
  setCurrentBannerIdx,
  bannerTitle,
  bannerSubtitle,
  bannerButton,
  handleBannerButtonClick,
  colors,
  heroBadge,
  store,
  device,
}: MobileHeroProps) {
  const isTablet = device === 'tablet'

  if (heroStyle === 'waterdrop-collage' && heroType !== 'video') {
    const rawCandidates = [...heroPanels, ...bannerUrls]
      .map(s => (s || '').trim())
      .filter(Boolean)
    const uniquePanels: string[] = []
    for (const url of rawCandidates) {
      if (!uniquePanels.includes(url)) uniquePanels.push(url)
    }
    const panels = [0, 1, 2, 3].map(i => uniquePanels[i] || DEFAULT_MOBILE_PANELS[i])

    return (
      <div
        id="catalog-banner-mobile"
        data-maker-section="hero"
        data-maker-title="Portada & Hero Collage"
        className={cn(
          'relative w-full bg-white overflow-hidden rounded-[6px] text-left select-none shrink-0',
          isTablet ? 'h-[370px]' : 'h-[350px]'
        )}
      >
        <div
          className={cn(
            'gap-[3px] w-full h-full bg-white grid',
            isTablet ? 'grid-cols-4 grid-rows-1' : 'grid-cols-2 grid-rows-2'
          )}
        >
          {panels.map((src, idx) => (
            <div
              key={idx}
              data-maker-field={`heroPanels.${idx}`}
              data-maker-label={`Foto Panel #${idx + 1}`}
              className="relative w-full h-full overflow-hidden bg-[#F6F6F4]"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent pointer-events-none" />

        {heroBadge && (
          <div
            data-maker-field="heroBadge"
            data-maker-label="Etiqueta Superior Hero"
            className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/32 backdrop-blur-md border border-white/15 text-white text-[9.5px] font-semibold tracking-[0.06em]"
          >
            {heroBadge}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
          <div className={cn('space-y-1', isTablet ? 'max-w-[72%]' : 'max-w-[68%]')}>
            <h2
              data-maker-field="bannerTitle"
              data-maker-label="Título Principal Hero"
              className={cn(
                'font-extrabold text-white leading-[1.06] tracking-[-0.03em] drop-shadow-xs',
                isTablet ? 'text-[26px]' : 'text-[21px]'
              )}
            >
              {bannerTitle || store.name}
            </h2>
            {bannerSubtitle && (
              <p
                data-maker-field="bannerSubtitle"
                data-maker-label="Subtítulo Hero"
                className={cn(
                  'font-normal text-white/90 leading-snug line-clamp-2',
                  isTablet ? 'text-[12.5px]' : 'text-[11.5px]'
                )}
              >
                {bannerSubtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            data-maker-field="bannerButton.text"
            data-maker-label="Botón de Acción Hero"
            onClick={handleBannerButtonClick}
            className="px-4 py-2 rounded-full bg-white text-[#111111] font-bold text-[10px] uppercase tracking-[0.08em] shrink-0 shadow-sm active:scale-95 transition-all border-0 cursor-pointer"
          >
            {bannerButton.text || 'Explorar'}
          </button>
        </div>
      </div>
    )
  }

  if (heroStyle === 'split' && heroType !== 'video' && bannerUrls.length > 0) {
    return (
      <div
        id="catalog-banner-mobile"
        data-maker-section="hero"
        data-maker-title="Portada & Hero Split"
        className={cn(
          'rounded-xl overflow-hidden border border-black/10 select-none shrink-0',
          isTablet ? 'grid grid-cols-2 items-center' : 'flex flex-col'
        )}
        style={{ backgroundColor: colors.fondo, color: colors.texto }}
      >
        <div className="p-5 space-y-2.5 text-left">
          {heroBadge && (
            <span
              data-maker-field="heroBadge"
              data-maker-label="Etiqueta Superior Hero"
              className="inline-block text-[9.5px] font-bold uppercase tracking-widest opacity-70"
            >
              {heroBadge}
            </span>
          )}
          <h2
            data-maker-field="bannerTitle"
            data-maker-label="Título Principal Hero"
            className={cn('font-black leading-tight tracking-tight', isTablet ? 'text-2xl' : 'text-xl')}
          >
            {bannerTitle || store.name}
          </h2>
          {bannerSubtitle && (
            <p
              data-maker-field="bannerSubtitle"
              data-maker-label="Subtítulo Hero"
              className="text-xs opacity-80 leading-relaxed line-clamp-2"
            >
              {bannerSubtitle}
            </p>
          )}
          <button
            type="button"
            data-maker-field="bannerButton.text"
            data-maker-label="Botón de Acción Hero"
            onClick={handleBannerButtonClick}
            className="px-4 py-2 rounded-full text-white font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 active:scale-95 transition-all border-0 cursor-pointer"
            style={{ backgroundColor: colors.primario }}
          >
            <span>{bannerButton.text || 'Explorar'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div
          data-maker-field="bannerUrl"
          data-maker-label="Imagen Principal Hero"
          className={cn('w-full overflow-hidden bg-[#F6F6F4]', isTablet ? 'h-[240px]' : 'h-[190px]')}
        >
          <img src={bannerUrls[0]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    )
  }

  if (heroType === 'video' || bannerUrls.length > 0) {
    return (
      <div
        id="catalog-banner-mobile"
        data-maker-section="hero"
        data-maker-title="Portada & Hero"
        className={cn(
          'relative w-full bg-zinc-900 overflow-hidden flex items-end p-5 rounded-xl text-left select-none shrink-0',
          isTablet ? 'h-[310px]' : 'h-[250px]'
        )}
      >
        {heroType === 'video' && heroVideoUrl ? (
          <video
            src={heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div
            data-maker-field="bannerUrl"
            data-maker-label="Imagen Principal Hero"
            className="absolute inset-0 w-full h-full"
          >
            {bannerUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Banner"
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-0',
                  idx === currentBannerIdx ? 'opacity-100' : 'opacity-0'
                )}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 space-y-2 w-full">
          {heroBadge && (
            <span
              data-maker-field="heroBadge"
              data-maker-label="Etiqueta Superior Hero"
              className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider"
            >
              {heroBadge}
            </span>
          )}
          <h2
            data-maker-field="bannerTitle"
            data-maker-label="Título Principal Hero"
            className={cn('font-black text-white leading-tight', isTablet ? 'text-2xl' : 'text-lg')}
          >
            {bannerTitle}
          </h2>
          <p
            data-maker-field="bannerSubtitle"
            data-maker-label="Subtítulo Hero"
            className="text-[11px] font-medium text-white/85 leading-snug line-clamp-2"
          >
            {bannerSubtitle}
          </p>
          <button
            type="button"
            data-maker-field="bannerButton.text"
            data-maker-label="Botón de Acción Hero"
            onClick={handleBannerButtonClick}
            className="px-4 py-2 rounded-full bg-white text-zinc-950 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 shadow-sm active:scale-95 transition-all border-0 cursor-pointer"
          >
            <span>{bannerButton.text || 'Explorar'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {bannerUrls.length > 1 && (
          <div className="absolute top-3 right-3 flex gap-1 z-10">
            {bannerUrls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentBannerIdx(idx)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all border-0 p-0 cursor-pointer',
                  idx === currentBannerIdx ? 'bg-white w-4' : 'bg-white/40'
                )}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      id="catalog-banner-mobile"
      data-maker-section="hero"
      data-maker-title="Portada & Hero"
      className="relative p-6 rounded-xl bg-[#F6F6F5] text-left select-none shrink-0 space-y-3"
    >
      {heroBadge && (
        <span
          data-maker-field="heroBadge"
          data-maker-label="Etiqueta Superior Hero"
          className="inline-block text-[10px] font-bold uppercase tracking-widest text-zinc-500"
        >
          {heroBadge}
        </span>
      )}
      <h2
        data-maker-field="bannerTitle"
        data-maker-label="Título Principal Hero"
        className="text-2xl font-black tracking-tight leading-tight text-zinc-950"
      >
        {bannerTitle || store.name}
      </h2>
      <p
        data-maker-field="bannerSubtitle"
        data-maker-label="Subtítulo Hero"
        className="text-xs font-medium text-zinc-600 leading-relaxed line-clamp-2"
      >
        {bannerSubtitle || store.bio}
      </p>
      <button
        type="button"
        data-maker-field="bannerButton.text"
        data-maker-label="Botón de Acción Hero"
        onClick={handleBannerButtonClick}
        className="py-2.5 px-5 rounded-full text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 active:scale-95 transition-all border-0 cursor-pointer"
        style={{ backgroundColor: colors.primario }}
      >
        <span>{bannerButton.text || 'Explorar'}</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
