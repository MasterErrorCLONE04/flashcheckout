'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Store } from '../types'

export interface CatalogDesktopHeroProps {
  heroType: string
  bannerUrls: string[]
  heroPanels?: string[]
  heroStyle: string
  radiusCard: string
  radiusBadge: string
  radiusButton: string
  shadowCard: string
  colors: {
    primario: string
    secundario: string
    texto: string
    fondo: string
    acento: string
  }
  heroBadge: string
  bannerTitle: string
  bannerSubtitle: string
  bannerButton: {
    text?: string
    action?: 'scroll' | 'whatsapp' | 'link'
    link?: string
  }
  handleBannerButtonClick: () => void
  heroVideoUrl: string
  currentBannerIdx: number
  setCurrentBannerIdx: React.Dispatch<React.SetStateAction<number>>
  store: Store
}

const DEFAULT_EDITORIAL_PANELS = [
  'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85',
]

export function CatalogDesktopHero({
  heroType,
  bannerUrls,
  heroPanels = [],
  heroStyle,
  radiusCard,
  radiusBadge,
  radiusButton,
  shadowCard,
  colors,
  heroBadge,
  bannerTitle,
  bannerSubtitle,
  bannerButton,
  handleBannerButtonClick,
  heroVideoUrl,
  currentBannerIdx,
  setCurrentBannerIdx,
  store,
}: CatalogDesktopHeroProps) {
  const [paused, setPaused] = useState(false)

  // Build 4 distinct architectural panels (never repeating the exact same URL 4 times if defaults exist)
  const resolvedPanels = (() => {
    const cleanPanels = heroPanels.filter(Boolean)
    if (cleanPanels.length >= 4) return cleanPanels.slice(0, 4)
    const merged = [...cleanPanels, ...bannerUrls.filter(Boolean)]
    if (merged.length >= 4) return merged.slice(0, 4)
    return [0, 1, 2, 3].map(idx => merged[idx] || DEFAULT_EDITORIAL_PANELS[idx])
  })()

  // 1. FLAGSHIP FULL-BLEED WATERDROP 4-PANEL EDITORIAL COLLAGE
  if (heroStyle === 'waterdrop-collage') {
    return (
      <section
        id="catalog-banner"
        data-maker-section="hero"
        data-maker-title="Portada & Hero Collage"
        className="w-full shrink-0 select-none bg-white cursor-pointer"
      >
        <div className="relative w-full h-[460px] lg:h-[550px] xl:h-[610px] overflow-hidden bg-white">
          {heroType === 'video' && heroVideoUrl ? (
            <video
              src={heroVideoUrl}
              autoPlay={!paused}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-12 gap-[5px] w-full h-full bg-white">
              {/* Panel 1: Left Macro Accent (2/12) */}
              <div className="hidden md:block md:col-span-2 h-full overflow-hidden bg-[#F6F6F4]">
                <img
                  src={resolvedPanels[0]}
                  alt={store.name}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-[4000ms] ease-out',
                    !paused && 'hover:scale-105'
                  )}
                />
              </div>

              {/* Panel 2: Center Hero Campaign Focus (5/12) */}
              <div className="col-span-1 md:col-span-5 h-full overflow-hidden bg-[#F6F6F4]">
                <img
                  src={resolvedPanels[1]}
                  alt={bannerTitle}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-[4000ms] ease-out',
                    !paused && 'hover:scale-105'
                  )}
                />
              </div>

              {/* Panel 3: Secondary Studio Portrait (3/12) */}
              <div className="col-span-1 md:col-span-3 h-full overflow-hidden bg-[#F6F6F4]">
                <img
                  src={resolvedPanels[2]}
                  alt={store.name}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-[4000ms] ease-out',
                    !paused && 'hover:scale-105'
                  )}
                />
              </div>

              {/* Panel 4: Far Right Lifestyle Crop (2/12) */}
              <div className="hidden md:block md:col-span-2 h-full overflow-hidden bg-[#F6F6F4]">
                <img
                  src={resolvedPanels[3]}
                  alt={store.name}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-[4000ms] ease-out',
                    !paused && 'hover:scale-105'
                  )}
                />
              </div>
            </div>
          )}

          {/* Refined Cinematic Bottom Scrim (keeps upper 65% crystal-bright like Waterdrop) */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/72 via-black/32 to-transparent pointer-events-none" />

          {/* Top Controls Overlay Container aligned to 1440px grid */}
          <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-6 flex items-center justify-between">
              {heroBadge ? (
                <span className="pointer-events-auto inline-flex items-center px-4 py-2 rounded-full text-[10.5px] font-bold uppercase tracking-[0.12em] bg-black/28 text-white backdrop-blur-xl border border-white/25 shadow-xs">
                  {heroBadge}
                </span>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setPaused(p => !p)}
                className="pointer-events-auto w-9 h-9 rounded-full bg-black/28 hover:bg-black/50 text-white backdrop-blur-xl border border-white/25 flex items-center justify-center cursor-pointer transition-all"
                title={paused ? 'Reanudar' : 'Pausar'}
                aria-label={paused ? 'Reanudar' : 'Pausar'}
              >
                {paused ? (
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Editorial Display Headline + Tactile White Pill CTA */}
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-9 pt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-2 text-left">
                <h1 className="text-3xl sm:text-[44px] xl:text-[52px] font-extrabold text-white tracking-[-0.038em] leading-[1.03] drop-shadow-[0_2px_16px_rgba(0,0,0,0.22)]">
                  {bannerTitle}
                </h1>
                {bannerSubtitle && (
                  <p className="text-xs sm:text-[15px] font-medium text-white/92 max-w-xl leading-relaxed line-clamp-2 tracking-[-0.01em]">
                    {bannerSubtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleBannerButtonClick}
                className="self-start sm:self-auto shrink-0 px-8 py-3.5 rounded-full bg-white hover:bg-zinc-950 text-zinc-950 hover:text-white font-extrabold text-[11.5px] uppercase tracking-[0.08em] shadow-[0_8px_30px_rgba(0,0,0,0.18)] active:scale-98 transition-all duration-300 cursor-pointer border-0"
              >
                {bannerButton.text || 'Explorar ahora'}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 2. SPLIT 50/50 HERO
  if (heroStyle === 'split-hero') {
    return (
      <section
        id="catalog-banner"
        data-maker-section="hero"
        data-maker-title="Portada & Hero Collage"
        className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-6 pb-2 shrink-0 cursor-pointer"
      >
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 lg:p-14 bg-[#F6F6F4] overflow-hidden rounded-[6px]',
            shadowCard
          )}
        >
          <div className="md:col-span-6 space-y-4 text-left">
            {heroBadge && (
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em]',
                  radiusBadge
                )}
                style={{ backgroundColor: colors.acento || '#8CE5A7', color: '#111111' }}
              >
                {heroBadge}
              </span>
            )}
            <h1
              className="text-3xl xl:text-5xl font-extrabold leading-[1.05] tracking-[-0.035em]"
              style={{ color: colors.texto }}
            >
              {bannerTitle}
            </h1>
            <p className="text-xs xl:text-sm font-medium leading-relaxed max-w-md text-zinc-600">
              {bannerSubtitle}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBannerButtonClick}
                className={cn(
                  'px-8 py-3.5 text-white font-extrabold text-xs uppercase tracking-[0.07em] inline-flex items-center gap-2 active:scale-95 transition-all border-0 cursor-pointer',
                  radiusButton
                )}
                style={{ backgroundColor: colors.primario }}
              >
                <span>{bannerButton.text || 'Explorar ahora'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="md:col-span-6 relative h-[360px] overflow-hidden bg-zinc-200 rounded-[4px]">
            {heroType === 'video' && heroVideoUrl ? (
              <video
                src={heroVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : bannerUrls[0] ? (
              <img
                src={bannerUrls[currentBannerIdx] || bannerUrls[0]}
                alt={bannerTitle}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  // 3. CINEMATIC OVERLAY / MINIMAL BANNER
  return (
    <section
      id="catalog-banner"
      data-maker-section="hero"
      data-maker-title="Portada & Hero Collage"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 pt-5 pb-2 shrink-0 cursor-pointer"
    >
      <div
        className={cn(
          'relative w-full overflow-hidden flex items-end p-8 xl:p-12 text-left select-none group bg-zinc-950',
          heroStyle === 'minimal-banner' ? 'h-[300px]' : 'h-[440px]',
          radiusCard,
          shadowCard
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
        ) : bannerUrls.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            {bannerUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={bannerTitle}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0',
                  idx === currentBannerIdx ? 'opacity-100' : 'opacity-0'
                )}
              />
            ))}
          </div>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 z-0 pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            {heroBadge && (
              <span
                className={cn(
                  'inline-flex items-center px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md bg-white/15 border border-white/25',
                  radiusBadge
                )}
              >
                {heroBadge}
              </span>
            )}
            <h1 className="text-2xl xl:text-[44px] font-extrabold text-white leading-[1.06] tracking-[-0.035em]">
              {bannerTitle}
            </h1>
            <p className="text-xs xl:text-sm font-medium text-white/85 leading-relaxed max-w-lg">
              {bannerSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleBannerButtonClick}
            className={cn(
              'self-start sm:self-auto shrink-0 px-8 py-3.5 bg-white hover:bg-zinc-950 text-zinc-950 hover:text-white font-extrabold text-[11.5px] uppercase tracking-[0.08em] shadow-md active:scale-95 transition-all border-0 cursor-pointer',
              radiusButton
            )}
          >
            {bannerButton.text || 'Explorar ahora'}
          </button>
        </div>

        {bannerUrls.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setCurrentBannerIdx(prev => (prev === 0 ? bannerUrls.length - 1 : prev - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentBannerIdx(prev => (prev + 1) % bannerUrls.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </section>
  )
}
