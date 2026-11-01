'use client'

import React from 'react'
import { Sparkles, ChevronRight, ChevronLeft, ShoppingCart, MessageCircle, Zap, ShieldCheck, CreditCard } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Store } from '../types'

export interface CatalogDesktopHeroProps {
  heroType: string
  bannerUrls: string[]
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

export function CatalogDesktopHero({
  heroType,
  bannerUrls,
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
  store
}: CatalogDesktopHeroProps) {
  if (heroType === 'video' || bannerUrls.length > 0) {
    return (
      <div id="catalog-banner" className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
        {heroStyle === 'split-hero' ? (
          <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 lg:p-10 bg-white border border-zinc-200/80 overflow-hidden", radiusCard, shadowCard)}>
            <div className="md:col-span-6 space-y-4 text-left">
              {heroBadge && (
                <span 
                  className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider", radiusBadge)}
                  style={{ backgroundColor: `${colors.primario}18`, color: colors.primario }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {heroBadge}
                </span>
              )}
              <h2 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight" style={{ color: colors.texto }}>{bannerTitle}</h2>
              <p className="text-xs xl:text-sm font-medium leading-relaxed max-w-md text-zinc-500">{bannerSubtitle}</p>
              <div className="pt-2">
                <button 
                  onClick={handleBannerButtonClick}
                  className={cn("px-6 py-3 text-white font-extrabold text-xs xl:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all border-0 cursor-pointer", radiusButton)}
                  style={{ backgroundColor: colors.secundario || colors.primario }}
                >
                  <span>{bannerButton.text}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={cn("md:col-span-6 relative h-[320px] overflow-hidden bg-zinc-100", radiusCard)}>
              {heroType === 'video' && heroVideoUrl ? (
                <video src={heroVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : bannerUrls.length > 0 ? (
                <img src={bannerUrls[currentBannerIdx] || bannerUrls[0]} alt="Banner" className="w-full h-full object-cover" />
              ) : null}
            </div>
          </div>
        ) : (
          <div className={cn(
            "relative w-full overflow-hidden flex items-center px-10 xl:px-14 text-left select-none group bg-zinc-950",
            heroStyle === 'minimal-banner' ? "h-[250px]" : "h-[350px]",
            radiusCard,
            shadowCard
          )}>
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
            {/* Gradient Overlay for high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 z-0 pointer-events-none" />
            
            <div className="relative z-10 space-y-3.5 max-w-xl">
              {heroBadge && (
                <span 
                  className={cn("inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-md bg-white/20 border border-white/30", radiusBadge)}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {heroBadge}
                </span>
              )}
              <h2 className="text-2xl xl:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">{bannerTitle}</h2>
              <p className="text-xs xl:text-sm font-semibold text-zinc-100 leading-normal drop-shadow max-w-lg">{bannerSubtitle}</p>
              <div className="pt-1">
                <button 
                  onClick={handleBannerButtonClick}
                  className={cn("px-6 py-3 text-white font-extrabold text-xs xl:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all border-0 cursor-pointer", radiusButton)}
                  style={{ backgroundColor: colors.secundario || colors.primario }}
                >
                  <span>{bannerButton.text}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Indicators */}
            {bannerUrls.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentBannerIdx(prev => (prev === 0 ? bannerUrls.length - 1 : prev - 1))}
                  className="absolute left-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentBannerIdx(prev => (prev + 1) % bannerUrls.length)}
                  className="absolute right-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center border-0 cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {bannerUrls.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={cn(
                        "h-1.5 rounded-full transition-all border-0 p-0 cursor-pointer",
                        idx === currentBannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  /* HERO EDITORIAL DE ALTA CONVERSIÓN (Cuando aún no han subido imagen de banner) */
  return (
    <div id="catalog-banner" className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
      <div 
        className={cn(
          "relative w-full overflow-hidden p-8 md:p-12 lg:p-14 border text-left select-none",
          radiusCard,
          shadowCard
        )}
        style={{
          background: `radial-gradient(circle at top right, ${colors.primario}14 0%, transparent 65%), linear-gradient(135deg, #FFFFFF 0%, ${colors.fondo} 100%)`,
          borderColor: `${colors.primario}25`
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs border"
            style={{
              backgroundColor: `${colors.primario}12`,
              color: colors.primario,
              borderColor: `${colors.primario}30`
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{heroBadge || '⭐ 4.9/5 · Tienda Oficial · Despacho Prioritario'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.12]" style={{ color: colors.texto }}>
            {bannerTitle || store.name || 'Calidad Superior Directo a tu Puerta'}
          </h1>

          <p className="text-xs md:text-sm font-medium text-zinc-600 leading-relaxed max-w-xl">
            {bannerSubtitle || store.bio || 'Descubre nuestra selección exclusiva con garantía directa de satisfacción, asesoría inmediata y envíos seguros a toda Colombia.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleBannerButtonClick}
              className={cn("px-6 py-3.5 text-white font-extrabold text-xs md:text-sm flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all border-0 cursor-pointer", radiusButton)}
              style={{ backgroundColor: colors.primario }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{bannerButton.text || 'Explorar Catálogo'}</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>

            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${store.name}! 👋 Vengo de su tienda web y me gustaría recibir asesoría con mi pedido.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all no-underline", radiusButton)}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Comprar por WhatsApp</span>
              </a>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200/70 flex flex-wrap items-center gap-6 text-[11px] font-bold text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Despacho Rápido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantía de Satisfacción</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Pago Seguro / Contra Entrega</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
