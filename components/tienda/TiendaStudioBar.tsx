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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DeviceType } from './types'

export type StudioMainMode = 'secciones' | 'estilo' | 'ajustes'

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
}: TiendaStudioBarProps) {
  const DEVICES: Array<{ id: DeviceType; icon: React.ElementType; label: string }> = [
    { id: 'escritorio', icon: Monitor, label: 'Escritorio' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'movil', icon: Smartphone, label: 'Móvil' },
  ]

  const MAIN_MODES: Array<{ id: StudioMainMode; label: string; icon: React.ElementType }> = [
    { id: 'secciones', label: 'Secciones', icon: Layers },
    { id: 'estilo', label: 'Estilos', icon: Palette },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ]

  return (
    <header className="bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between gap-3 select-none shrink-0 shadow-2xs">
      {/* LEFT: Store identifier & Main Navigation Modes */}
      <div className="flex items-center gap-3 xl:gap-5 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            ⚡
          </div>
          <div className="hidden sm:block text-left leading-none min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-zinc-950 truncate max-w-[140px]">
                {storeName || 'Tienda Online'}
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10.5px] font-semibold text-zinc-400 truncate mt-0.5">
              /{subdomain}
            </p>
          </div>
        </div>

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
                ? 'bg-emerald-600 text-white shadow-xs'
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

      {/* RIGHT: AI Designer, Preview External Link & Save Button */}
      <div className="flex items-center gap-2">
        {onOpenAiModal && (
          <button
            type="button"
            onClick={onOpenAiModal}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-white bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer border-0 shadow-xs hover:shadow-sm"
            title="Describe cómo quieres tu tienda y la IA la adaptará al instante"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Diseñar con IA</span>
          </button>
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
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
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
            <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-1.5" />
          )}
        </Button>
      </div>
    </header>
  )
}

