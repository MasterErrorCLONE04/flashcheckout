'use client'

import React from 'react'
import {
  Settings,
  Package,
  MessageSquare,
  Sliders,
  Link as LinkIcon,
  Zap,
  Check,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentSettingsState } from './useAgentSettingsState'

interface AgentHeaderProps {
  agent: AgentSettingsState
}

export function AgentHeader({ agent }: AgentHeaderProps) {
  const {
    settings,
    setSettings,
    activeTab,
    setActiveTab,
    saving,
    checkoutMode,
    handleSaveBehavior,
    handleSavePrompts
  } = agent

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Agente de WhatsApp</h1>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors",
              settings.active 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            )}>
              {settings.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500 mt-1">
            Configura tu asistente con inteligencia artificial para atender, asesorar y crear carritos automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700">Agente activo</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.active}
                onChange={e => setSettings(s => ({ ...s, active: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <button
            onClick={activeTab === 'comportamiento' ? handleSaveBehavior : handleSavePrompts}
            disabled={saving}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-none border border-emerald-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-6 pb-px mb-6 overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => setActiveTab('configuracion')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'configuracion'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>

        <button
          onClick={() => setActiveTab('modo-cierre')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'modo-cierre'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          )}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Modo de Cierre</span>
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded border ml-0.5",
            checkoutMode === 'WHATSAPP_FLOW'
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          )}>
            {checkoutMode === 'WHATSAPP_FLOW' ? '⚡ Flows' : '🌐 Web'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'catalogo'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <Package className="w-4 h-4" />
          <span>Productos y Catálogo</span>
        </button>

        <button
          onClick={() => setActiveTab('respuestas')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'respuestas'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Respuestas Rápidas</span>
        </button>

        <button
          onClick={() => setActiveTab('comportamiento')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'comportamiento'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>Comportamiento</span>
        </button>

        <button
          onClick={() => setActiveTab('integraciones')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'integraciones'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Integraciones</span>
        </button>
      </div>
    </>
  )
}
