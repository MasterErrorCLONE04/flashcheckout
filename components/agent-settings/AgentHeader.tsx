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
  Loader2,
} from 'lucide-react'
import { PageHeader, PageTabs } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    handleSavePrompts,
  } = agent

  return (
    <>
      <PageHeader
        title="Agente de WhatsApp"
        statusDot={settings.active ? 'emerald' : 'zinc'}
        badge={
          <Badge variant={settings.active ? 'success' : 'neutral'}>
            {settings.active ? 'Activo' : 'Inactivo'}
          </Badge>
        }
        subtitle="Configura tu asistente con inteligencia artificial para atender, asesorar y crear carritos automáticamente."
        actions={
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700">Agente activo</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.active}
                  onChange={(e) => setSettings((s) => ({ ...s, active: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            <Button
              variant="emerald"
              onClick={activeTab === 'comportamiento' ? handleSaveBehavior : handleSavePrompts}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Guardar cambios</span>
            </Button>
          </>
        }
      />

      <PageTabs
        accent="emerald"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        className="mb-6"
        tabs={[
          { id: 'configuracion', label: 'Configuración', icon: Settings },
          {
            id: 'modo-cierre',
            label: 'Modo de Cierre',
            icon: Zap,
            badge: checkoutMode === 'WHATSAPP_FLOW' ? '⚡ Flows' : '🌐 Web',
          },
          { id: 'catalogo', label: 'Productos y Catálogo', icon: Package },
          { id: 'respuestas', label: 'Respuestas Rápidas', icon: MessageSquare },
          { id: 'comportamiento', label: 'Comportamiento', icon: Sliders },
          { id: 'integraciones', label: 'Integraciones', icon: LinkIcon },
        ]}
      />
    </>
  )
}
