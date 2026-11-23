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
  ComponentesTab,
  PlantillasTab,
  CapasTab,
  TiendaPreviewPanel,
  TiendaAiChatSidebar,
  AiDesignModal,
  TiendaQrModal,
  QuickProductEditModal,
} from './tienda'

export default function TiendaClient({ initialStore, products }: TiendaClientProps) {
  // Primary Studio Mode: 'secciones' | 'estilo' | 'copiloto' | 'ajustes'
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

  // Real Smartphone QR Preview Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

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
    bestsellers: 'Colección Bestsellers & Tarjetas',
    visualCategories: 'Categorías Visuales (PDP Grid)',
    bentoHighlights: 'Bento Grid de Destacados',
    ritual: 'Ritual Editorial (3 Pasos)',
    lifestyleGallery: 'Galería de Estilo de Vida',
    ingredientsSection: 'Ficha de Ingredientes y Pureza',
    ugc: 'Mural Social UGC & Reseñas',
    pressLogos: 'Barra de Prensa & Sellos',
    ambassadors: 'Embajadores & Atletas',
    retailers: 'Puntos de Entrega & Cobertura',
    faqs: 'Preguntas Frecuentes',
    garantias: 'Garantías Pre-Footer',
    story: 'Historia de Marca & Manifiesto',
    footer: 'Pie de Página & Newsletter',
  }

  const sectionKeyMap: Record<SectionId, keyof typeof form.sections> = {
    hero: 'banner',
    bestsellers: 'destacados',
    visualCategories: 'visualCategories',
    bentoHighlights: 'bentoHighlights',
    ritual: 'processTimeline',
    lifestyleGallery: 'lifestyleGallery',
    ingredientsSection: 'ingredientsSection',
    ugc: 'ugcGallery',
    pressLogos: 'pressLogos',
    ambassadors: 'ambassadors',
    retailers: 'retailers',
    faqs: 'faqs',
    garantias: 'beneficios',
    story: 'brandStory',
    footer: 'newsletterWidget',
  }

  const activeBreadcrumbTitle =
    mainMode === 'secciones'
      ? selectedSectionId
        ? sectionTitles[selectedSectionId]
        : undefined
      : mainMode === 'estilo'
        ? 'Diseño, Paleta y Tipografía'
        : mainMode === 'copiloto'
          ? 'Arquitecto IA en Vivo'
          : 'Configuración General de Tienda'

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] overflow-hidden select-none font-sans text-left">
      {/* Unified Studio Header Bar */}
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
        canUndo={form.canUndo}
        canRedo={form.canRedo}
        onUndo={form.handleUndo}
        onRedo={form.handleRedo}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        lastSavedAt={form.lastSavedAt}
      />

      {/* Main Studio Workspace - 2-Column Studio Architecture: [Left Inspector / Copilot] | [Spacious Live Storefront Canvas] */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* LEFT COLUMN: Unified Studio Inspector & AI Architect */}
        {!isZenMode && (
          <aside className="w-full md:w-[390px] xl:w-[430px] shrink-0 h-full border-r border-zinc-200 bg-white flex flex-col overflow-hidden z-10">
            {mainMode === 'copiloto' ? (
              <TiendaAiChatSidebar
                storeName={initialStore.name}
                products={form.storeProducts}
                onGenerate={form.handleAIPromptGenerate}
                onApplyImage={(imageUrl, target) => {
                  if (target === 'logo') {
                    form.setLogoUrl(imageUrl)
                  } else {
                    form.setBannerUrl(imageUrl)
                  }
                }}
                isGenerating={form.isGeneratingAI}
                aiProposalActive={form.aiProposalActive}
                onAcceptProposal={form.handleAcceptAIGeneration}
                onUndoProposal={form.handleUndoAIGeneration}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-4 pb-20 select-none">
                {/* MODE 1: BLOQUES / SECCIONES (Master/Detail Page Builder) */}
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

                {/* MODE 2: DISEÑO & MARCA (Palettes, Presets, Typography, Borders & AI Templates) */}
                {mainMode === 'estilo' && <EstiloTab form={form} />}

                {/* MODE 3: AJUSTES (Store Settings, Domains, SEO, Social, Policies) */}
                {mainMode === 'ajustes' && <AjustesTab form={form} />}

                {/* Legacy Fallbacks */}
                {mainMode === 'componentes' && (
                  <ComponentesTab
                    form={form}
                    onSelectSection={handleSelectSection}
                  />
                )}
                {mainMode === 'plantillas' && <PlantillasTab form={form} />}
                {mainMode === 'capas' && (
                  <CapasTab
                    form={form}
                    onSelectSection={handleSelectSection}
                  />
                )}
              </div>
            )}
          </aside>
        )}

        {/* RIGHT COLUMN: Spacious Live Interactive Storefront Canvas */}
        <main className="hidden md:flex flex-1 min-h-0 h-full flex-col p-3 lg:p-4 overflow-hidden bg-[#F4F4F5]">
          <TiendaPreviewPanel
            device={device}
            setDevice={setDevice}
            typography={form.typography}
            colors={form.colors}
            previewStore={form.previewStore}
            activeSectionTitle={activeBreadcrumbTitle}
            activeSectionId={selectedSectionId}
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
            onRefineAiProposal={() => setMainMode('copiloto')}
            onMoveSectionUp={form.handleMoveSectionUp}
            onMoveSectionDown={form.handleMoveSectionDown}
            onToggleSectionVisibility={secId => {
              const key = sectionKeyMap[secId]
              if (key) form.handleSectionToggle(key)
            }}
            isSectionVisible={
              selectedSectionId
                ? Boolean(form.sections[sectionKeyMap[selectedSectionId]])
                : true
            }
            onDeselectSection={() => setSelectedSectionId(null)}
            form={form}
            onEditProduct={productId => form.setEditingProductId(productId)}
            onOpenSettingsMode={() => setMainMode('ajustes')}
          />
        </main>
      </div>

      {/* AI Design Studio Copilot Modal */}
      <AiDesignModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={form.handleAIPromptGenerate}
        isGenerating={form.isGeneratingAI}
        initialPrompt={form.lastUsedPrompt}
      />

      {/* Real Smartphone QR Preview Modal */}
      <TiendaQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        subdomain={form.domains.subdomain}
        storeName={initialStore.name}
      />

      {/* In-Place Quick Product Editor Modal (when clicking any product card in Edit Mode) */}
      <QuickProductEditModal
        isOpen={Boolean(form.editingProductId)}
        product={
          (form.previewStore.products as any[])?.find(
            (p: any) => p.id === form.editingProductId
          ) || null
        }
        onClose={() => form.setEditingProductId(null)}
        onSaveProduct={updated => form.updateProductInStore(updated)}
        onOpenCardStyleInspector={() => handleSelectSection('bestsellers')}
      />
    </div>
  )
}
