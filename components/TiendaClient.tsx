'use client'

import { useState, useEffect } from 'react'
import {
  TiendaClientProps,
  DeviceType,
  useTiendaForm,
  TiendaStudioBar,
  StudioMainMode,
  SectionsOverview,
  SectionEditorRouter,
  SectionId,
  EstiloTab,
  AjustesTab,
  TiendaPreviewPanel,
  AiDesignModal,
  MagicAIPromptBar,
} from './tienda'

export default function TiendaClient({ initialStore, products }: TiendaClientProps) {
  // Primary Studio Mode: 'secciones' (Page Builder) | 'estilo' (Design System) | 'ajustes' (Store Config)
  const [mainMode, setMainMode] = useState<StudioMainMode>('secciones')

  // Selected Section inside 'secciones' mode (null = Overview list)
  const [selectedSectionId, setSelectedSectionId] = useState<SectionId | null>(null)

  // Live Preview Device selection
  const [device, setDevice] = useState<DeviceType>('escritorio')

  // Zoom scale percentage in desktop preview
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  // Editor vs Real User Preview mode
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')

  // Zen Mode (Fullscreen preview)
  const [isZenMode, setIsZenMode] = useState(false)

  // AI Copilot Studio Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // Hook managing all store form state, persistence and live syncing
  const form = useTiendaForm(initialStore, products)

  // Prevent double scrollbar by locking the body overflow
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

  // Handle drill-down selection (from Overview or from Live Preview click)
  const handleSelectSection = (sectionId: SectionId) => {
    setMainMode('secciones')
    setSelectedSectionId(sectionId)
  }

  // Friendly title mapping for active breadcrumb
  const sectionTitles: Record<SectionId, string> = {
    hero: 'Portada & Hero Collage',
    bestsellers: 'Colección Bestsellers',
    ritual: 'Ritual Editorial (3 Pasos)',
    ugc: 'Mural Social UGC & Reseñas',
    faqs: 'Preguntas Frecuentes',
    garantias: 'Garantías Pre-Footer',
    story: 'Historia de Marca',
    footer: 'Pie de Página & Newsletter',
  }

  const activeBreadcrumbTitle =
    mainMode === 'secciones'
      ? selectedSectionId
        ? sectionTitles[selectedSectionId]
        : undefined
      : mainMode === 'estilo'
      ? 'Paleta, Tipografía y Presets'
      : 'Configuración General de Tienda'

  return (
    <div className="h-[calc(100vh-80px)] min-h-[550px] flex flex-col overflow-hidden animate-in duration-200 font-sans text-left -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      {/* Sleek Unified Studio Toolbar */}
      <TiendaStudioBar
        storeName={initialStore.name}
        subdomain={form.domains.subdomain}
        mainMode={mainMode}
        setMainMode={mode => {
          setMainMode(mode)
          if (mode !== 'secciones') setSelectedSectionId(null)
        }}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        device={device}
        setDevice={setDevice}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(v => !v)}
        isSaving={form.isSaving}
        hasUnsavedChanges={form.hasUnsavedChanges}
        onSaveChanges={form.handleSaveChanges}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        isGeneratingAI={form.isGeneratingAI}
      />

      {/* Persistent Magic AI Command Bar (Prominente, Zero Friction, 1-Clic) */}
      <div className="px-3 sm:px-4 pt-3 pb-0 shrink-0">
        <MagicAIPromptBar
          onGenerate={form.handleAIPromptGenerate}
          onUndo={form.handleUndoAIGeneration}
          canUndo={form.aiProposalActive}
          isGenerating={form.isGeneratingAI}
        />
      </div>

      {/* Main Studio Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 lg:gap-5 p-3 sm:p-4 overflow-hidden">
        {/* LEFT COLUMN: Dedicated contextual sidebar (Overview or Section Detail) */}
        {!isZenMode && (
          <div className="col-span-12 lg:col-span-4 xl:col-span-3.5 h-full overflow-y-auto pr-1 pb-16 select-none">
            {/* MODE 1: SECCIONES (Master/Detail Page Builder) */}
            {mainMode === 'secciones' && (
              <>
                {selectedSectionId === null ? (
                  <SectionsOverview
                    form={form}
                    onSelectSection={handleSelectSection}
                  />
                ) : (
                  <SectionEditorRouter
                    sectionId={selectedSectionId}
                    form={form}
                    onBack={() => setSelectedSectionId(null)}
                  />
                )}
              </>
            )}

            {/* MODE 2: ESTILOS (Global Theme & Typography) */}
            {mainMode === 'estilo' && <EstiloTab form={form} />}

            {/* MODE 3: AJUSTES (Store Settings, Domains, SEO, Policies) */}
            {mainMode === 'ajustes' && <AjustesTab form={form} />}
          </div>
        )}

        {/* RIGHT COLUMN: Live Interactive Preview Simulator */}
        <TiendaPreviewPanel
          device={device}
          setDevice={setDevice}
          typography={form.typography}
          colors={form.colors}
          previewStore={form.previewStore}
          activeSectionTitle={activeBreadcrumbTitle}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          onSelectSection={handleSelectSection}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(v => !v)}
          aiProposalActive={form.aiProposalActive}
          onAcceptAiProposal={form.handleAcceptAIGeneration}
          onUndoAiProposal={form.handleUndoAIGeneration}
          onRefineAiProposal={() => setIsAiModalOpen(true)}
        />
      </div>

      {/* AI Design Studio Copilot Modal */}
      <AiDesignModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={form.handleAIPromptGenerate}
        isGenerating={form.isGeneratingAI}
        initialPrompt={form.lastUsedPrompt}
      />
    </div>
  )
}
