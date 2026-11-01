'use client'

import React from 'react'
import {
  Globe,
  Zap,
  Info,
  Sparkles,
  Plus,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentSettingsState } from '../useAgentSettingsState'

interface TabConfiguracionProps {
  agent: AgentSettingsState
}

export function TabConfiguracion({ agent }: TabConfiguracionProps) {
  const {
    checkoutMode,
    setCheckoutMode,
    handleSaveSalesMode,
    flowId,
    setFlowId,
    saving,
    settings,
    setSettings
  } = agent

  return (
    <div className="space-y-5 animate-in">
      {/* Sales Mode Selector (Hero Card) */}
      <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">Modo de Cierre de Venta en WhatsApp</h3>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                checkoutMode === 'WHATSAPP_FLOW'
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                {checkoutMode === 'WHATSAPP_FLOW' ? '⚡ Flows 100% In-Chat' : '🌐 Asistente + Checkout Web'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Elige si tu cliente completa su pedido directamente dentro de WhatsApp o finaliza en tu link web.
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
                El bot asesora y envía un botón para abrir tu catálogo web móvil donde el comprador arma su carrito y paga seguro.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">Sin Meta Business API</span>
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
                El cliente abre una ventana modal dentro de WhatsApp. Elige productos, tallas y llena la entrega sin salir del chat.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100/70 text-purple-700">Cierre en 30s</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">Meta Cloud API</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Ideal Click-to-WA Ads</span>
            </div>
          </div>
        </div>

        {/* Meta Flow ID input when WhatsApp Flow is chosen */}
        {checkoutMode === 'WHATSAPP_FLOW' && (
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2.5 animate-in">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-zinc-800">Flow ID de Meta Cloud API (Opcional)</h5>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  FlashCheckout ya tiene un Flow maestro configurado. Si deseas usar tu propio Flow ID de Meta Business Manager, ingrésalo abajo:
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

      {/* System Prompt Card */}
      <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Instrucciones del sistema (System Prompt)</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Define la personalidad, tono y reglas que seguirá tu agente de IA al conversar con los clientes.
            </p>
          </div>
          <button className="flex items-center gap-1.5 h-7 px-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Consejos</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={8}
            value={settings.systemPrompt}
            onChange={e => setSettings(s => ({ ...s, systemPrompt: e.target.value.slice(0, 2000) }))}
            placeholder="Ej: Eres un asistente de ventas de una tienda de tecnología. Sé amable, responde de forma concisa..."
            className="w-full bg-white border border-zinc-200 rounded-lg p-4 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all leading-relaxed resize-none"
          />
          <div className="absolute bottom-3.5 right-4 text-[10px] font-bold text-zinc-450">
            {settings.systemPrompt.length} / 2000
          </div>
        </div>
      </div>

      {/* Welcome Message Card */}
      <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Mensaje de bienvenida</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Este es el mensaje inicial que recibirán los clientes nuevos al iniciar una conversación.
          </p>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={settings.welcomeMessage}
            onChange={e => setSettings(s => ({ ...s, welcomeMessage: e.target.value.slice(0, 500) }))}
            placeholder="Ej: ¡Hola! Bienvenido a nuestra tienda..."
            className="w-full bg-white border border-zinc-200 rounded-lg p-4 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all leading-relaxed resize-none"
          />
          <div className="absolute bottom-3.5 right-4 text-[10px] font-bold text-zinc-450">
            {settings.welcomeMessage.length} / 500
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>Agregar botón</span>
          </button>
          
          <button className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>Vista previa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
