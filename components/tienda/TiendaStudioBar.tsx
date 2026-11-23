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
  Sparkles,
  Undo2,
  Redo2,
  QrCode,
  CheckCircle2,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DeviceType } from './types'

export type StudioMainMode =
  | 'secciones'
  | 'estilo'
  | 'copiloto'
  | 'ajustes'
  | 'componentes'
  | 'plantillas'
  | 'capas'

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
  productsCount?: number
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
  isGeneratingAI = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenQrModal,
  lastSavedAt,
}: TiendaStudioBarProps) {
  const DEVICES: Array<{ id: DeviceType; icon: React.ElementType; label: string }> = [
    { id: 'escritorio', icon: Monitor, label: 'Web' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'movil', icon: Smartphone, label: 'Móvil' },
  ]

  const MAIN_MODES: Array<{
    id: StudioMainMode
    label: string
    icon: React.ElementType
    badge?: string
  }> = [
    { id: 'secciones', label: 'Secciones', icon: Layers },
    { id: 'componentes', label: '+ Componentes', icon: Edit3 },
    { id: 'estilo', label: 'Diseño & Marca', icon: Palette },
    { id: 'copiloto', label: 'Copiloto IA', icon: Sparkles },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ]

  return (
    <header className="h-13 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 select-none shrink-0 z-20">
      {/* LEFT: Studio Identity & Primary Mode Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Store className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="hidden sm:block text-sm font-bold text-zinc-950 tracking-tight">
            Tienda
          </h1>
        </div>

        <div className="h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />

        {/* 4 Clean Segmented Studio Tabs */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
          {MAIN_MODES.map(m => {
            const Icon = m.icon
            const isActive =
              mainMode === m.id ||
              (m.id === 'estilo' && mainMode === 'plantillas') ||
              (m.id === 'secciones' && mainMode === 'capas')

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMainMode(m.id)}
                className={cn(
                  'h-7 flex items-center gap-1.5 px-2.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border-0 whitespace-nowrap',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0',
                    m.id === 'copiloto' && isActive
                      ? 'text-emerald-600'
                      : isActive
                        ? 'text-zinc-950'
                        : 'text-zinc-500'
                  )}
                />
                <span>{m.label}</span>
                {m.id === 'copiloto' && isGeneratingAI && (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* CENTER: Canvas Controls (Editor/Vista, Dispositivos, Zoom, Undo/Redo, Zen) */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Undo / Redo */}
        {(onUndo || onRedo) && (
          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer border-0 bg-transparent"
              title="Deshacer (Ctrl + Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-zinc-200" />
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer border-0 bg-transparent"
              title="Rehacer (Ctrl + Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor vs Live Buyer View */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200/80 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setPreviewMode('edit')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0',
              previewMode === 'edit'
                ? 'bg-zinc-950 text-white shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
            )}
            title="Haz clic sobre cualquier bloque, texto o producto para editarlo"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0',
              previewMode === 'preview'
                ? 'bg-zinc-950 text-white shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
            )}
            title="Probar navegación y carrito como un comprador real"
          >
            <Eye className="w-3 h-3" />
            <span>Vista Cliente</span>
          </button>
        </div>

        {/* Device Viewport Switcher */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200/80 rounded-xl p-0.5">
          {DEVICES.map(dev => {
            const Icon = dev.icon
            return (
              <button
                key={dev.id}
                type="button"
                onClick={() => setDevice(dev.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold border-0',
                  device === dev.id
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
                title={dev.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{dev.label}</span>
              </button>
            )
          })}
        </div>

        {/* Zoom Controls (Desktop only) */}
        {device === 'escritorio' && (
          <div className="hidden 2xl:flex items-center bg-zinc-50 border border-zinc-200 rounded-xl p-0.5 text-[11px] font-bold text-zinc-600">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(65, prev - 10))}
              disabled={zoomLevel <= 65}
              className="p-1 hover:text-zinc-950 disabled:opacity-30 cursor-pointer border-0 bg-transparent"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 min-w-[36px] text-center tabular-nums text-[10px]">
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

        {/* Fullscreen Canvas Toggle */}
        <button
          type="button"
          onClick={onToggleZenMode}
          className={cn(
            'p-1.5 rounded-xl border cursor-pointer transition-colors',
            isZenMode
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
          )}
          title={isZenMode ? 'Mostrar panel lateral' : 'Expandir lienzo a pantalla completa'}
        >
          {isZenMode ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* RIGHT: Save Status, QR Mobile, Live Store Link & Primary Save CTA */}
      <div className="flex items-center gap-2 shrink-0">
        {isSaving ? (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
            Guardando...
          </span>
        ) : hasUnsavedChanges ? (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Sin guardar
          </span>
        ) : lastSavedAt ? (
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sincronizado
          </span>
        ) : null}

        {onOpenQrModal && (
          <button
            type="button"
            onClick={onOpenQrModal}
            className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Probar tienda en tu celular con código QR"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">QR Móvil</span>
          </button>
        )}

        <Link
          href={`/tienda/${subdomain}`}
          target="_blank"
          className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          title="Abrir tienda pública en una nueva pestaña"
        >
          <span className="hidden sm:inline">Ver tienda</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </Link>

        <button
          type="button"
          onClick={onSaveChanges}
          disabled={isSaving}
          className={cn(
            'h-8 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50',
            hasUnsavedChanges
              ? 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-2xs ring-2 ring-zinc-950/15'
              : 'bg-zinc-950 hover:bg-zinc-800 text-white'
          )}
          title="Guardar cambios (Ctrl + S)"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          {hasUnsavedChanges && !isSaving && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  )
}
