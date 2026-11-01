'use client'

import React from 'react'
import { Truck, Award, Tag, ChevronRight, Lock, Zap, Check, HelpCircle } from 'lucide-react'
import { SiVisa, SiMastercard } from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { IconMap, CatalogIconName } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'

export interface CatalogDesktopHomeSectionsProps {
  settings: CatalogResolvedSettings
  total: number
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}

export function CatalogDesktopHomeSections({
  settings,
  total,
  selectedCategory,
  setSelectedCategory
}: CatalogDesktopHomeSectionsProps) {
  const {
    colors,
    radiusCard,
    freeShipping,
    sections,
    benefits,
    visualCategories,
    bentoHighlights,
    ingredientsSection
  } = settings

  return (
    <>
      {/* BARRA DE ENVÍO GRATIS DINÁMICA (Desktop) */}
      {freeShipping?.enabled && (
        <div className="max-w-[1300px] mx-auto w-full px-6 pt-3 pb-1 shrink-0">
          <div className={cn(
            "p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left",
            radiusCard,
            total >= (freeShipping.threshold || 100000)
              ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
              : "bg-white border-zinc-200/90 shadow-xs text-zinc-800"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                total >= (freeShipping.threshold || 100000) ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
              )}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black block leading-snug">
                  {total >= (freeShipping.threshold || 100000)
                    ? "🎉 ¡Felicidades! Tienes ENVÍO GRATIS asegurado en tu orden."
                    : `¡Agrega $${((freeShipping.threshold || 100000) - total).toLocaleString('es-CO')} más para desbloquear ENVÍO GRATIS! 🚀`
                  }
                </span>
                <span className={cn("text-[10px] font-semibold", total >= (freeShipping.threshold || 100000) ? "text-emerald-100" : "text-zinc-400")}>
                  Despacho prioritario con guía de rastreo directa por WhatsApp
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:w-48 shrink-0">
              <div className={cn("w-full h-2 rounded-full overflow-hidden", total >= (freeShipping.threshold || 100000) ? "bg-white/30" : "bg-zinc-100")}>
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", total >= (freeShipping.threshold || 100000) ? "bg-white" : "bg-emerald-500")}
                  style={{ width: `${Math.min(100, (total / (freeShipping.threshold || 100000)) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-black tabular-nums">{Math.min(100, Math.round((total / (freeShipping.threshold || 100000)) * 100))}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Beneficios (Desktop) */}
      {sections.beneficios && benefits?.items && benefits.items.length > 0 && (
        <div className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
          <div className="bg-white border border-zinc-150 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-4">
            {benefits.items.map((item: { icon: CatalogIconName; label: string; desc: string }, idx: number) => {
              const ItemIcon = IconMap[item.icon] || Award
              return (
                <div key={idx} className="flex items-center gap-3.5 p-1.5 text-left select-none">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors.secundario}12`, color: colors.secundario }}
                  >
                    <ItemIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-900 block leading-none">{item.label}</span>
                    <span className="text-[10px] font-semibold text-zinc-400 mt-1.5 block leading-none">{item.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Categorías Visuales (Desktop) */}
      {sections.visualCategories && visualCategories && visualCategories.length > 0 && (
        <div className="max-w-[1300px] mx-auto w-full px-6 pt-6 pb-2 shrink-0 select-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {visualCategories.map((catItem: { category: string; imageUrl: string }, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedCategory(catItem.category)}
                className={cn(
                  "bg-white border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:border-zinc-350 hover:shadow-md active:scale-[0.98]",
                  selectedCategory === catItem.category ? "border-emerald-600 ring-2 ring-emerald-500/10" : "border-zinc-150"
                )}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                  {catItem.imageUrl ? (
                    <img src={catItem.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <span className="text-xs font-black text-zinc-800 tracking-tight leading-tight">{catItem.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bento Grid Highlights (Desktop) */}
      {sections.bentoHighlights && bentoHighlights?.items && bentoHighlights.items.length > 0 && (
        <div className="max-w-[1300px] mx-auto w-full px-6 pt-4 pb-2 shrink-0">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-left mb-3">{bentoHighlights.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bentoHighlights.items.map((item: { emoji: string; title: string; desc: string }, idx: number) => (
              <div key={idx} className="bg-white border border-zinc-150 rounded-2xl p-5 text-left flex flex-col justify-between hover:border-zinc-300 transition-all select-none">
                <div className="text-3xl mb-3">{item.emoji || '✨'}</div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 leading-snug">{item.title}</h4>
                  <p className="text-xs font-semibold text-zinc-500 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Column Ingredients Storytelling (Desktop) */}
      {sections.ingredientsSection && ingredientsSection && (
        <div className="max-w-[1300px] mx-auto w-full px-6 pt-6 pb-2 shrink-0 select-none text-center">
          <div className="bg-white border border-zinc-150 rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-8">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{ingredientsSection.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Columna Izquierda */}
              <div className="text-right space-y-3">
                <h4 className="font-extrabold text-sm text-zinc-900">{ingredientsSection.leftTitle}</h4>
                <p className="text-xs font-semibold text-zinc-500 leading-relaxed">{ingredientsSection.leftDesc}</p>
              </div>
              {/* Columna Central (Imagen) */}
              <div className="flex justify-center">
                <img 
                  src={ingredientsSection.centerImageUrl} 
                  alt="Center Ingredients" 
                  className="max-h-[220px] object-contain hover:rotate-3 transition-transform duration-500" 
                />
              </div>
              {/* Columna Derecha */}
              <div className="text-left space-y-3">
                <h4 className="font-extrabold text-sm text-zinc-900">{ingredientsSection.rightTitle}</h4>
                <p className="text-xs font-semibold text-zinc-500 leading-relaxed">{ingredientsSection.rightDesc}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function CatalogDesktopHomeBottomSections({
  settings
}: {
  settings: CatalogResolvedSettings
}) {
  const {
    colors,
    radiusCard,
    sections,
    accordionSpecs,
    brandStory,
    processTimeline,
    lifestyleGallery,
    newsletterWidget,
    paymentMethods,
    testimonials,
    faqs
  } = settings

  return (
    <div className="max-w-[1300px] mx-auto w-full px-6 pb-20">
      {/* Accordion Specs (Desktop) */}
      {sections.accordionSpecs && accordionSpecs && accordionSpecs.length > 0 && (
        <div className="mt-12 border-t border-zinc-150 pt-8 w-full">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-left mb-6">Especificaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {accordionSpecs.map((tab: { title: string; content: string }, idx: number) => (
              <details key={idx} className="group border border-zinc-150 rounded-xl bg-white overflow-hidden" open={idx === 0}>
                <summary className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-905 list-none [&::-webkit-details-marker]:hidden">
                  <span>{tab.title}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 py-4 border-t border-zinc-150 text-xs font-semibold leading-relaxed text-zinc-600 whitespace-pre-wrap">
                  {tab.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Brand Story (Desktop) */}
      {sections.brandStory && brandStory && (
        <div id="brand-story-section" className="w-full pt-10 shrink-0 select-none">
          <div className="relative h-[280px] w-full bg-zinc-900 rounded-3xl flex items-center justify-center text-center p-8 overflow-hidden">
            {brandStory.bgUrl && (
              <img src={brandStory.bgUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-35 z-0" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 z-0" />
            <div className="relative z-10 space-y-4 max-w-xl text-white">
              <h2 className="text-xl xl:text-2xl font-black tracking-tight">{brandStory.title}</h2>
              <p className="text-xs font-semibold text-zinc-200 leading-relaxed">{brandStory.desc}</p>
              {brandStory.btnText && (
                <button
                  onClick={() => {
                    if (brandStory.btnLink) window.open(brandStory.btnLink, '_blank')
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs border-0 cursor-pointer shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: colors.primario, color: '#FFFFFF' }}
                >
                  {brandStory.btnText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proceso Timeline (Desktop) */}
      {sections.processTimeline && processTimeline?.items && processTimeline.items.length > 0 && (
        <div className="mt-12 border-t border-zinc-150 pt-8 w-full select-none text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">{processTimeline.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {processTimeline.items.map((stepItem: { step: string; title: string; desc: string }, idx: number) => (
              <div key={idx} className="flex gap-4 items-start relative z-10 bg-white p-2">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                  style={{ backgroundColor: `${colors.primario}12`, color: colors.primario }}
                >
                  {stepItem.step}
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-zinc-900 leading-snug">{stepItem.title}</h4>
                  <p className="text-[11px] font-semibold text-zinc-500 leading-normal">{stepItem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Gallery (Desktop) */}
      {sections.lifestyleGallery && lifestyleGallery && lifestyleGallery.length > 0 && (
        <div className="mt-12 border-t border-zinc-150 pt-8 w-full select-none text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">Estilo de Vida</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lifestyleGallery.map((imgUrl: string, idx: number) => (
              <div key={idx} className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 group border border-zinc-200/50">
                <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Banner Widget (Desktop) */}
      {sections.newsletterWidget && newsletterWidget && (
        <div className="mt-12 w-full select-none rounded-3xl overflow-hidden relative">
          <div 
            className="p-10 text-center flex flex-col items-center justify-center space-y-4"
            style={{ backgroundColor: newsletterWidget.bgColor, color: newsletterWidget.textColor }}
          >
            <div className="max-w-xl space-y-2">
              <h2 className="text-lg font-black tracking-tight">{newsletterWidget.title}</h2>
              <p className="text-xs opacity-85 leading-relaxed font-semibold">{newsletterWidget.subtitle}</p>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                toast.success("¡Te has unido al club correctamente! 🎁 Recibirás noticias pronto.")
              }}
              className="flex gap-2 max-w-md w-full pt-1"
            >
              <input 
                type="email"
                required
                placeholder={newsletterWidget.placeholder}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-semibold text-white outline-none focus:border-white focus:bg-white/15 placeholder:text-white/40"
              />
              <button 
                type="submit"
                className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer border-0 shrink-0 shadow-sm"
              >
                {newsletterWidget.btnText}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MÉTODOS DE PAGO Y SEGURIDAD (Desktop) */}
      {sections.paymentMethods !== false && paymentMethods.enabled && (
        <div className="mt-14 w-full select-none text-left">
          <div className={cn("p-6 sm:p-8 bg-zinc-50 border border-zinc-200/90", radiusCard)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Compra 100% Protegida & Segura</h3>
                </div>
                <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                  {paymentMethods.customNote || 'Aceptamos los métodos de pago más confiables de Colombia. Confirmación en segundos por WhatsApp.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {paymentMethods.nequi && (
                  <div className="px-3 py-1.5 bg-[#200020] text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF007A]" />
                    <span>Nequi</span>
                  </div>
                )}
                {paymentMethods.bancolombia && (
                  <div className="px-3 py-1.5 bg-[#FDDA24] text-zinc-900 rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-900" />
                    <span>Bancolombia</span>
                  </div>
                )}
                {paymentMethods.contraEntrega && (
                  <div className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Contra Entrega</span>
                  </div>
                )}
                {paymentMethods.pse && (
                  <div className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>PSE</span>
                  </div>
                )}
                {paymentMethods.tarjetas && (
                  <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-xs">
                    <SiVisa className="h-4 w-auto text-[#1A1F71]" />
                    <SiMastercard className="h-4 w-auto text-[#EB001B]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TESTIMONIOS Y SOCIAL PROOF (Desktop) */}
      {sections.testimonials !== false && testimonials.enabled && testimonials.items && testimonials.items.length > 0 && (
        <div className="mt-14 w-full select-none text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Confianza comprobada</span>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">{testimonials.title || 'Lo que dicen nuestros clientes'}</h3>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">{testimonials.subtitle || 'Compradores reales que confían en nosotros día a día'}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-zinc-800 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full shrink-0">
              <span className="text-amber-500">★★★★★</span>
              <span>4.9 / 5.0 Promedio</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.items.map((testimonio: { name: string; city: string; stars: number; comment: string }, idx: number) => (
              <div 
                key={idx}
                className={cn("p-5 bg-white border border-zinc-200/80 flex flex-col justify-between space-y-4 shadow-xs", radiusCard)}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 text-sm leading-none">
                      {'★'.repeat(testimonio.stars || 5)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Verificado</span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-650 leading-relaxed italic">
                    "{testimonio.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0"
                    style={{ backgroundColor: colors.primario }}
                  >
                    {testimonio.name ? testimonio.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-zinc-900 block">{testimonio.name}</span>
                    <span className="text-[10px] font-semibold text-zinc-400">{testimonio.city || 'Colombia'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREGUNTAS FRECUENTES FAQ (Desktop) */}
      {sections.faqs !== false && faqs.enabled && faqs.items && faqs.items.length > 0 && (
        <div className="mt-14 w-full select-none text-left">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Resolvemos tus dudas</span>
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">{faqs.title || 'Preguntas Frecuentes'}</h3>
            <p className="text-xs font-medium text-zinc-500">Todo lo que necesitas saber antes de completar tu pedido</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.items.map((faq: { q: string; a: string }, idx: number) => (
              <details key={idx} className="group border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-2xs" open={idx === 0}>
                <summary className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs bg-zinc-50/40 hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-900 list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90 shrink-0 ml-2" />
                </summary>
                <div className="px-5 py-4 border-t border-zinc-150 text-xs font-semibold leading-relaxed text-zinc-600 whitespace-pre-wrap bg-white">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
