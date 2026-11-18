'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
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

  // AI Chat Left Sidebar (Antigravity Style)
  const [isAiChatOpen, setIsAiChatOpen] = useState(true)

  // AI Copilot Studio Modal (Fallback / Direct quick modal)
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
      ? 'Paleta, Tipografía y Presets'
      : mainMode === 'componentes'
      ? 'Biblioteca de Componentes Modulares'
      : mainMode === 'plantillas'
      ? 'Plantillas & Blueprints de Tienda'
      : mainMode === 'capas'
      ? 'Árbol de Capas de la Página'
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
        isAiChatOpen={isAiChatOpen}
        onToggleAiChat={() => setIsAiChatOpen(v => !v)}
        canUndo={form.canUndo}
        canRedo={form.canRedo}
        onUndo={form.handleUndo}
        onRedo={form.handleRedo}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        lastSavedAt={form.lastSavedAt}
      />

      {/* Main Studio Workspace - 3-Column Studio Architecture: [AI Copilot Chat] | [Live Canvas] | [Inspector] */}
      <div className="flex-1 min-h-0 flex overflow-hidden bg-zinc-100/80">
        {/* LEFT COLUMN: Antigravity AI Chat Panel */}
        {!isZenMode && (
          <>
            {isAiChatOpen ? (
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
                onClose={() => setIsAiChatOpen(false)}
              />
            ) : (
              <div className="w-10 shrink-0 h-full border-r border-zinc-200 bg-white flex flex-col items-center py-3 gap-3 z-10 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsAiChatOpen(true)}
                  className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 flex items-center justify-center transition-colors cursor-pointer border border-zinc-200"
                  title="Abrir Copiloto IA"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiChatOpen(true)}
                  className="text-[9.5px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 border-0 bg-transparent cursor-pointer py-2"
                >
                  Copiloto IA
                </button>
              </div>
            )}
          </>
        )}

        {/* CENTER COLUMN: Live Interactive Preview Simulator Canvas */}
        <main className="flex-1 min-h-0 h-full flex flex-col p-3 sm:p-4 overflow-hidden">
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
            onRefineAiProposal={() => setIsAiChatOpen(true)}
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

        {/* RIGHT COLUMN: Inspector & Settings Sidebar */}
        {!isZenMode && (
          <aside className="w-[380px] xl:w-[410px] shrink-0 h-full border-l border-zinc-200/90 bg-white flex flex-col overflow-hidden shadow-xs z-10">
            <div className="flex-1 overflow-y-auto p-4 pb-20 select-none">
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

              {/* MODE 3: COMPONENTES */}
              {mainMode === 'componentes' && (
                <ComponentesTab
                  form={form}
                  onSelectSection={handleSelectSection}
                />
              )}

              {/* MODE 4: PLANTILLAS */}
              {mainMode === 'plantillas' && <PlantillasTab form={form} />}

              {/* MODE 5: CAPAS */}
              {mainMode === 'capas' && (
                <CapasTab
                  form={form}
                  onSelectSection={handleSelectSection}
                />
              )}

              {/* MODE 6: AJUSTES (Store Settings, Domains, SEO, Policies) */}
              {mainMode === 'ajustes' && <AjustesTab form={form} />}
            </div>
          </aside>
        )}
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
