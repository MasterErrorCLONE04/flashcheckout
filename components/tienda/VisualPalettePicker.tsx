'use client'

import React from 'react'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PalettePreset {
  id: string
  name: string
  desc: string
  colors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
  typography: string
}

export const VISUAL_PALETTES: PalettePreset[] = [
  {
    id: 'minimalist-luxe',
    name: 'Minimalist Luxe',
    desc: 'Blanco puro, contraste nítido y acento esmeralda refinado.',
    colors: {
      primario: '#111111',
      secundario: '#52525B',
      acento: '#10B981',
      fondo: '#FFFFFF',
      texto: '#111111',
    },
    typography: 'Plus Jakarta Sans',
  },
  {
    id: 'cafe-origen',
    name: 'Café de Origen',
    desc: 'Tonos tierra tostados, crema suave y verde bosque artesanal.',
    colors: {
      primario: '#4A2E18',
      secundario: '#2D1C10',
      acento: '#1B4D3E',
      fondo: '#FAF7F2',
      texto: '#2D1C10',
    },
    typography: 'Cormorant Garamond',
  },
  {
    id: 'midnight-street',
    name: 'Midnight Streetwear',
    desc: 'Negro mate profundo, grafito y acento neón contemporáneo.',
    colors: {
      primario: '#09090B',
      secundario: '#27272A',
      acento: '#E2F952',
      fondo: '#09090B',
      texto: '#FAFAFA',
    },
    typography: 'Sora',
  },
  {
    id: 'botanical-beauty',
    name: 'Botanical Beauty',
    desc: 'Rosa cuarzo luminoso, blanco lino y acento verde salvia natural.',
    colors: {
      primario: '#1E293B',
      secundario: '#64748B',
      acento: '#F472B6',
      fondo: '#FFFDF9',
      texto: '#0F172A',
    },
    typography: 'Outfit',
  },
  {
    id: 'terracotta-warm',
    name: 'Terracota Cálido',
    desc: 'Arena cálido, arcilla tostada y atmósfera artesanal acogedora.',
    colors: {
      primario: '#9C4124',
      secundario: '#442218',
      acento: '#D97706',
      fondo: '#FDFBF7',
      texto: '#331B14',
    },
    typography: 'Manrope',
  },
  {
    id: 'cyber-tech',
    name: 'Cyber Tech',
    desc: 'Estética de producto digital, acentos azul cobalto y tipografía técnica.',
    colors: {
      primario: '#0284C7',
      secundario: '#1E293B',
      acento: '#38BDF8',
      fondo: '#FFFFFF',
      texto: '#0F172A',
    },
    typography: 'Space Grotesk',
  },
]

interface VisualPalettePickerProps {
  currentColors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
  onSelectPalette: (palette: PalettePreset) => void
}

export function VisualPalettePicker({
  currentColors,
  onSelectPalette,
}: VisualPalettePickerProps) {
  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
          Paletas de Color de Diseñador (1-Clic)
        </h3>
      </div>
      <p className="text-[11px] text-zinc-400 font-medium leading-none">
        Cambia al instante la paleta completa de tu tienda con colores armónicos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {VISUAL_PALETTES.map(p => {
          const isSelected =
            currentColors.primario.toLowerCase() === p.colors.primario.toLowerCase() &&
            currentColors.fondo.toLowerCase() === p.colors.fondo.toLowerCase()

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPalette(p)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5',
                isSelected
                  ? 'border-zinc-950 bg-zinc-900 text-white shadow-xs'
                  : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900 hover:shadow-xs'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold truncate">{p.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </div>

              {/* Color Swatch Circles */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                  style={{ backgroundColor: p.colors.primario }}
                  title="Color primario"
                />
                <div
                  className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                  style={{ backgroundColor: p.colors.acento }}
                  title="Color acento"
                />
                <div
                  className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                  style={{ backgroundColor: p.colors.fondo }}
                  title="Fondo"
                />
                <div
                  className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                  style={{ backgroundColor: p.colors.texto }}
                  title="Texto"
                />
              </div>

              <span className={cn('text-[10px] leading-tight line-clamp-2', isSelected ? 'text-zinc-400' : 'text-zinc-400')}>
                {p.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

