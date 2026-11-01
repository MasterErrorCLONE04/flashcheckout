'use client'

import React from 'react'
import { ChevronRight, Lock, Truck, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'

export interface MobileSectionsProps {
  settings: CatalogResolvedSettings
  activeNavTab: string
}

export function MobileSections({
  settings,
  activeNavTab
}: MobileSectionsProps) {
  const {
    colors,
    sections,
    accordionSpecs,
    ingredientsSection,
    brandStory,
    processTimeline,
    lifestyleGallery,
    newsletterWidget,
    paymentMethods,
    testimonials,
    faqs,
    brandStoryPage
  } = settings

  return (
    <>
      {/* Accordion Specs (Mobile) */}
      {activeNavTab === 'Inicio' && sections.accordionSpecs && accordionSpecs && accordionSpecs.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-zinc-150 shrink-0 text-left pb-2">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Especificaciones</h3>
          <div className="space-y-2">
            {accordionSpecs.map((tab: { title: string; content: string }, idx: number) => (
              <details key={idx} className="group border border-zinc-150 rounded-xl bg-white overflow-hidden" open={idx === 0}>
                <summary className="w-full px-4 py-3 flex items-center justify-between font-bold text-xs bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-900 list-none [&::-webkit-details-marker]:hidden">
                  <span>{tab.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 py-3 border-t border-zinc-150 text-[11px] font-semibold leading-relaxed text-zinc-600 whitespace-pre-wrap">
                  {tab.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* 3-Column Ingredients Storytelling (Mobile) */}
      {activeNavTab === 'Inicio' && sections.ingredientsSection && ingredientsSection && (
        <div className="space-y-4 pt-4 border-t border-zinc-150 shrink-0 text-center select-none bg-white p-4 rounded-2xl border border-zinc-150 text-left">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">{ingredientsSection.title}</h3>
          <div className="flex justify-center my-3">
            <img 
              src={ingredientsSection.centerImageUrl} 
              alt="Ingredients" 
              className="max-h-[140px] object-contain" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <h4 className="font-extrabold text-[11px] text-zinc-900 leading-snug">{ingredientsSection.leftTitle}</h4>
              <p className="text-[9px] font-semibold text-zinc-500 leading-normal">{ingredientsSection.leftDesc}</p>
            </div>
            <div className="space-y-1 border-l border-zinc-150 pl-4">
              <h4 className="font-extrabold text-[11px] text-zinc-900 leading-snug">{ingredientsSection.rightTitle}</h4>
              <p className="text-[9px] font-semibold text-zinc-500 leading-normal">{ingredientsSection.rightDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Story (Mobile) */}
      {activeNavTab === 'Inicio' && sections.brandStory && brandStory && (
        <div id="brand-story-section-mobile" className="w-full shrink-0 select-none rounded-2xl overflow-hidden relative">
          <div className="relative h-[200px] w-full bg-zinc-900 flex items-center justify-center text-center p-6">
            {brandStory.bgUrl && (
              <img src={brandStory.bgUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-35 z-0" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10 z-0" />
            <div className="relative z-10 space-y-3 text-white">
              <h2 className="text-xs font-black tracking-tight">{brandStory.title}</h2>
              <p className="text-[9px] font-semibold text-zinc-200 leading-normal">{brandStory.desc}</p>
              {brandStory.btnText && (
                <button
                  type="button"
                  onClick={() => {
                    if (brandStory.btnLink) window.open(brandStory.btnLink, '_blank')
                  }}
                  className="px-4 py-1.5 rounded-lg font-bold text-[9px] border-0 cursor-pointer shadow-md"
                  style={{ backgroundColor: colors.primario, color: '#FFFFFF' }}
                >
                  {brandStory.btnText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proceso Timeline (Mobile) */}
      {activeNavTab === 'Inicio' && sections.processTimeline && processTimeline?.items && processTimeline.items.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-zinc-150 shrink-0 text-left">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{processTimeline.title}</h3>
          <div className="space-y-3">
            {processTimeline.items.map((stepItem: { step: string; title: string; desc: string }, idx: number) => (
              <div key={idx} className="flex gap-3 items-start bg-white p-2.5 border border-zinc-100 rounded-xl">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                  style={{ backgroundColor: `${colors.primario}12`, color: colors.primario }}
                >
                  {stepItem.step}
                </div>
                <div className="space-y-0.5 leading-none">
                  <h4 className="font-extrabold text-[11px] text-zinc-900 leading-snug">{stepItem.title}</h4>
                  <p className="text-[9px] font-semibold text-zinc-500 mt-1 leading-normal">{stepItem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Gallery (Mobile) */}
      {activeNavTab === 'Inicio' && sections.lifestyleGallery && lifestyleGallery && lifestyleGallery.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-zinc-150 shrink-0 text-left">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Estilo de Vida</h3>
          <div className="grid grid-cols-2 gap-2">
            {lifestyleGallery.map((imgUrl: string, idx: number) => (
              <div key={idx} className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/50">
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Banner Widget (Mobile) */}
      {activeNavTab === 'Inicio' && sections.newsletterWidget && newsletterWidget && (
        <div className="w-full shrink-0 select-none rounded-2xl overflow-hidden mt-4">
          <div 
            className="p-6 text-center flex flex-col items-center justify-center space-y-3"
            style={{ backgroundColor: newsletterWidget.bgColor, color: newsletterWidget.textColor }}
          >
            <div className="space-y-1">
              <h2 className="text-sm font-black tracking-tight">{newsletterWidget.title}</h2>
              <p className="text-[9px] opacity-85 leading-relaxed font-semibold">{newsletterWidget.subtitle}</p>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                toast.success("¡Te has unido al club correctamente! 🎁 Recibirás noticias pronto.")
              }}
              className="flex flex-col gap-2 w-full pt-1"
            >
              <input 
                type="email"
                required
                placeholder={newsletterWidget.placeholder}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[10px] font-semibold text-white outline-none focus:border-white focus:bg-white/15 placeholder:text-white/35"
              />
              <button 
                type="submit"
                className="w-full py-2 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer border-0 shadow-sm"
              >
                {newsletterWidget.btnText}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MÉTODOS DE PAGO Y SEGURIDAD (Mobile) */}
      {activeNavTab === 'Inicio' && sections.paymentMethods !== false && paymentMethods.enabled && (
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-left">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <h4 className="text-xs font-black text-zinc-900 uppercase">Compra 100% Segura</h4>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
            {paymentMethods.customNote || 'Aceptamos transferencias y pago contra entrega en Colombia.'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {paymentMethods.nequi && (
              <span className="px-2 py-1 bg-[#200020] text-white rounded text-[9px] font-black">Nequi</span>
            )}
            {paymentMethods.bancolombia && (
              <span className="px-2 py-1 bg-[#FDDA24] text-zinc-900 rounded text-[9px] font-black">Bancolombia</span>
            )}
            {paymentMethods.contraEntrega && (
              <span className="px-2 py-1 bg-emerald-700 text-white rounded text-[9px] font-black flex items-center gap-1">
                <Truck className="w-2.5 h-2.5" />
                <span>Contra Entrega</span>
              </span>
            )}
            {paymentMethods.pse && (
              <span className="px-2 py-1 bg-blue-900 text-white rounded text-[9px] font-black">PSE</span>
            )}
            {paymentMethods.tarjetas && (
              <span className="px-2 py-1 bg-white border border-zinc-200 text-zinc-800 rounded text-[9px] font-black">Tarjetas</span>
            )}
          </div>
        </div>
      )}

      {/* TESTIMONIOS (Mobile) */}
      {activeNavTab === 'Inicio' && sections.testimonials !== false && testimonials.enabled && testimonials.items && testimonials.items.length > 0 && (
        <div className="space-y-3 text-left pt-2 border-t border-zinc-150">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">Confianza</span>
              <h3 className="text-sm font-black text-zinc-900">{testimonials.title || 'Opiniones de clientes'}</h3>
            </div>
            <div className="flex text-amber-400 text-xs">
              {'★'.repeat(5)}
            </div>
          </div>

          <div className="space-y-2.5">
            {testimonials.items.slice(0, 2).map((testimonio: { name: string; city: string; stars: number; comment: string }, idx: number) => (
              <div key={idx} className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2">
                <p className="text-[11px] font-medium text-zinc-650 italic">
                  "{testimonio.comment}"
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px]">
                  <span className="font-bold text-zinc-900">{testimonio.name} ({testimonio.city})</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREGUNTAS FRECUENTES (Mobile) */}
      {activeNavTab === 'Inicio' && sections.faqs !== false && faqs.enabled && faqs.items && faqs.items.length > 0 && (
        <div className="space-y-3 text-left pt-2 border-t border-zinc-150">
          <h3 className="text-sm font-black text-zinc-900">{faqs.title || 'Preguntas Frecuentes'}</h3>
          <div className="space-y-2">
            {faqs.items.map((faq: { q: string; a: string }, idx: number) => (
              <details key={idx} className="group border border-zinc-200 rounded-xl bg-white overflow-hidden" open={idx === 0}>
                <summary className="w-full px-3.5 py-3 flex items-center justify-between font-bold text-[11px] bg-zinc-50/50 cursor-pointer text-zinc-900 list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-3.5 py-3 border-t border-zinc-150 text-[10.5px] font-medium leading-relaxed text-zinc-600 bg-white">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* DEDICATED ABOUT PAGE VIEW (MOBILE) */}
      {activeNavTab === 'Historia' && (
        <div className="space-y-8 select-none text-left animate-in fade-in duration-500 pb-12">
          {/* Page Header */}
          <div className="space-y-2 text-center pb-2 border-b border-zinc-150">
            <span className="text-[9px] font-bold tracking-widest text-[#C5A880] uppercase block">{brandStoryPage.headerTrayectoria}</span>
            <h2 className="text-xl font-black text-zinc-905 tracking-tight leading-none">{brandStoryPage.headerPerfil}</h2>
            <div className="w-10 h-0.5 bg-[#C5A880] mx-auto rounded-full mt-1.5" />
          </div>

          {/* Narrative */}
          <div className="space-y-4">
            <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
              {brandStoryPage.narrativeP1}
            </p>
            {brandStoryPage.imageHeritage && (
              <div className="rounded-2xl overflow-hidden shadow-sm h-48 border border-zinc-150">
                <img src={brandStoryPage.imageHeritage} alt="Heritage" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              {brandStoryPage.narrativeP2}
            </p>
          </div>

          {/* Two Pillars */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-905 tracking-tight uppercase">{brandStoryPage.pillarsTitle}</h3>
            <div className="space-y-3">
              <div className="bg-white border border-zinc-150 rounded-xl p-4 space-y-2">
                <h4 className="font-extrabold text-xs text-[#4A2E1B]">{brandStoryPage.pillar1Title}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">{brandStoryPage.pillar1Desc}</p>
              </div>
              <div className="bg-white border border-zinc-150 rounded-xl p-4 space-y-2">
                <h4 className="font-extrabold text-xs text-[#C5A880]">{brandStoryPage.pillar2Title}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">{brandStoryPage.pillar2Desc}</p>
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-905 tracking-tight uppercase">Liderazgo</h3>
            <div className="grid grid-cols-2 gap-3">
              {(brandStoryPage.leadership || [
                { name: 'Fawaz Al-Masri', role: 'Fundador & CEO', icon: '👨‍💼' },
                { name: 'Razan Al-Masri', role: 'Directora de Desarrollo (CBDO)', icon: '👩‍💼' },
                { name: 'Omar Al-Masri', role: 'Director de Operaciones (COO)', icon: '👨‍💻' },
                { name: 'Hazem Al-Masri', role: 'Gerente General', icon: '👨‍🔧' }
              ]).map((member: { name: string; role: string; icon: string }, idx: number) => (
                <div key={idx} className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-white border border-zinc-200/50 flex items-center justify-center text-lg mx-auto shadow-sm">{member.icon}</div>
                  <div>
                    <span className="font-extrabold text-[10px] text-zinc-900 block leading-tight">{member.name}</span>
                    <span className="text-[8px] font-bold text-zinc-400 block mt-0.5 uppercase tracking-wide">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-905 tracking-tight uppercase">Valores</h3>
            <div className="space-y-2.5">
              {(brandStoryPage.values || [
                { title: 'Razón & Pasión', desc: 'Equilibramos la toma de decisiones basada en datos científicos con la pasión por la repostería fina.' },
                { title: 'Tradición & Modernidad', desc: 'Respetamos el legado histórico del dátil del desierto mientras aplicamos tecnología de punta en empaque y producción.' },
                { title: 'Familia & Comunidad', desc: 'Operamos como una empresa familiar que apoya a los agricultores locales y cuida de sus empleados.' }
              ]).map((val: { title: string; desc: string }, idx: number) => (
                <div key={idx} className="p-3.5 border border-zinc-150 rounded-xl bg-white space-y-1 text-left">
                  <h4 className="font-extrabold text-[11px] text-[#4A2E1B]">{val.title}</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal font-semibold">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
