'use client'

import React from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Loader2,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Edit3,
  Eye,
  Maximize2,
  Minimize2,
  Layers,
  Palette,
  Settings,
  Component,
  LayoutTemplate,
  Undo2,
  Redo2,
  QrCode,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DeviceType } from './types'

export type StudioMainMode =
  | 'secciones'
  | 'estilo'
  | 'componentes'
  | 'plantillas'
  | 'capas'
  | 'ajustes'

interface TiendaStudioBarProps {
  storeName?: string
  subdomain: string
  mainMode: StudioMainMode
  setMainMode: (mode: StudioMainMode) => void
  previewMode: 'edit' | 'preview'
  setPreviewMode: (mode: 'edit' | 'preview') => void
  device: DeviceType
  setDevice: (device: DeviceType) => void
  zoomLevel: number
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>
  isZenMode: boolean
  onToggleZenMode: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
  onSaveChanges: () => void
  onOpenAiModal?: () => void
  isGeneratingAI?: boolean
  isAiChatOpen?: boolean
  onToggleAiChat?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  onOpenQrModal?: () => void
  lastSavedAt?: Date | null
}

export function TiendaStudioBar({
  storeName,
  subdomain,
  mainMode,
  setMainMode,
  previewMode,
  setPreviewMode,
  device,
  setDevice,
  zoomLevel,
  setZoomLevel,
  isZenMode,
  onToggleZenMode,
  isSaving,
  hasUnsavedChanges,
  onSaveChanges,
  onOpenAiModal,
  isGeneratingAI = false,
  isAiChatOpen = true,
  onToggleAiChat,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenQrModal,
  lastSavedAt,
}: TiendaStudioBarProps) {
  const DEVICES: Array<{ id: DeviceType; icon: React.ElementType; label: string }> = [
    { id: 'escritorio', icon: Monitor, label: 'Escritorio' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'movil', icon: Smartphone, label: 'Móvil' },
  ]

  const MAIN_MODES: Array<{ id: StudioMainMode; label: string; icon: React.ElementType }> = [
    { id: 'secciones', label: 'Secciones', icon: Layers },
    { id: 'estilo', label: 'Estilos', icon: Palette },
    { id: 'componentes', label: 'Componentes', icon: Component },
    { id: 'plantillas', label: 'Plantillas', icon: LayoutTemplate },
    { id: 'capas', label: 'Capas', icon: Layers },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ]

  return (
    <header className="bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between gap-3 select-none shrink-0 shadow-2xs">
      {/* LEFT: Main Navigation Modes & History */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Studio Primary Modes */}
        <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-100/80">
          {MAIN_MODES.map(m => {
            const Icon = m.icon
            const isActive = mainMode === m.id

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMainMode(m.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border-0',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Undo / Redo History */}
        {(onUndo || onRedo) && (
          <div className="hidden lg:flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent"
              title="Deshacer (Ctrl + Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-zinc-200" />
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-0 bg-transparent"
              title="Rehacer (Ctrl + Shift + Z / Ctrl + Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CENTER: Editor/Preview Mode, Devices & Zoom */}
      <div className="hidden md:flex items-center gap-2 xl:gap-3">
        {/* Editor vs Preview Mode Switcher */}
        <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
          <button
            type="button"
            onClick={() => setPreviewMode('edit')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border-0',
              previewMode === 'edit'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
            )}
            title="Haz clic en cualquier sección para editarla directamente"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border-0',
              previewMode === 'preview'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
            )}
            title="Interactúa con la tienda como un comprador real"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista</span>
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
          {DEVICES.map(dev => {
            const Icon = dev.icon
            return (
              <button
                key={dev.id}
                type="button"
                onClick={() => setDevice(dev.id)}
                className={cn(
                  'px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold border-0',
                  device === dev.id
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 bg-transparent'
                )}
                title={dev.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{dev.label}</span>
              </button>
            )
          })}
        </div>

        {/* Zoom Controls (Desktop only) */}
        {device === 'escritorio' && (
          <div className="hidden xl:flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50 text-[11px] font-bold text-zinc-600">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(65, prev - 10))}
              disabled={zoomLevel <= 65}
              className="p-1 hover:text-zinc-950 disabled:opacity-30 cursor-pointer border-0 bg-transparent"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 min-w-[38px] text-center tabular-nums text-[10px]">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(120, prev + 10))}
              disabled={zoomLevel >= 120}
              className="p-1 hover:text-zinc-950 disabled:opacity-30 cursor-pointer border-0 bg-transparent"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 100 && (
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 text-zinc-400 hover:text-zinc-950 cursor-pointer border-0 bg-transparent border-l border-zinc-200"
                title="Restablecer al 100%"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Zen Mode Toggle */}
        <button
          type="button"
          onClick={onToggleZenMode}
          className={cn(
            'p-1.5 rounded-lg border cursor-pointer transition-colors',
            isZenMode
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-950'
          )}
          title={isZenMode ? 'Salir de pantalla completa' : 'Vista panorámica completa'}
        >
          {isZenMode ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* RIGHT: Sync Status, QR Mobile, Preview External Link & Save Button */}
      <div className="flex items-center gap-2">
        {/* Sync Status Badge */}
        {isSaving ? (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 mr-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
            Guardando...
          </span>
        ) : hasUnsavedChanges ? (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Borrador local
          </span>
        ) : lastSavedAt ? (
          <span
            className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 mr-1"
            title="Todos los cambios están sincronizados con la nube"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
            Guardado
          </span>
        ) : null}

        {/* Probar en Móvil Button with QR */}
        {onOpenQrModal && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenQrModal}
            className="h-8 text-xs font-bold border-zinc-200 hover:bg-zinc-100 text-zinc-700"
            title="Abre la tienda en tu celular escaneando un código QR"
          >
            <QrCode className="w-3.5 h-3.5 mr-1 text-zinc-600" />
            <span className="hidden sm:inline">Probar en Móvil</span>
          </Button>
        )}

        <Button variant="outline" size="sm" asChild className="h-8 text-xs font-bold">
          <Link href={`/tienda/${subdomain}`} target="_blank">
            <span>Ver tienda</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </Link>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSaveChanges}
          disabled={isSaving}
          className={cn(
            'h-8 text-xs font-bold transition-all relative',
            hasUnsavedChanges
              ? 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-xs ring-2 ring-zinc-900/20'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          )}
          title="Presiona Ctrl+S para guardar en cualquier momento"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          <span>{isSaving ? 'Guardando...' : hasUnsavedChanges ? 'Guardar *' : 'Guardar'}</span>
          {hasUnsavedChanges && !isSaving && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-1.5" />
          )}
        </Button>
      </div>
    </header>
  )
}

