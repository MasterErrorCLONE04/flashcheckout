'use client'

import React from 'react'
import { ChevronRight, ShoppingCart, MessageCircle, Sparkles } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Store } from '../types'

export interface MobileHeroProps {
  heroType: string
  bannerUrls: string[]
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

export function MobileHero({
  heroType,
  bannerUrls,
  heroVideoUrl,
  currentBannerIdx,
  setCurrentBannerIdx,
  bannerTitle,
  bannerSubtitle,
  bannerButton,
  handleBannerButtonClick,
  colors,
  heroBadge,
  store
}: MobileHeroProps) {
  if (heroType === 'video' || bannerUrls.length > 0) {
    return (
      <div id="catalog-banner-mobile" className="relative h-[190px] w-full bg-zinc-900 overflow-hidden flex items-center px-6 rounded-2xl text-left select-none shrink-0 shadow-sm group">
        {heroType === 'video' && heroVideoUrl ? (
          <video 
            src={heroVideoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-100 z-0"
          />
        ) : bannerUrls.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            {bannerUrls.map((url, idx) => (
              <img 
                key={idx}
                src={url} 
                alt="Banner" 
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0",
                  idx === currentBannerIdx ? "opacity-100" : "opacity-0"
                )} 
              />
            ))}
          </div>
        ) : null}
        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
        
        <div className="relative z-10 space-y-2.5 max-w-xs">
          <h2 className="text-base font-black text-white leading-tight">{bannerTitle}</h2>
          <p className="text-[9.5px] font-semibold text-zinc-200 leading-normal">{bannerSubtitle}</p>
          <button 
            type="button"
            onClick={handleBannerButtonClick}
            className="px-4 py-2 rounded-lg text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm active:scale-95 transition-all select-none border-0 cursor-pointer"
            style={{ backgroundColor: colors.secundario }}
          >
            <span>{bannerButton.text}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile indicators */}
        {bannerUrls.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {bannerUrls.map((_, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setCurrentBannerIdx(idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all border-0 p-0 cursor-pointer",
                  idx === currentBannerIdx ? "bg-white w-3.5" : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  /* Mobile High-Conversion Editorial Hero */
  return (
    <div 
      id="catalog-banner-mobile" 
      className="relative p-5 rounded-2xl border text-left select-none shrink-0 shadow-xs space-y-3"
      style={{
        background: `radial-gradient(circle at top right, ${colors.primario}14 0%, transparent 70%), linear-gradient(135deg, #FFFFFF 0%, ${colors.fondo} 100%)`,
        borderColor: `${colors.primario}25`
      }}
    >
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border"
        style={{
          backgroundColor: `${colors.primario}12`,
          color: colors.primario,
          borderColor: `${colors.primario}30`
        }}
      >
        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span>{heroBadge || '⭐ 4.9/5 · Tienda Oficial'}</span>
      </div>

      <h2 className="text-xl font-black tracking-tight leading-tight" style={{ color: colors.texto }}>
        {bannerTitle || store.name || 'Calidad Superior Directo a tu Puerta'}
      </h2>

      <p className="text-[11px] font-medium text-zinc-600 leading-normal line-clamp-2">
        {bannerSubtitle || store.bio || 'Productos seleccionados con la mejor calidad y despacho asegurado.'}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button 
          type="button"
          onClick={handleBannerButtonClick}
          className="flex-1 py-2.5 px-4 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all select-none border-0 cursor-pointer"
          style={{ backgroundColor: colors.primario }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{bannerButton.text || 'Ver Catálogo'}</span>
        </button>

        {store.whatsapp && (
          <a
            href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${store.name}! 👋 Vengo de su tienda web y me gustaría recibir asesoría con mi pedido.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 no-underline"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  )
}
