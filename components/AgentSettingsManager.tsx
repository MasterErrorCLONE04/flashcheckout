'use client'

import React, { useEffect } from 'react'
import {
  Bot,
  Settings,
  Bell,
  Zap,
  Package,
  MessageSquare,
  Sliders,
  Link as LinkIcon,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AgentSettingsManagerProps,
  AgentTabType,
  useAgentSettingsState,
  AgentSimulator,
  TabConfiguracion,
  TabModoCierre,
  TabCatalogo,
  TabRespuestas,
  TabAutomatizaciones,
  TabComportamiento,
  TabIntegraciones,
} from './agent-settings'

export default function AgentSettingsManager({
  initialSettings,
  storeName,
  storeSlug,
  storeId,
  storeWhatsapp,
  whatsappConnected = false,
  mpConnected = false,
  stripeConnected = false,
  initialProducts,
  initialFaqs,
}: AgentSettingsManagerProps) {
  const agent = useAgentSettingsState({
    initialSettings,
    storeName,
    storeSlug,
    storeId,
    initialProducts,
    initialFaqs,
  })

  // Bloquear doble scroll en pantalla completa de escritorio (igual que en /studio-ia y /tienda)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const studioTabs: Array<{
    id: AgentTabType
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
  }> = [
    { id: 'configuracion', label: 'Prompt & Bienvenida', icon: Settings },
    { id: 'automatizaciones', label: 'Automatizaciones', icon: Bell, badge: 'WhatsApp' },
    {
      id: 'modo-cierre',
      label: 'Modo de Cierre',
      icon: Zap,
      badge: agent.checkoutMode === 'WHATSAPP_FLOW' ? 'Flows' : 'Web',
    },
    { id: 'catalogo', label: 'Catálogo IA', icon: Package },
    { id: 'respuestas', label: 'FAQs', icon: MessageSquare },
    { id: 'comportamiento', label: 'Comportamiento', icon: Sliders },
    { id: 'integraciones', label: 'Canales', icon: LinkIcon },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO (TOP STUDIO BAR) ────────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Agente IA
          </h1>
        </div>

        {/* Centro: Conmutador de Secciones del Estudio (Segmented Control) */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {studioTabs.map(tab => {
            const Icon = tab.icon
            const isActive = agent.activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => agent.setActiveTab(tab.id)}
                className={cn(
                  'h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs border border-zinc-200/60'
                    : 'text-zinc-500 hover:text-zinc-900'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      'text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded',
                      isActive
                        ? 'bg-zinc-950 text-white'
                        : 'bg-zinc-200/70 text-zinc-600'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Derecha: Switch Agente Activo + Guardar Cambios */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="hidden md:inline-flex items-center gap-2 cursor-pointer">
            <span className="text-[11px] font-bold text-zinc-700">Bot activo</span>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={agent.settings.active}
              onChange={e =>
                agent.setSettings(s => ({ ...s, active: e.target.checked }))
              }
            />
            <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute relative after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
          </label>

          <button
            type="button"
            onClick={
              agent.activeTab === 'comportamiento'
                ? agent.handleSaveBehavior
                : agent.handleSavePrompts
            }
            disabled={agent.saving}
            className="h-8 px-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            {agent.saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Guardar cambios</span>
          </button>
        </div>
      </header>

      {/* ── 2. CUERPO DE 2 COLUMNAS A PANTALLA COMPLETA ──────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Columna Izquierda / Central: Editor de Configuración y Automatizaciones */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {agent.activeTab === 'configuracion' && <TabConfiguracion agent={agent} />}
            {agent.activeTab === 'automatizaciones' && (
              <TabAutomatizaciones
                storeName={storeName}
                storeWhatsapp={storeWhatsapp}
                onPreviewInSimulator={agent.handlePreviewInSimulator}
              />
            )}
            {agent.activeTab === 'modo-cierre' && <TabModoCierre agent={agent} />}
            {agent.activeTab === 'catalogo' && <TabCatalogo agent={agent} />}
            {agent.activeTab === 'respuestas' && <TabRespuestas agent={agent} />}
            {agent.activeTab === 'comportamiento' && <TabComportamiento agent={agent} />}
            {agent.activeTab === 'integraciones' && (
              <TabIntegraciones
                storeId={storeId}
                whatsappConnected={whatsappConnected}
                mpConnected={mpConnected}
                stripeConnected={stripeConnected}
              />
            )}
          </div>
        </div>

        {/* Columna Derecha Fija: Simulador de WhatsApp en Vivo */}
        <aside className="w-full lg:w-[375px] xl:w-[405px] shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-200 h-[540px] lg:h-full overflow-hidden">
          <AgentSimulator
            agent={agent}
            storeName={storeName}
            storeSlug={storeSlug}
          />
        </aside>
      </div>
    </div>
  )
}
