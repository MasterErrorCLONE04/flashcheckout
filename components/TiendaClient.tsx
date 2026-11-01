'use client'

import { useState, useEffect } from 'react'
import {
  TiendaClientProps,
  ActiveTab,
  DeviceType,
  useTiendaForm,
  TiendaHeader,
  GeneralStoreWidgets,
  TiendaPreviewPanel,
  EstiloTab,
  EncabezadoTab,
  ProductosTab,
  SeccionesTab,
  InfoTab,
  DominiosTab,
  SeoTab,
  RedesTab,
  PoliticasTab
} from './tienda'

export default function TiendaClient({ initialStore, products }: TiendaClientProps) {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<ActiveTab>('estilo')
  
  // Device Preview selection
  const [device, setDevice] = useState<DeviceType>('escritorio')

  // Hook managing all form state, sync and store persistence
  const form = useTiendaForm(initialStore, products)

  // Prevent double scrollbar by locking the body and html overflow when editor is open
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow
    const origHtmlHeight = document.documentElement.style.height
    const origBodyOverflow = document.body.style.overflow
    const origBodyHeight = document.body.style.height

    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100%'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100%'

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow
      document.documentElement.style.height = origHtmlHeight
      document.body.style.overflow = origBodyOverflow
      document.body.style.height = origBodyHeight
    }
  }, [])

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-130px)] min-h-[500px] flex flex-col overflow-hidden animate-in duration-300 font-sans text-left pb-2">
      {/* Header and navigation tabs */}
      <TiendaHeader
        subdomain={form.domains.subdomain}
        isSaving={form.isSaving}
        onSaveChanges={form.handleSaveChanges}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main content layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch overflow-hidden mt-6">
        
        {/* LEFT COLUMN: Customized Widgets based on selected tab (4/12) */}
        <div className="lg:col-span-4 h-full overflow-y-auto pr-1 pb-20 select-none space-y-6">
          {activeTab === 'estilo' && <EstiloTab form={form} />}
          {activeTab === 'encabezado' && <EncabezadoTab form={form} />}
          {activeTab === 'productos' && <ProductosTab form={form} />}
          {(activeTab === 'secciones' || (activeTab as string) === 'premium') && <SeccionesTab form={form} />}
          {activeTab === 'info' && <InfoTab form={form} />}
          {activeTab === 'dominios' && <DominiosTab form={form} />}
          {activeTab === 'seo' && <SeoTab form={form} />}
          {activeTab === 'redes' && <RedesTab form={form} />}
          {activeTab === 'politicas' && <PoliticasTab form={form} />}

          {/* General Configuration Widgets (Toggles, Copy link, Store status) */}
          <GeneralStoreWidgets form={form} />
        </div>

        {/* RIGHT COLUMN: Live Customizer Preview (8/12) */}
        <TiendaPreviewPanel
          device={device}
          setDevice={setDevice}
          typography={form.typography}
          colors={form.colors}
          previewStore={form.previewStore}
        />
      </div>
    </div>
  )
}
