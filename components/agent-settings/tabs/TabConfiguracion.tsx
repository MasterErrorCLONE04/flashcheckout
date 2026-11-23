'use client'

import React from 'react'
import { Sparkles, Plus, Eye } from 'lucide-react'
import { AgentSettingsState } from '../useAgentSettingsState'

interface TabConfiguracionProps {
  agent: AgentSettingsState
}

export function TabConfiguracion({ agent }: TabConfiguracionProps) {
  const { settings, setSettings } = agent

  return (
    <div className="space-y-5 animate-in">
      {/* System Prompt Card */}
      <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-950">
              Instrucciones del Sistema (System Prompt)
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Define la personalidad, tono y reglas de venta que seguirá tu agente de IA al conversar con tus clientes en WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSettings(s => ({
                ...s,
                systemPrompt:
                  'Eres el asesor de ventas oficial de nuestra tienda en WhatsApp. Sé cálido, conciso y persuasivo. Responde dudas sobre tallas, stock y precios usando el catálogo activo, sugiere productos complementarios y guía siempre al cliente a completar su compra en 1 clic.',
              }))
            }
            className="flex items-center gap-1.5 h-8 px-3 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
            <span>Usar Prompt Recomendado</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={8}
            value={settings.systemPrompt}
            onChange={e =>
              setSettings(s => ({
                ...s,
                systemPrompt: e.target.value.slice(0, 2000),
              }))
            }
            placeholder="Ej: Eres un asistente de ventas experto. Sé amable, responde de forma concisa..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-all leading-relaxed resize-none"
          />
          <div className="absolute bottom-3.5 right-4 text-[10px] font-bold text-zinc-400">
            {settings.systemPrompt.length} / 2000
          </div>
        </div>
      </div>

      {/* Welcome Message Card */}
      <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-950">
            Mensaje de Bienvenida en WhatsApp
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Este es el primer mensaje automático que recibirán los clientes nuevos al escribirte por primera vez.
          </p>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={settings.welcomeMessage}
            onChange={e =>
              setSettings(s => ({
                ...s,
                welcomeMessage: e.target.value.slice(0, 500),
              }))
            }
            placeholder="Ej: ¡Hola! Bienvenido a nuestra tienda..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-all leading-relaxed resize-none"
          />
          <div className="absolute bottom-3.5 right-4 text-[10px] font-bold text-zinc-400">
            {settings.welcomeMessage.length} / 500
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              setSettings(s => ({
                ...s,
                welcomeMessage: `${s.welcomeMessage.trim()} 👇 Toca el botón de abajo para ver nuestro catálogo actualizado:`,
              }))
            }
            className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span>Insertar llamado al catálogo</span>
          </button>

          <button
            type="button"
            onClick={() =>
              agent.handlePreviewInSimulator(
                settings.welcomeMessage,
                'Mensaje de Bienvenida'
              )
            }
            className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>Simular en Teléfono</span>
          </button>
        </div>
      </div>
    </div>
  )
}
