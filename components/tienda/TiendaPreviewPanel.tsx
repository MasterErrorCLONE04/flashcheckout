'use client'

import React, { useState, useEffect } from 'react'
import {
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Upload,
  Check,
  Wand2,
  Package,
  Sliders,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { PublicCheckoutStore } from '@/lib/checkout/types'
import { DeviceType, ActiveTab, SectionId } from './types'
import { AiProposalBanner } from './AiProposalBanner'
import type { TiendaFormState } from './useTiendaForm'
import { uploadStoreImage } from './tiendaPersistence'

interface TiendaPreviewPanelProps {
  device: DeviceType
  setDevice?: (device: DeviceType) => void
  typography: string
  colors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
  previewStore: PublicCheckoutStore
  activeSectionTitle?: string
  activeSectionId?: SectionId | null
  previewMode: 'edit' | 'preview'
  setPreviewMode?: (mode: 'edit' | 'preview') => void
  zoomLevel: number
  setZoomLevel?: React.Dispatch<React.SetStateAction<number>>
  onSelectSection?: (sectionId: SectionId) => void
  onSelectTab?: (tab: ActiveTab) => void
  isZenMode?: boolean
  onToggleZenMode?: () => void
  aiProposalActive?: boolean
  onAcceptAiProposal?: () => void
  onUndoAiProposal?: () => void
  onRefineAiProposal?: () => void
  onMoveSectionUp?: (sectionId: SectionId) => void
  onMoveSectionDown?: (sectionId: SectionId) => void
  onToggleSectionVisibility?: (sectionId: SectionId) => void
  isSectionVisible?: boolean
  onDeselectSection?: () => void
  form?: TiendaFormState
  onEditProduct?: (productId: string) => void
  onOpenSettingsMode?: () => void
}

export function TiendaPreviewPanel({
  device,
  colors,
  previewStore,
  activeSectionTitle,
  activeSectionId,
  previewMode,
  zoomLevel,
  onSelectSection,
  onSelectTab,
  aiProposalActive = false,
  onAcceptAiProposal,
  onUndoAiProposal,
  onRefineAiProposal,
  onMoveSectionUp,
  onMoveSectionDown,
  onToggleSectionVisibility,
  isSectionVisible,
  onDeselectSection,
  form,
  onEditProduct,
  onOpenSettingsMode,
}: TiendaPreviewPanelProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [activeField, setActiveField] = useState<{
    key: string
    label: string
    sectionId?: SectionId
  } | null>(null)
  const [isUploadingFieldImg, setIsUploadingFieldImg] = useState(false)
  const [aiStepIndex, setAiStepIndex] = useState(0)

  const isGeneratingAI = Boolean(form?.isGeneratingAI)

  useEffect(() => {
    if (!isGeneratingAI) {
      setAiStepIndex(0)
      return
    }
    const interval = setInterval(() => {
      setAiStepIndex(prev => (prev < 3 ? prev + 1 : prev))
    }, 1100)
    return () => clearInterval(interval)
  }, [isGeneratingAI])

  // Auto-scroll simulator to currently selected section in the editor
  React.useEffect(() => {
    if (!activeSectionId || !scrollContainerRef.current) return
    const el = scrollContainerRef.current.querySelector(
      `[data-maker-section="${activeSectionId}"]`
    )
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeSectionId])

  // Helper to read current value of a data-maker-field from form
  const getFieldValue = (key: string): { value: string; secondValue?: string; isImage: boolean } => {
    if (!form) return { value: '', isImage: false }
    if (key === 'bannerTitle') return { value: form.bannerTitle, isImage: false }
    if (key === 'bannerSubtitle') return { value: form.bannerSubtitle, isImage: false }
    if (key === 'heroBadge') return { value: form.heroBadge, isImage: false }
    if (key === 'bannerButton.text') return { value: form.bannerButton.text, isImage: false }
    if (key === 'announcement.text') return { value: form.announcement.text, isImage: false }
    if (key === 'storeInfo.name') return { value: form.storeInfo.name, isImage: false }
    if (key === 'bannerUrl') return { value: form.bannerUrl, isImage: true }
    if (key.startsWith('heroPanels.')) {
      const idx = Number(key.split('.')[1] || 0)
      return { value: form.heroPanels[idx] || '', isImage: true }
    }
    if (key === 'bentoHighlights.title') return { value: form.bentoHighlights.title, isImage: false }
    if (key.startsWith('bentoHighlights.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.bentoHighlights.items[idx]
      return { value: item?.title || '', secondValue: item?.desc || '', isImage: false }
    }
    if (key === 'processTimeline.headline') {
      return { value: form.processTimeline.headline || form.processTimeline.title || '', isImage: false }
    }
    if (key.startsWith('processTimeline.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.processTimeline.items[idx]
      return { value: item?.title || '', secondValue: item?.desc || '', isImage: false }
    }
    if (key === 'ambassadors.title') return { value: form.ambassadors.title, isImage: false }
    if (key.startsWith('ambassadors.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.ambassadors.items[idx]
      return { value: item?.name || '', secondValue: item?.role || '', isImage: false }
    }
    if (key === 'testimonials.title') return { value: form.testimonials.title, isImage: false }
    if (key === 'testimonials.subtitle') return { value: form.testimonials.subtitle || '', isImage: false }
    if (key.startsWith('testimonials.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.testimonials.items[idx]
      return { value: item?.name || '', secondValue: item?.comment || '', isImage: false }
    }
    if (key.startsWith('ugcGallery.')) {
      const idx = Number(key.split('.')[1] || 0)
      return { value: form.ugcGallery[idx] || '', isImage: true }
    }
    if (key.startsWith('lifestyleGallery.')) {
      const idx = Number(key.split('.')[1] || 0)
      return { value: form.lifestyleGallery[idx] || '', isImage: true }
    }
    if (key.startsWith('visualCategories.')) {
      const idx = Number(key.split('.')[1] || 0)
      const item = form.visualCategories[idx]
      return { value: item?.category || '', secondValue: item?.imageUrl || '', isImage: false }
    }
    if (key.startsWith('pressLogos.')) {
      const idx = Number(key.split('.')[1] || 0)
      const item = form.pressLogos[idx]
      return { value: item?.name || '', secondValue: item?.subtitle || '', isImage: false }
    }
    if (key === 'retailers.title') return { value: form.retailers.title, isImage: false }
    if (key === 'retailers.subtitle') return { value: form.retailers.subtitle || '', isImage: false }
    if (key.startsWith('retailers.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.retailers.items[idx]
      return { value: item?.name || '', secondValue: item?.badge || '', isImage: false }
    }
    if (key === 'faqs.title') return { value: form.faqs.title || 'Preguntas Frecuentes', isImage: false }
    if (key.startsWith('faqs.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.faqs.items[idx]
      return { value: item?.q || '', secondValue: item?.a || '', isImage: false }
    }
    if (key.startsWith('benefits.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      const item = form.benefits.items[idx]
      return { value: item?.label || '', secondValue: item?.desc || '', isImage: false }
    }
    if (key === 'ingredientsSection.title') return { value: form.ingredientsSection.title, isImage: false }
    if (key === 'ingredientsSection.left') {
      return { value: form.ingredientsSection.leftTitle, secondValue: form.ingredientsSection.leftDesc, isImage: false }
    }
    if (key === 'ingredientsSection.right') {
      return { value: form.ingredientsSection.rightTitle, secondValue: form.ingredientsSection.rightDesc, isImage: false }
    }
    if (key === 'brandStory.title') return { value: form.brandStory.title, isImage: false }
    if (key === 'brandStory.text') return { value: form.brandStory.desc || '', isImage: false }
    if (key === 'brandStory.imageUrl') return { value: form.brandStory.bgUrl || '', isImage: true }
    if (key === 'brandStoryPage.headerTrayectoria') return { value: form.brandStoryPage.headerTrayectoria, isImage: false }
    if (key === 'brandStoryPage.headerPerfil') return { value: form.brandStoryPage.headerPerfil, isImage: false }
    if (key === 'brandStoryPage.narrativeP1') return { value: form.brandStoryPage.narrativeP1, isImage: false }
    if (key === 'brandStoryPage.narrativeP2') return { value: form.brandStoryPage.narrativeP2, isImage: false }
    if (key === 'brandStoryPage.imageHeritage') return { value: form.brandStoryPage.imageHeritage || '', isImage: true }
    if (key === 'newsletterWidget.title') return { value: form.newsletterWidget.title, isImage: false }
    if (key === 'newsletterWidget.subtitle') return { value: form.newsletterWidget.subtitle, isImage: false }
    if (key === 'newsletterWidget.btnText') return { value: form.newsletterWidget.btnText, isImage: false }
    return { value: '', isImage: false }
  }

  // Helper to update value of a data-maker-field in form
  const setFieldValue = (key: string, val: string, secondVal?: string) => {
    if (!form) return
    if (key === 'bannerTitle') form.setBannerTitle(val)
    else if (key === 'bannerSubtitle') form.setBannerSubtitle(val)
    else if (key === 'heroBadge') form.setHeroBadge(val)
    else if (key === 'bannerButton.text') form.setBannerButton(p => ({ ...p, text: val }))
    else if (key === 'announcement.text') form.setAnnouncement(p => ({ ...p, text: val, enabled: true }))
    else if (key === 'storeInfo.name') form.setStoreInfo(p => ({ ...p, name: val }))
    else if (key === 'bannerUrl') form.setBannerUrl(val)
    else if (key.startsWith('heroPanels.')) {
      const idx = Number(key.split('.')[1] || 0)
      form.setHeroPanels(prev => {
        const next = [...prev]
        while (next.length <= idx) next.push('')
        next[idx] = val
        return next
      })
      if (idx === 0) form.setBannerUrl(val)
    } else if (key === 'bentoHighlights.title') form.setBentoHighlights(p => ({ ...p, title: val }))
    else if (key.startsWith('bentoHighlights.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setBentoHighlights(p => ({
        ...p,
        items: p.items.map((it, i) =>
          i === idx ? { ...it, title: val, ...(secondVal !== undefined ? { desc: secondVal } : {}) } : it
        ),
      }))
    } else if (key === 'processTimeline.headline') {
      form.setProcessTimeline(p => ({ ...p, headline: val, title: val }))
    } else if (key.startsWith('processTimeline.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setProcessTimeline(p => ({
        ...p,
        items: p.items.map((it, i) =>
          i === idx ? { ...it, title: val, ...(secondVal !== undefined ? { desc: secondVal } : {}) } : it
        ),
      }))
    } else if (key === 'ambassadors.title') form.setAmbassadors(p => ({ ...p, title: val }))
    else if (key.startsWith('ambassadors.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setAmbassadors(p => ({
        ...p,
        items: p.items.map((it, i) =>
          i === idx ? { ...it, name: val, ...(secondVal !== undefined ? { role: secondVal } : {}) } : it
        ),
      }))
    } else if (key === 'testimonials.title') form.setTestimonials(p => ({ ...p, title: val }))
    else if (key === 'testimonials.subtitle') form.setTestimonials(p => ({ ...p, subtitle: val }))
    else if (key.startsWith('testimonials.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setTestimonials(p => ({
        ...p,
        items: (p.items || []).map((it: Record<string, unknown>, i: number) =>
          i === idx ? { ...it, name: val, ...(secondVal !== undefined ? { comment: secondVal } : {}) } : it
        ),
      }))
    } else if (key.startsWith('ugcGallery.')) {
      const idx = Number(key.split('.')[1] || 0)
      form.setUgcGallery(prev => prev.map((u, i) => (i === idx ? val : u)))
    } else if (key.startsWith('lifestyleGallery.')) {
      const idx = Number(key.split('.')[1] || 0)
      form.setLifestyleGallery(prev => prev.map((u, i) => (i === idx ? val : u)))
    } else if (key.startsWith('visualCategories.')) {
      const idx = Number(key.split('.')[1] || 0)
      form.setVisualCategories(prev =>
        prev.map((c, i) =>
          i === idx
            ? { ...c, category: val, ...(secondVal !== undefined ? { imageUrl: secondVal } : {}) }
            : c
        )
      )
    } else if (key.startsWith('pressLogos.')) {
      const idx = Number(key.split('.')[1] || 0)
      form.setPressLogos(prev =>
        prev.map((l, i) =>
          i === idx ? { ...l, name: val, ...(secondVal !== undefined ? { subtitle: secondVal } : {}) } : l
        )
      )
    } else if (key === 'retailers.title') form.setRetailers(p => ({ ...p, title: val }))
    else if (key === 'retailers.subtitle') form.setRetailers(p => ({ ...p, subtitle: val }))
    else if (key.startsWith('retailers.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setRetailers(p => ({
        ...p,
        items: p.items.map((it, i) =>
          i === idx ? { ...it, name: val, ...(secondVal !== undefined ? { badge: secondVal } : {}) } : it
        ),
      }))
    } else if (key === 'faqs.title') form.setFaqs(p => ({ ...p, title: val }))
    else if (key.startsWith('faqs.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setFaqs(p => ({
        ...p,
        items: (p.items || []).map((it: Record<string, unknown>, i: number) =>
          i === idx ? { ...it, q: val, ...(secondVal !== undefined ? { a: secondVal } : {}) } : it
        ),
      }))
    } else if (key.startsWith('benefits.items.')) {
      const idx = Number(key.split('.')[2] || 0)
      form.setBenefits(p => ({
        ...p,
        items: p.items.map((it, i) =>
          i === idx ? { ...it, label: val, ...(secondVal !== undefined ? { desc: secondVal } : {}) } : it
        ),
      }))
    } else if (key === 'ingredientsSection.title') form.setIngredientsSection(p => ({ ...p, title: val }))
    else if (key === 'ingredientsSection.left') {
      form.setIngredientsSection(p => ({
        ...p,
        leftTitle: val,
        ...(secondVal !== undefined ? { leftDesc: secondVal } : {}),
      }))
    } else if (key === 'ingredientsSection.right') {
      form.setIngredientsSection(p => ({
        ...p,
        rightTitle: val,
        ...(secondVal !== undefined ? { rightDesc: secondVal } : {}),
      }))
    } else if (key === 'brandStory.title') form.setBrandStory(p => ({ ...p, title: val }))
    else if (key === 'brandStory.text') form.setBrandStory(p => ({ ...p, desc: val }))
    else if (key === 'brandStory.imageUrl') form.setBrandStory(p => ({ ...p, bgUrl: val }))
    else if (key === 'brandStoryPage.headerTrayectoria') form.setBrandStoryPage(p => ({ ...p, headerTrayectoria: val }))
    else if (key === 'brandStoryPage.headerPerfil') form.setBrandStoryPage(p => ({ ...p, headerPerfil: val }))
    else if (key === 'brandStoryPage.narrativeP1') form.setBrandStoryPage(p => ({ ...p, narrativeP1: val }))
    else if (key === 'brandStoryPage.narrativeP2') form.setBrandStoryPage(p => ({ ...p, narrativeP2: val }))
    else if (key === 'brandStoryPage.imageHeritage') form.setBrandStoryPage(p => ({ ...p, imageHeritage: val }))
    else if (key === 'newsletterWidget.title') form.setNewsletterWidget(p => ({ ...p, title: val }))
    else if (key === 'newsletterWidget.subtitle') form.setNewsletterWidget(p => ({ ...p, subtitle: val }))
    else if (key === 'newsletterWidget.btnText') form.setNewsletterWidget(p => ({ ...p, btnText: val }))
  }

  const handlePreviewClickCapture = (e: React.MouseEvent) => {
    if (previewMode !== 'edit') return

    const rawTarget = e.target as HTMLElement

    // 1. Check if user clicked on a product card
    const productEl = rawTarget.closest('[data-maker-product-id]') as HTMLElement | null
    if (productEl && productEl.dataset.makerProductId) {
      e.preventDefault()
      e.stopPropagation()
      onSelectSection?.('bestsellers')
      onEditProduct?.(productEl.dataset.makerProductId)
      return
    }

    // 2. Check if user clicked on a specific editable field (title, subtitle, button, badge, photo, item)
    const fieldEl = rawTarget.closest('[data-maker-field]') as HTMLElement | null
    const sectionEl = rawTarget.closest('[data-maker-section], [data-maker-tab]') as HTMLElement | null

    if (fieldEl && fieldEl.dataset.makerField) {
      e.preventDefault()
      e.stopPropagation()
      const rawSec = sectionEl?.dataset.makerSection
      const resolvedSec: SectionId | undefined =
        rawSec === 'header' || rawSec === 'whatsapp'
          ? 'hero'
          : (rawSec as SectionId | undefined)

      if (resolvedSec && onSelectSection) {
        onSelectSection(resolvedSec)
      }
      setActiveField({
        key: fieldEl.dataset.makerField,
        label: fieldEl.dataset.makerLabel || fieldEl.dataset.makerField,
        sectionId: resolvedSec,
      })
      return
    }

    // 3. Otherwise check if user clicked on a section container
    if (sectionEl) {
      e.preventDefault()
      e.stopPropagation()
      const rawSec = sectionEl.dataset.makerSection
      if (rawSec === 'whatsapp') {
        onOpenSettingsMode?.()
        return
      }
      if (rawSec === 'header') {
        onSelectSection?.('hero')
        return
      }
      if (rawSec && onSelectSection) {
        onSelectSection(rawSec as SectionId)
      } else if (sectionEl.dataset.makerTab && onSelectTab) {
        onSelectTab(sectionEl.dataset.makerTab as ActiveTab)
      }
    }
  }

  const activeFieldInfo = activeField ? getFieldValue(activeField.key) : null

  const handleFieldPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeField) return
    setIsUploadingFieldImg(true)
    try {
      const url = await uploadStoreImage(file, 'banner')
      setFieldValue(activeField.key, url)
    } catch {
      // handled
    } finally {
      setIsUploadingFieldImg(false)
    }
  }

  const AI_BUILDING_STEPS = [
    `Analizando ${previewStore.products?.length || 0} productos en stock y colecciones...`,
    'Diseñando paleta cromática, tipografía editorial y jerarquía visual...',
    'Redactando titulares persuasivos, beneficios y preguntas frecuentes...',
    'Ensamblando vista responsiva para Escritorio, Tablet y Móvil...',
  ]

  return (
    <div className="h-full w-full flex flex-col overflow-hidden min-h-0 select-none">
      {/* Floating Canvas Top Chrome (Sleek Modern Browser Frame Header) */}
      <div className="bg-white border border-zinc-200/90 rounded-t-xl px-4 py-2.5 flex items-center justify-between select-none shrink-0 shadow-2xs gap-3">
        {/* Left: Window controls / Mode indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
          </div>

          <div className="h-4 w-px bg-zinc-200 mx-1 shrink-0" />

          {previewMode === 'edit' ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <span className="truncate">
                {activeField
                  ? `Editando: ${activeField.label}`
                  : activeSectionTitle
                    ? `Editando: ${activeSectionTitle}`
                    : 'Modo Editor Interactivo (haz clic en cualquier texto, foto, botón o producto)'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 truncate">
              <Eye className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
              <span>Modo Vista: Experiencia real del cliente</span>
            </div>
          )}
        </div>

        {/* Center: Fake browser address bar + Stock Context Pill */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-100/80 border border-zinc-200/70 px-3.5 py-1 rounded-full text-[11px] font-medium text-zinc-600 max-w-[280px] truncate shadow-2xs">
            <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="text-zinc-400">https://</span>
            <span className="font-bold text-zinc-800 truncate">{previewStore.slug}.flashcheckout.co</span>
          </div>
          <span
            className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800"
            title="Productos activos sincronizados en el lienzo"
          >
            <Package className="w-3 h-3 text-emerald-600" />
            <span>{previewStore.products?.length || 0} productos activos</span>
          </span>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/tienda/${previewStore.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 px-2.5 py-1 rounded-md hover:bg-zinc-100 transition-colors"
            title="Abrir tienda real en pestaña nueva"
          >
            <span>Visitar Tienda</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Viewport Canvas Body Frame */}
      <div
        className={cn(
          'w-full flex-1 flex justify-center overflow-hidden relative select-none min-h-0 bg-[#E8E8ED] border-x border-b border-zinc-200/90 rounded-b-xl shadow-xs transition-all duration-300',
          device === 'escritorio' ? 'items-stretch p-0' : 'items-center p-3 sm:p-5'
        )}
      >
        {/* LIVE AI MULTI-STAGE BUILDING OVERLAY */}
        {isGeneratingAI && (
          <div className="absolute inset-0 z-[90] bg-zinc-950/75 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wand2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    Copiloto IA diseñando tu tienda...
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Conectado al inventario real de {previewStore.name}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {AI_BUILDING_STEPS.map((stepText, idx) => {
                  const isDone = idx < aiStepIndex
                  const isCurrent = idx === aiStepIndex
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all',
                        isCurrent
                          ? 'bg-white/10 text-white font-bold border border-white/15'
                          : isDone
                            ? 'text-emerald-400 font-medium'
                            : 'text-zinc-500'
                      )}
                    >
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                          isDone
                            ? 'bg-emerald-500 text-zinc-950'
                            : isCurrent
                              ? 'bg-white text-zinc-950 animate-pulse'
                              : 'bg-zinc-800 text-zinc-500'
                        )}
                      >
                        {isDone ? '✓' : idx + 1}
                      </span>
                      <span className="truncate">{stepText}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* FLOATING QUICK-EDIT POPOVER BAR FOR ANY CLICKED ELEMENT */}
        {previewMode === 'edit' && activeField && activeFieldInfo && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl bg-zinc-950/95 text-white backdrop-blur-xl border border-zinc-800 rounded-2xl p-3 shadow-[0_18px_45px_rgba(0,0,0,0.45)] animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                  Edición Directa
                </span>
                <span className="text-xs font-bold text-zinc-100 truncate">
                  {activeField.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="w-6 h-6 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer border-0 bg-transparent shrink-0"
                title="Cerrar editor rápido"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeFieldInfo.isImage ? (
              <div className="flex items-center gap-2">
                {activeFieldInfo.value && (
                  <img
                    src={activeFieldInfo.value}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover border border-zinc-700 shrink-0"
                  />
                )}
                <input
                  type="text"
                  value={activeFieldInfo.value}
                  onChange={e => setFieldValue(activeField.key, e.target.value)}
                  placeholder="Pega la URL de la imagen o sube un archivo..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                />
                <label className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-[11px] inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingFieldImg ? 'Subiendo...' : 'Subir Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFieldPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={activeFieldInfo.value}
                    onChange={e =>
                      setFieldValue(activeField.key, e.target.value, activeFieldInfo.secondValue)
                    }
                    placeholder="Escribe el texto aquí..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveField(null)}
                    className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-[11px] inline-flex items-center gap-1 cursor-pointer border-0 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Listo</span>
                  </button>
                </div>
                {activeFieldInfo.secondValue !== undefined && (
                  <input
                    type="text"
                    value={activeFieldInfo.secondValue}
                    onChange={e =>
                      setFieldValue(activeField.key, activeFieldInfo.value, e.target.value)
                    }
                    placeholder="Descripción o subtítulo secundario..."
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11.5px] text-zinc-200 outline-none focus:border-emerald-400"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating AI Proposal Confirmation Banner */}
        {aiProposalActive && onAcceptAiProposal && onUndoAiProposal && (
          <AiProposalBanner
            isVisible={aiProposalActive}
            onAccept={onAcceptAiProposal}
            onUndo={onUndoAiProposal}
            onRefine={onRefineAiProposal || (() => {})}
          />
        )}

        {/* Simulator Device Surface */}
        {device === 'movil' ? (
          /* Sleek iPhone Smartphone Mockup Chassis */
          <div className="relative w-[365px] max-w-[96%] h-[98%] max-h-[720px] rounded-[46px] bg-zinc-950 p-[9px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] ring-1 ring-zinc-800/90 flex flex-col shrink-0 select-none transition-all duration-300">
            {/* Top speaker & camera integrated in bezel */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none z-50">
              <div className="w-10 h-1 bg-zinc-800 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700" />
            </div>

            {/* Inner Screen Bezel with Strict Rounded Clipping */}
            <div
              className="relative w-full h-full rounded-[37px] overflow-hidden bg-white flex flex-col isolate [transform:translateZ(0)]"
              style={{ backgroundColor: colors.fondo }}
            >
              {/* Scrollable Screen Content */}
              <div
                ref={scrollContainerRef}
                onClickCapture={handlePreviewClickCapture}
                className={cn(
                  'w-full h-full flex flex-col text-left overflow-y-auto scrollbar-none select-none relative',
                  previewMode === 'edit' && 'maker-edit-mode'
                )}
                style={{ backgroundColor: colors.fondo }}
              >
                <WhatsAppCatalog
                  store={previewStore}
                  device={device}
                  activeSectionId={activeSectionId}
                />
              </div>
            </div>
          </div>
        ) : device === 'tablet' ? (
          /* Sleek iPad/Tablet Pro Chassis (680px width for genuine 3-column tablet grids) */
          <div className="relative w-[680px] max-w-[96%] h-[98%] max-h-[760px] rounded-[34px] bg-zinc-950 p-[10px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] ring-1 ring-zinc-800/90 flex flex-col shrink-0 select-none transition-all duration-300">
            {/* Top camera sensor dot inside bezel */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700 z-50 pointer-events-none" />

            {/* Inner Tablet Screen */}
            <div
              className="relative w-full h-full rounded-[24px] overflow-hidden bg-white flex flex-col isolate [transform:translateZ(0)]"
              style={{ backgroundColor: colors.fondo }}
            >
              {/* Scrollable Screen Content */}
              <div
                ref={scrollContainerRef}
                onClickCapture={handlePreviewClickCapture}
                className={cn(
                  'w-full h-full flex flex-col text-left overflow-y-auto scrollbar-none select-none relative',
                  previewMode === 'edit' && 'maker-edit-mode'
                )}
                style={{ backgroundColor: colors.fondo }}
              >
                <WhatsAppCatalog
                  store={previewStore}
                  device={device}
                  activeSectionId={activeSectionId}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Clean Canvas */
          <div
            ref={scrollContainerRef}
            onClickCapture={handlePreviewClickCapture}
            className={cn(
              'w-full h-full bg-white flex flex-col text-left overflow-y-auto select-none relative transition-all duration-300 shadow-none',
              previewMode === 'edit' && 'maker-edit-mode'
            )}
            style={{
              backgroundColor: colors.fondo,
              ...(zoomLevel !== 100
                ? {
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    width: `${100 / (zoomLevel / 100)}%`,
                    height: `${100 / (zoomLevel / 100)}%`,
                  }
                : {}),
            }}
          >
            <WhatsAppCatalog
              store={previewStore}
              device={device}
              activeSectionId={activeSectionId}
            />
          </div>
        )}

        {/* Floating Canvas Action Dock for Active Selected Section */}
        {previewMode === 'edit' && activeSectionId && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/92 text-white backdrop-blur-md border border-zinc-800/90 px-3 py-2 rounded-2xl shadow-[0_12px_36px_-6px_rgba(0,0,0,0.4)] flex items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-zinc-100 max-w-[200px] truncate">
                {activeSectionTitle || activeSectionId}
              </span>
            </div>

            {/* Reorder Buttons */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onMoveSectionUp?.(activeSectionId)}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border-0 bg-transparent"
                title="Mover sección arriba"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onMoveSectionDown?.(activeSectionId)}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border-0 bg-transparent"
                title="Mover sección abajo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Visibility Toggle */}
            {onToggleSectionVisibility && (
              <>
                <div className="w-px h-4 bg-zinc-800" />
                <button
                  type="button"
                  onClick={() => onToggleSectionVisibility(activeSectionId)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer border-0 bg-transparent flex items-center gap-1.5 text-xs font-bold',
                    isSectionVisible === false
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-zinc-800/80'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                  )}
                  title={isSectionVisible === false ? 'Sección oculta (clic para activar)' : 'Ocultar sección'}
                >
                  {isSectionVisible === false ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px]">Oculta</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px]">Visible</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Deselect / Close button */}
            {onDeselectSection && (
              <>
                <div className="w-px h-4 bg-zinc-800" />
                <button
                  type="button"
                  onClick={onDeselectSection}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Cerrar barra de edición rápida"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
