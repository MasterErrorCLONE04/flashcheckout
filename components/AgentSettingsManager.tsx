'use client'

import React from 'react'
import {
  AgentSettingsManagerProps,
  useAgentSettingsState,
  AgentHeader,
  AgentSimulator,
  TabConfiguracion,
  TabModoCierre,
  TabCatalogo,
  TabRespuestas,
  TabComportamiento,
  TabIntegraciones
} from './agent-settings'

export default function AgentSettingsManager({
  initialSettings,
  storeName,
  storeSlug,
  storeId,
  initialProducts,
  initialFaqs,
}: AgentSettingsManagerProps) {
  const agent = useAgentSettingsState({
    initialSettings,
    storeName,
    storeSlug,
    storeId,
    initialProducts,
    initialFaqs
  })

  return (
    <div className="space-y-6">
      {/* Header Actions & Navigation Tabs */}
      <AgentHeader agent={agent} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Tab Content (Spans 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {agent.activeTab === 'configuracion' && <TabConfiguracion agent={agent} />}
          {agent.activeTab === 'modo-cierre' && <TabModoCierre agent={agent} />}
          {agent.activeTab === 'catalogo' && <TabCatalogo agent={agent} />}
          {agent.activeTab === 'respuestas' && <TabRespuestas agent={agent} />}
          {agent.activeTab === 'comportamiento' && <TabComportamiento agent={agent} />}
          {agent.activeTab === 'integraciones' && <TabIntegraciones storeId={storeId} />}
        </div>

        {/* Right Column: Mobile Simulator (Spans 4/12) */}
        <AgentSimulator
          agent={agent}
          storeName={storeName}
          storeSlug={storeSlug}
        />
      </div>
    </div>
  )
}
