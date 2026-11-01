'use client'

import React from 'react'
import {
  StoreData,
  useOfficeState,
  OfficeKeyframes,
  OfficeHeader,
  OfficeSidebarFurniture,
  OfficeCanvas,
  AgentInspectorDrawer,
  HireAgentModal,
  CoffeeModal,
  PrintedTicketsModal,
  ConsolidatedLogsModal
} from './the-office'

interface TheOfficeClientProps {
  store?: StoreData | null
  initialStoreData?: StoreData | null
  productsCount?: number
  ordersCount?: number
  pendingOrdersCount?: number
  outOfStockCount?: number
}

export function TheOfficeClient({
  store: propStore,
  initialStoreData,
  productsCount = 0,
  ordersCount = 0,
  pendingOrdersCount = 0,
  outOfStockCount = 0
}: TheOfficeClientProps) {
  const store: StoreData = propStore || initialStoreData || {
    id: 'temp',
    name: 'Mi Tienda',
    slug: 'store',
    settings: {}
  }

  const office = useOfficeState(store)

  return (
    <>
      <OfficeKeyframes />

      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
        {/* Header bar with controls */}
        <OfficeHeader
          office={office}
          storeName={store.name}
          productsCount={productsCount}
          ordersCount={ordersCount}
        />

        {/* Isometric Office workspace canvas + Optional Furniture Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6 w-full items-start">
          <OfficeCanvas
            office={office}
            productsCount={productsCount}
            pendingOrdersCount={pendingOrdersCount}
            outOfStockCount={outOfStockCount}
          />

          {office.isEditingLayout && (
            <OfficeSidebarFurniture
              onAddItem={office.handleAddItem}
            />
          )}
        </div>
      </div>

      {/* Agent Details / Terminal Inspector Drawer */}
      <AgentInspectorDrawer
        selectedAgent={office.selectedAgent}
        processedSprites={office.processedSprites}
        activeTab={office.activeTab}
        setActiveTab={office.setActiveTab}
        terminalLogs={office.terminalLogs}
        submitting={office.submitting}
        terminalEndRef={office.terminalEndRef}
        instruction={office.instruction}
        setInstruction={office.setInstruction}
        agentStatus={office.agentStatus}
        handleSendCommand={office.handleSendCommand}
        handleDismissAgent={office.handleDismissAgent}
        onClose={() => office.setSelectedAgentId(null)}
      />

      {/* Modals */}
      <HireAgentModal
        isOpen={office.hiringModalOpen}
        onClose={() => office.setHiringModalOpen(false)}
        onSubmit={office.handleCreateAgent}
        creating={office.creating}
        newName={office.newName}
        setNewName={office.setNewName}
        newRole={office.newRole}
        setNewRole={office.setNewRole}
        newModel={office.newModel}
        setNewModel={office.setNewModel}
        newAvatarEmoji={office.newAvatarEmoji}
        setNewAvatarEmoji={office.setNewAvatarEmoji}
        newDescription={office.newDescription}
        setNewDescription={office.setNewDescription}
        newSystemPrompt={office.newSystemPrompt}
        setNewSystemPrompt={office.setNewSystemPrompt}
        newTools={office.newTools}
        setNewTools={office.setNewTools}
      />

      <CoffeeModal
        isOpen={office.coffeeModalOpen}
        onClose={() => office.setCoffeeModalOpen(false)}
        agentsList={office.agentsList}
        boostedAgents={office.boostedAgents}
        onBoostAgent={office.handleBoostAgent}
      />

      <PrintedTicketsModal
        isOpen={office.printedTicketsModalOpen}
        onClose={() => office.setPrintedTicketsModalOpen(false)}
        printedTickets={office.printedTickets}
      />

      <ConsolidatedLogsModal
        isOpen={office.logsModalOpen}
        onClose={() => office.setLogsModalOpen(false)}
        consolidatedLogs={office.consolidatedLogs}
        consolidatedEndRef={office.consolidatedEndRef}
        agents={office.agentsList}
      />
    </>
  )
}

export default TheOfficeClient
