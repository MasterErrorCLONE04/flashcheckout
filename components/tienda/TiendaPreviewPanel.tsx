'use client'

import React from 'react'
import {
  Globe,
  Sparkles,
  Edit3,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { PublicCheckoutStore } from '@/lib/checkout/types'
import { DeviceType, ActiveTab } from './types'
import { SectionId } from './SectionsOverview'
import { AiProposalBanner } from './AiProposalBanner'

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
}

export function TiendaPreviewPanel({
  device,
  colors,
  previewStore,
  activeSectionTitle,
  previewMode,
  zoomLevel,
  onSelectSection,
  onSelectTab,
  isZenMode = false,
  onToggleZenMode,
  aiProposalActive = false,
  onAcceptAiProposal,
  onUndoAiProposal,
  onRefineAiProposal,
}: TiendaPreviewPanelProps) {
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (previewMode !== 'edit') return

    const target = (e.target as HTMLElement).closest(
      '[data-maker-section], [data-maker-tab]'
    ) as HTMLElement | null

    if (!target) return

    e.stopPropagation()

    if (target.dataset.makerSection && onSelectSection) {
      onSelectSection(target.dataset.makerSection as SectionId)
    } else if (target.dataset.makerTab && onSelectTab) {
      onSelectTab(target.dataset.makerTab as ActiveTab)
    }
  }

  return (
    <div
      className={cn(
        'h-full flex flex-col overflow-hidden transition-all duration-300',
        isZenMode ? 'col-span-12' : 'col-span-12 lg:col-span-8 xl:col-span-8.5'
      )}
    >
      <div className="bg-white border border-zinc-200 rounded-xl p-2.5 sm:p-3 flex-1 flex flex-col items-center shadow-none min-h-0 overflow-hidden">
        {/* Canvas Status & Breadcrumb Bar */}
        <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-2 px-1 select-none shrink-0 gap-2">
          {/* Breadcrumb / Mode indicator */}
          <div className="flex items-center gap-2 min-w-0">
            {previewMode === 'edit' ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-bold border border-zinc-200/80 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">
                  {activeSectionTitle ? `Editando: ${activeSectionTitle}` : 'Modo Editor: Clic en cualquier bloque'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 truncate">
                <Eye className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Modo Vista: Experiencia real del cliente</span>
              </div>
            )}
          </div>

          {/* Quick Domain Pill */}
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-semibold text-zinc-400">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-zinc-400" />
              <span>{previewStore.slug}.flashcheckout.co</span>
            </span>
          </div>
        </div>

        {/* Viewport Canvas Frame */}
        <div
          className={cn(
            'w-full flex-1 flex justify-center overflow-hidden relative select-none min-h-0 bg-zinc-50/70 border border-zinc-200/80 rounded-lg mt-2',
            device === 'escritorio' ? 'bg-white p-0 items-stretch' : 'p-3 sm:p-4 items-center'
          )}
        >
          {/* Floating AI Proposal Confirmation Banner */}
          {aiProposalActive && onAcceptAiProposal && onUndoAiProposal && (
            <AiProposalBanner
              isVisible={aiProposalActive}
              onAccept={onAcceptAiProposal}
              onUndo={onUndoAiProposal}
              onRefine={onRefineAiProposal || (() => {})}
            />
          )}

          <div
            onClick={handlePreviewClick}
            className={cn(
              'bg-white flex flex-col text-left overflow-y-auto select-none relative transition-all duration-300',
              previewMode === 'edit' && 'maker-edit-mode',
              device === 'escritorio' ? 'w-full h-full' : 'border border-zinc-200 shadow-xl rounded-lg',
              device === 'tablet' ? 'w-[460px] h-[94%] max-h-[620px]' : '',
              device === 'movil'
                ? 'w-[310px] h-[95%] max-h-[580px] rounded-[32px] border-[7px] border-zinc-900 shadow-2xl relative pt-4'
                : ''
            )}
            style={{
              backgroundColor: colors.fondo,
              ...(device === 'escritorio' && zoomLevel !== 100
                ? {
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    width: `${100 / (zoomLevel / 100)}%`,
                    height: `${100 / (zoomLevel / 100)}%`,
                  }
                : {}),
            }}
          >
            {device === 'movil' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 h-4 w-24 rounded-b-xl z-30 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 bg-zinc-800 rounded-full" />
              </div>
            )}

            <WhatsAppCatalog store={previewStore} device={device} />
          </div>
        </div>
      </div>
    </div>
  )
}
