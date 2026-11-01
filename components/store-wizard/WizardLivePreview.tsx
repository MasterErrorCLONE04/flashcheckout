'use client'

import React from 'react'
import {
  Store,
  ChevronLeft,
  MoreHorizontal,
  CheckCircle2,
  CheckCheck,
  ShoppingBag,
  Zap,
  Send,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreWizardState } from './useStoreWizardState'

interface WizardLivePreviewProps {
  wizard: StoreWizardState
}

export function WizardLivePreview({ wizard }: WizardLivePreviewProps) {
  const {
    previewTab,
    setPreviewTab,
    storeDisplayName,
    storeDisplaySlug,
    currentStep,
    currentStepData,
    preferences,
    primaryProduct,
    payments,
    addedProducts
  } = wizard

  return (
    <div className="hidden lg:flex flex-1 lg:w-[46%] xl:w-[48%] bg-[#F8F9FA] p-6 xl:p-8 flex-col justify-between items-center relative overflow-hidden select-none">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-zinc-950/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Preview Status Bar */}
      <div className="w-full max-w-[340px] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-zinc-900 tracking-tight">
            Vista previa en tiempo real
          </span>
        </div>

        {/* Device Switcher Pills */}
        <div className="flex items-center gap-1 bg-white border border-zinc-200/80 rounded-full p-1 shadow-2xs">
          <button
            onClick={() => setPreviewTab('chat')}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
              previewTab === 'chat' 
                ? "bg-zinc-950 text-white shadow-xs" 
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            WhatsApp Nova
          </button>
          <button
            onClick={() => setPreviewTab('catalog')}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
              previewTab === 'catalog' 
                ? "bg-zinc-950 text-white shadow-xs" 
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            Catálogo Web
          </button>
        </div>
      </div>

      {/* SMARTPHONE DEVICE FRAME */}
      <div className="my-auto w-[310px] xl:w-[325px] aspect-[9/18.5] bg-zinc-950 rounded-[44px] p-2.5 shadow-2xl border-4 border-zinc-800/80 relative flex flex-col overflow-hidden z-10 transition-all duration-300">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ml-auto mr-1" />
        </div>

        {/* Screen Inner Display */}
        <div className="w-full h-full bg-[#EFEAE2] rounded-[36px] overflow-hidden flex flex-col relative text-left">
          {/* WhatsApp App Header */}
          <div className="bg-[#075E54] pt-7 pb-2.5 px-3 text-white flex items-center justify-between shrink-0 shadow-sm z-20">
            <div className="flex items-center gap-1.5 min-w-0">
              <ChevronLeft className="w-4 h-4 text-white shrink-0" />
              <div className="w-7 h-7 rounded-full bg-white/20 p-0.5 flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                <img src="/nova_robot_mascot.png" alt="Nova" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold leading-none truncate max-w-[130px]">
                    Nova • {storeDisplayName}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-[#25D366] fill-white stroke-[2px] shrink-0" />
                </div>
                <span className="text-[8px] text-emerald-100 block mt-0.5 leading-none">
                  en línea
                </span>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-white/80 shrink-0" />
          </div>

          {/* VIEW 1: WHATSAPP CHAT FLOW */}
          {previewTab === 'chat' && (
            <>
              <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar flex flex-col justify-end text-[10px]">
                {/* Date Pill */}
                <div className="self-center bg-white/80 backdrop-blur-xs text-zinc-600 px-2.5 py-0.5 rounded-full text-[8px] font-bold shadow-2xs border border-zinc-200/50">
                  HOY
                </div>

                {/* Message 1: Buyer */}
                <div className="bg-[#E1F3D4] self-end rounded-xl rounded-tr-xs p-2 max-w-[85%] text-zinc-900 shadow-2xs">
                  <p className="leading-snug">Hola, buenas tardes 👋 ¿Tienen catálogo disponible?</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-zinc-400">
                    <span>10:41 AM</span>
                    <CheckCheck className="w-3 h-3 text-[#34B7F1]" />
                  </div>
                </div>

                {/* Message 2: Nova Welcome + Store Link */}
                <div className="bg-white self-start rounded-xl rounded-tl-xs p-2.5 max-w-[88%] text-zinc-900 shadow-2xs space-y-2 border border-zinc-200/40">
                  <p className="leading-snug">
                    {currentStep >= 6 && preferences.welcomeMessage ? (
                      preferences.welcomeMessage
                    ) : (
                      <>¡Hola! Te damos la bienvenida a <strong>{storeDisplayName}</strong> ✨ ¿Qué producto te gustaría conocer hoy?</>
                    )}
                  </p>

                  {/* Store Link Card */}
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-2 flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#075E54] rounded-md flex items-center justify-center text-white shrink-0">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[9px] font-bold text-zinc-900 leading-none truncate">
                        {storeDisplayName}
                      </h5>
                      <span className="text-[8px] text-zinc-400 truncate block mt-0.5">
                        flash.checkout/tienda/{storeDisplaySlug}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-[8px] text-zinc-400">
                    <span>10:41 AM</span>
                  </div>
                </div>

                {/* Message 3: Buyer asks for product */}
                <div className="bg-[#E1F3D4] self-end rounded-xl rounded-tr-xs p-2 max-w-[85%] text-zinc-900 shadow-2xs">
                  <p className="leading-snug">
                    {primaryProduct ? `Me interesa ${primaryProduct.name}` : 'Quiero ver sus productos estrella.'}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-zinc-400">
                    <span>10:42 AM</span>
                    <CheckCheck className="w-3 h-3 text-[#34B7F1]" />
                  </div>
                </div>

                {/* Message 4: Nova Interactive Product Card */}
                <div className="bg-white self-start rounded-xl rounded-tl-xs p-2.5 max-w-[88%] text-zinc-900 shadow-2xs space-y-2 border border-zinc-200/40">
                  <p className="leading-snug">
                    ¡Excelente elección! 🌸 Lo tenemos disponible para entrega inmediata:
                  </p>

                  {/* Interactive Product Card */}
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      {primaryProduct?.imageUrl ? (
                        <img 
                          src={primaryProduct.imageUrl} 
                          alt="Producto" 
                          className="w-10 h-10 rounded-lg object-cover border shrink-0 bg-white" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h6 className="text-[9px] font-bold text-zinc-900 leading-tight truncate">
                          {primaryProduct?.name || 'Vestido Floral Rojo (Talla M)'}
                        </h6>
                        <p className="text-[9px] font-extrabold text-emerald-600 mt-0.5">
                          ${(primaryProduct?.price || 25000).toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </div>

                    {/* Payment CTA Button */}
                    <div className="w-full bg-[#059669] text-white font-bold text-[8.5px] rounded-lg py-1.5 flex items-center justify-center gap-1 shadow-2xs">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>Pagar con Smart Pay</span>
                    </div>
                  </div>

                  {/* Payment Methods Indicator */}
                  <div className="flex items-center justify-between text-[7.5px] text-zinc-400 font-semibold pt-0.5">
                    <span>{payments.manual ? '✓ Nequi / Daviplata' : ''} {payments.mercadopago ? '✓ Mercado Pago' : ''}</span>
                    <span>10:42 AM</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Input Bar */}
              <div className="p-2 bg-[#F0F2F5] border-t border-zinc-200 flex items-center gap-1.5 shrink-0 select-none">
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center justify-between border border-zinc-200/60 min-w-0">
                  <span className="text-[8.5px] text-zinc-400 font-medium truncate">Escribe un mensaje...</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Send className="w-2.5 h-2.5" />
                </div>
              </div>
            </>
          )}

          {/* VIEW 2: WEB STORE CATALOG PREVIEW */}
          {previewTab === 'catalog' && (
            <div className="flex-1 bg-white p-3 overflow-y-auto custom-scrollbar flex flex-col justify-start space-y-3">
              <div className="text-center py-2 border-b border-zinc-100">
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-400 block">Tienda Oficial</span>
                <h4 className="text-xs font-bold text-zinc-900">{storeDisplayName}</h4>
                <span className="text-[8px] text-emerald-600 font-bold">● Abierto ahora</span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-900 block">Productos destacados:</span>
                
                {addedProducts.length === 0 ? (
                  <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center text-zinc-400 text-[9px]">
                    Añade productos en el paso 4 para verlos aquí
                  </div>
                ) : (
                  addedProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                      <div className="flex items-center gap-2">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-7 h-7 rounded-md object-cover border" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center text-zinc-400">
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h6 className="text-[8.5px] font-bold text-zinc-900 truncate max-w-[110px]">{p.name}</h6>
                          <span className="text-[8px] text-emerald-600 font-bold">${p.price?.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                      <span className="bg-zinc-950 text-white text-[7.5px] font-bold px-2 py-0.5 rounded">Comprar</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Context Pill */}
      <div className="w-full max-w-[340px] p-3 bg-white border border-zinc-200/80 rounded-2xl flex items-center gap-3 shadow-2xs z-10">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h5 className="text-[11px] font-bold text-zinc-950 leading-tight">
            {currentStepData.label}
          </h5>
          <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
            {currentStepData.desc}
          </p>
        </div>
      </div>
    </div>
  )
}
