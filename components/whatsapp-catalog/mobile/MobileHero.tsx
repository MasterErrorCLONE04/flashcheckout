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
    fondo: string
    texto: string
  }
  heroBadge: string
  store: Store
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
}: MobileHeroProps) {
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
        className="relative h-[350px] w-full bg-white overflow-hidden rounded-[4px] text-left select-none shrink-0"
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-[3px] w-full h-full bg-white">
          {panels.map((src, idx) => (
            <div key={idx} className="relative w-full h-full overflow-hidden bg-[#F6F6F4]">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/15 to-transparent pointer-events-none" />

        {heroBadge && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/28 backdrop-blur-md border border-white/15 text-white text-[9.5px] font-semibold tracking-[0.06em]">
            {heroBadge}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3">
          <div className="space-y-1 max-w-[68%]">
            <h2 className="text-[22px] font-extrabold text-white leading-[1.06] tracking-[-0.03em] drop-shadow-xs">
              {bannerTitle || store.name}
            </h2>
            {bannerSubtitle && (
              <p className="text-[11.5px] font-normal text-white/90 leading-snug line-clamp-2">
                {bannerSubtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleBannerButtonClick}
            className="px-4 py-2 rounded-full bg-white text-[#111111] font-bold text-[10px] uppercase tracking-[0.08em] shrink-0 shadow-sm active:scale-95 transition-all border-0 cursor-pointer"
          >
            {bannerButton.text || 'Explorar'}
          </button>
        </div>
      </div>
    )
  }

  if (heroType === 'video' || bannerUrls.length > 0) {
    return (
      <div
        id="catalog-banner-mobile"
        className="relative h-[240px] w-full bg-zinc-900 overflow-hidden flex items-end p-5 rounded-xl text-left select-none shrink-0"
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
          <div className="absolute inset-0 w-full h-full">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 space-y-2 w-full">
          <h2 className="text-lg font-black text-white leading-tight">{bannerTitle}</h2>
          <p className="text-[11px] font-medium text-white/85 leading-snug line-clamp-2">
            {bannerSubtitle}
          </p>
          <button
            type="button"
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
      className="relative p-6 rounded-xl bg-[#F6F6F5] text-left select-none shrink-0 space-y-3"
    >
      {heroBadge && (
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {heroBadge}
        </span>
      )}
      <h2 className="text-2xl font-black tracking-tight leading-tight text-zinc-950">
        {bannerTitle || store.name}
      </h2>
      <p className="text-xs font-medium text-zinc-600 leading-relaxed line-clamp-2">
        {bannerSubtitle || store.bio}
      </p>
      <button
        type="button"
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
