'use client'

import React from 'react'
import {
  Globe,
  Zap,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentSettingsState } from '../useAgentSettingsState'

interface TabModoCierreProps {
  agent: AgentSettingsState
}

export function TabModoCierre({ agent }: TabModoCierreProps) {
  const {
    checkoutMode,
    setCheckoutMode,
    handleSaveSalesMode,
    flowId,
    setFlowId,
    saving
  } = agent

  return (
    <div className="space-y-5 animate-in">
      {/* Sales Mode Selector */}
      <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">Estrategia de Cierre de Venta</h3>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                checkoutMode === 'WHATSAPP_FLOW'
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                {checkoutMode === 'WHATSAPP_FLOW' ? '⚡ Modo Flows Nativo Activo' : '🌐 Modo Checkout Web Activo'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Selecciona la experiencia de compra que prefieras para tus clientes en WhatsApp. Puedes cambiarla cuando desees.
            </p>
          </div>
        </div>

        {/* 2 Opciones en Cards interactivas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Opción 1: Agente + Web Checkout */}
          <div
            onClick={() => {
              setCheckoutMode('WEB_CHECKOUT')
              handleSaveSalesMode('WEB_CHECKOUT')
            }}
            className={cn(
              "relative p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3",
              checkoutMode === 'WEB_CHECKOUT'
                ? "border-emerald-500 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-500/20"
                : "border-zinc-200 hover:border-zinc-300 bg-white"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                    checkoutMode === 'WEB_CHECKOUT'
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  )}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Agente + Checkout Web</h4>
                    <span className="text-[10px] text-emerald-600 font-semibold block leading-tight">Recomendado · Sin costo Meta</span>
                  </div>
                </div>
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                  checkoutMode === 'WEB_CHECKOUT' ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 bg-white"
                )}>
                  {checkoutMode === 'WEB_CHECKOUT' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <p className="text-[11px] text-zinc-600 leading-relaxed">
                El bot conversa y atiende preguntas en WhatsApp. Cuando el cliente desea pedir, envía un botón hacia tu checkout web optimizado para celular.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">Sin registro en Meta</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">Costo Meta: $0</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-700">Activación en 2 min</span>
            </div>
          </div>

          {/* Opción 2: WhatsApp Flows Nativo */}
          <div
            onClick={() => {
              setCheckoutMode('WHATSAPP_FLOW')
              handleSaveSalesMode('WHATSAPP_FLOW')
            }}
            className={cn(
              "relative p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3",
              checkoutMode === 'WHATSAPP_FLOW'
                ? "border-purple-500 bg-purple-50/20 shadow-xs ring-1 ring-purple-500/20"
                : "border-zinc-200 hover:border-zinc-300 bg-white"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                    checkoutMode === 'WHATSAPP_FLOW'
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  )}>
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">WhatsApp Flows Nativo</h4>
                    <span className="text-[10px] text-purple-600 font-semibold block leading-tight">⚡ 100% In-Chat · Alta Conversión</span>
                  </div>
                </div>
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                  checkoutMode === 'WHATSAPP_FLOW' ? "border-purple-500 bg-purple-500 text-white" : "border-zinc-300 bg-white"
                )}>
                  {checkoutMode === 'WHATSAPP_FLOW' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <p className="text-[11px] text-zinc-600 leading-relaxed">
                El comprador abre una ventana modal nativa de WhatsApp. Selecciona productos, cantidades y llena sus datos sin salir de la app de WhatsApp.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100/70 text-purple-700">Cierre en 30s</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">Meta Cloud API</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Ideal Click-to-WA Ads</span>
            </div>
          </div>
        </div>

        {/* Meta Flow ID input */}
        {checkoutMode === 'WHATSAPP_FLOW' && (
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2.5 animate-in">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-zinc-800">Flow ID de Meta Cloud API (Opcional)</h5>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  FlashCheckout ya incluye un Flow predeterminado de catálogo y checkout. Si tienes tu propio Flow ID registrado en Meta Business Manager, ingrésalo aquí:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={flowId}
                onChange={e => setFlowId(e.target.value)}
                placeholder="Ej: 789456123456789 (o deja en blanco para usar el de FlashCheckout)"
                className="flex-1 bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs font-mono text-zinc-800 outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSaveSalesMode('WHATSAPP_FLOW', flowId)}
                disabled={saving}
                className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
              >
                Guardar ID
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guía Comparativa */}
      <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
        <h3 className="text-sm font-bold text-zinc-900">¿Cuál modo es el indicado para tu negocio?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Elige Checkout Web si:</span>
            </h4>
            <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4">
              <li>Estás empezando y vendes de forma orgánica por Instagram, TikTok o boca a boca.</li>
              <li>No tienes cuenta comercial verificada de Meta ni quieres incurrir en costos por mensaje de Meta API.</li>
              <li>Deseas que tus clientes exploren un catálogo visual rico con fotos grandes y filtros.</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50/40 border border-purple-200/80 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Elige WhatsApp Flows si:</span>
            </h4>
            <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4">
              <li>Inviertes en pauta con anuncios *Click-to-WhatsApp* en Facebook e Instagram.</li>
              <li>Buscas la máxima tasa de conversión: el cliente compra en 30 segundos sin cambiar de app.</li>
              <li>Cuentas con WhatsApp Business Platform (Cloud API) conectada a FlashCheckout.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
