'use client'

import React from 'react'
import {
  StoreSettingsData,
  useStoreSettingsState,
  StoreSettingsHeader,
  TabGeneral,
  TabPagos,
  StoreSettingsSidebar,
} from './store-settings'

interface StoreSettingsManagerProps {
  initialStore: StoreSettingsData
  isPro: boolean
}

export default function StoreSettingsManager({
  initialStore,
  isPro,
}: StoreSettingsManagerProps) {
  const {
    activeTab,
    setActiveTab,
    form,
    setForm,
    editingProfile,
    setEditingProfile,
    editingAddress,
    setEditingAddress,
    mpConnected,
    disconnectingMp,
    brebConfig,
    setBrebConfig,
    loadingBreb,
    savingBreb,
    logoPreview,
    loading,
    applyBrebPreset,
    handleConnectMercadoPago,
    handleDisconnectMercadoPago,
    handleSaveBrebConfig,
    handleLogoSelect,
    handleSubmit,
  } = useStoreSettingsState(initialStore)

  return (
    <div className="space-y-6 pb-12 animate-in duration-300 font-sans text-left">
      <StoreSettingsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSubmit={() => handleSubmit()}
        loading={loading}
      />

      {/* ── Main Two-Column Layout ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT / CENTER CONTENT ─── */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'general' && (
            <TabGeneral
              form={form}
              setForm={setForm}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              editingAddress={editingAddress}
              setEditingAddress={setEditingAddress}
              logoPreview={logoPreview}
              onLogoSelect={handleLogoSelect}
            />
          )}

          {activeTab === 'pagos' && (
            <TabPagos
              mpConnected={mpConnected}
              disconnectingMp={disconnectingMp}
              onConnectMercadoPago={handleConnectMercadoPago}
              onDisconnectMercadoPago={handleDisconnectMercadoPago}
              brebConfig={brebConfig}
              setBrebConfig={setBrebConfig}
              loadingBreb={loadingBreb}
              savingBreb={savingBreb}
              onSaveBrebConfig={handleSaveBrebConfig}
              onApplyBrebPreset={applyBrebPreset}
              storeName={initialStore.name}
            />
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <StoreSettingsSidebar
          form={form}
          setForm={setForm}
          loading={loading}
          onSubmit={() => handleSubmit()}
          onNavigateTab={setActiveTab}
          isPro={isPro}
        />
      </div>
    </div>
  )
}
