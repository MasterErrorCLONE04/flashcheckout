'use client'

import {
  useAutomatizacionesState,
  AutomatizacionesHeader,
  AutomatizacionesList,
  AutomatizacionesSidebar,
  CreateAutomationModal,
  ConfigureTemplateModal,
} from '@/components/automatizaciones'

export default function AutomatizacionesPage() {
  const {
    loading,
    filterTab,
    setFilterTab,
    showModal,
    setShowModal,
    newName,
    setNewName,
    newDesc,
    setNewDesc,
    newIcon,
    setNewIcon,
    newChannels,
    setNewChannels,
    saving,
    showConfigModal,
    selectedAutomation,
    customTemplateText,
    setCustomTemplateText,
    updatingTemplate,
    handleSaveTemplate,
    handleToggle,
    handleCreate,
    handleUseTemplate,
    openConfigureModal,
    closeConfigureModal,
    totalCount,
    activeCount,
    inactiveCount,
    filtered,
    totalSentToday,
    averageRate,
  } = useAutomatizacionesState()

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      <AutomatizacionesHeader
        filterTab={filterTab}
        onSelectTab={setFilterTab}
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onOpenCreate={() => setShowModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <AutomatizacionesList
          loading={loading}
          automations={filtered}
          onToggle={handleToggle}
          onConfigure={openConfigureModal}
        />

        <AutomatizacionesSidebar
          totalSentToday={totalSentToday}
          averageRate={averageRate}
          onUseTemplate={handleUseTemplate}
        />
      </div>

      <CreateAutomationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        newName={newName}
        setNewName={setNewName}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
        newIcon={newIcon}
        setNewIcon={setNewIcon}
        newChannels={newChannels}
        setNewChannels={setNewChannels}
        saving={saving}
      />

      <ConfigureTemplateModal
        isOpen={showConfigModal}
        selectedAutomation={selectedAutomation}
        onClose={closeConfigureModal}
        onSubmit={handleSaveTemplate}
        customTemplateText={customTemplateText}
        setCustomTemplateText={setCustomTemplateText}
        updatingTemplate={updatingTemplate}
      />
    </div>
  )
}
