'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  CheckCircle2,
  Palette,
  Type,
  Check,
  LayoutTemplate,
} from 'lucide-react'
import { PRESETS } from '../types'
import { TiendaFormState } from '../useTiendaForm'
import { VisualPalettePicker, PalettePreset } from '../VisualPalettePicker'
import { PlantillasTab } from './PlantillasTab'
import { toast } from 'sonner'

interface EstiloTabProps {
  form: TiendaFormState
}

type StyleSubTab = 'colores' | 'tipografia' | 'plantillas'

export function EstiloTab({ form }: EstiloTabProps) {
  const {
    themePreset,
    handleApplyPreset,
    colors,
    handleColorChange,
    borderRadius,
    setBorderRadius,
    shadowStyle,
    setShadowStyle,
    typography,
    setTypography,
    setColors,
    setThemePreset,
  } = form

  const [subTab, setSubTab] = useState<StyleSubTab>('colores')

  const handleSelectPalette = (p: PalettePreset) => {
    setColors({ ...p.colors })
    setTypography(p.typography)
    setThemePreset(p.id)
    toast.success(`Paleta aplicada: ${p.name}`)
  }

  const SUB_TABS: Array<{ id: StyleSubTab; label: string; icon: React.ElementType }> = [
    { id: 'colores', label: 'Paletas & Color', icon: Palette },
    { id: 'tipografia', label: 'Tipografía & Forma', icon: Type },
    { id: 'plantillas', label: 'Plantillas IA', icon: LayoutTemplate },
  ]

  return (
    <div className="space-y-4 text-left select-none">
      {/* Sub-navigation inside Diseño & Marca */}
      <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/80">
        {SUB_TABS.map(t => {
          const Icon = t.icon
          const isActive = subTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 whitespace-nowrap',
                isActive
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* SUB-TAB 1: PALETAS, COLORES & PRESETS */}
      {subTab === 'colores' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Custom Brand Color Swatches */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  Colores de Marca
                </h3>
                <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                  Haz clic en cualquier muestra para ajustar el color en vivo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-[9.5px] font-bold text-zinc-600 uppercase tracking-tight pt-0.5">
              {[
                { key: 'primario' as const, label: 'Primario', val: colors.primario },
                { key: 'secundario' as const, label: 'Secundario', val: colors.secundario },
                { key: 'acento' as const, label: 'Acento', val: colors.acento },
                { key: 'fondo' as const, label: 'Fondo', val: colors.fondo },
                { key: 'texto' as const, label: 'Texto', val: colors.texto },
              ].map(col => (
                <div key={col.key} className="space-y-1.5 flex flex-col items-center">
                  <input
                    type="color"
                    value={col.val}
                    onChange={e => handleColorChange(col.key, e.target.value)}
                    className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0 shadow-2xs"
                  />
                  <span>{col.label}</span>
                  <span className="font-mono text-[9px] text-zinc-400 normal-case">{col.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Visual Palettes */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <VisualPalettePicker
              currentColors={colors}
              onSelectPalette={handleSelectPalette}
            />
          </div>

          {/* 1-Click Designer Presets */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Presets Editoriales
                  </h3>
                </div>
                <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                  Combinaciones completas de color, bordes y tipografía
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {PRESETS.map(preset => {
                const isSelected = themePreset === preset.id
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3',
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50 shadow-2xs ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    )}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-950">{preset.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[10.5px] font-medium text-zinc-500 leading-tight truncate">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center -space-x-1">
                        {preset.colorPills.map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-zinc-950 ml-1 shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TIPOGRAFÍA, BORDES & SOMBRAS */}
      {subTab === 'tipografia' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Border Radius */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Curvatura de Bordes
              </h3>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                Estilo geométrico de tarjetas, imágenes y botones
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sharp' as const, label: 'Recto', desc: '0px · Editorial' },
                { id: 'smooth' as const, label: 'Suave', desc: '14px · Moderno' },
                { id: 'pill' as const, label: 'Cápsula', desc: '24px · Orgánico' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setBorderRadius(r.id)}
                  className={cn(
                    'p-2.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                    borderRadius === r.id
                      ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                  )}
                  style={{
                    borderRadius: r.id === 'sharp' ? '4px' : r.id === 'pill' ? '20px' : '12px',
                  }}
                >
                  <span className="font-bold text-xs leading-none">{r.label}</span>
                  <span
                    className={cn(
                      'text-[9.5px] font-medium',
                      borderRadius === r.id ? 'text-zinc-300' : 'text-zinc-400'
                    )}
                  >
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shadows */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Profundidad y Sombras
              </h3>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                Nivel de relieve en tarjetas de productos
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'flat' as const, label: 'Plana', desc: 'Sin sombra' },
                { id: 'soft' as const, label: 'Sutil', desc: 'Sombra limpia' },
                { id: 'floating' as const, label: 'Flotante', desc: 'Alto relieve' },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShadowStyle(s.id)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                    shadowStyle === s.id
                      ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                  )}
                >
                  <span className="font-bold text-xs leading-none">{s.label}</span>
                  <span
                    className={cn(
                      'text-[9.5px] font-medium',
                      shadowStyle === s.id ? 'text-zinc-300' : 'text-zinc-400'
                    )}
                  >
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Tipografía de la Tienda
              </h3>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                Fuente tipográfica aplicada en titulares, precios y botones
              </p>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  id: 'Plus Jakarta Sans',
                  name: 'Plus Jakarta Sans',
                  category: 'DTC Flagship',
                  desc: 'Moderna, técnica y ultra legible',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                },
                {
                  id: 'Outfit',
                  name: 'Outfit',
                  category: 'Geométrica',
                  desc: 'Limpia y balanceada para marcas contemporáneas',
                  fontFamily: "'Outfit', sans-serif",
                },
                {
                  id: 'Inter',
                  name: 'Inter',
                  category: 'Suiza Neutral',
                  desc: 'Clásica, sobria y de máxima claridad',
                  fontFamily: "'Inter', sans-serif",
                },
                {
                  id: 'Sora',
                  name: 'Sora',
                  category: 'Tech & Digital',
                  desc: 'Curvas nítidas para gadgets y tecnología',
                  fontFamily: "'Sora', sans-serif",
                },
                {
                  id: 'DM Sans',
                  name: 'DM Sans',
                  category: 'Lifestyle',
                  desc: 'Redondeada y cálida para moda o bienestar',
                  fontFamily: "'DM Sans', sans-serif",
                },
                {
                  id: 'Manrope',
                  name: 'Manrope',
                  category: 'Grotesk',
                  desc: 'Gran impacto visual en titulares y precios',
                  fontFamily: "'Manrope', sans-serif",
                },
                {
                  id: 'Space Grotesk',
                  name: 'Space Grotesk',
                  category: 'Streetwear',
                  desc: 'Vanguardista y audaz para marcas urbanas',
                  fontFamily: "'Space Grotesk', monospace, sans-serif",
                },
                {
                  id: 'Playfair Display',
                  name: 'Playfair Display',
                  category: 'Serif Lujo',
                  desc: 'Elegancia editorial para joyería, café y cosmética',
                  fontFamily: "'Playfair Display', serif",
                },
                {
                  id: 'Cormorant Garamond',
                  name: 'Cormorant Garamond',
                  category: 'Artesanal',
                  desc: 'Serif clásica para marcas de autor',
                  fontFamily: "'Cormorant Garamond', serif",
                },
              ].map(font => {
                const isSelected = typography === font.id
                return (
                  <div
                    key={font.id}
                    onClick={() => setTypography(font.id)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50 shadow-2xs ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    )}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-xs text-zinc-950"
                          style={{ fontFamily: font.fontFamily }}
                        >
                          {font.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {font.category}
                        </span>
                      </div>
                      <span className="text-[10.5px] font-medium text-zinc-500 block leading-snug">
                        {font.desc}
                      </span>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-zinc-950 shrink-0 ml-2" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0 ml-2 group-hover:border-zinc-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PLANTILLAS IA (BLUEPRINTS) */}
      {subTab === 'plantillas' && (
        <div className="animate-in fade-in duration-150">
          <PlantillasTab form={form} />
        </div>
      )}
    </div>
  )
}
