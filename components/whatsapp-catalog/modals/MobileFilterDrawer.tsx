'use client'

import React from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CatalogSort } from '../types'

export interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  device?: string
  sortBy: CatalogSort
  setSortBy: (sort: CatalogSort) => void
  onlyInStock: boolean
  setOnlyInStock: React.Dispatch<React.SetStateAction<boolean>>
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  device,
  sortBy,
  setSortBy,
  onlyInStock,
  setOnlyInStock,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'inset-0 z-50 flex items-end justify-center lg:hidden',
        device ? 'absolute' : 'fixed'
      )}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity',
          device ? 'absolute' : 'fixed'
        )}
      />
      {/* Sheet Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[12px] shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAE8] pb-3">
          <h3 className="text-[15px] font-extrabold text-[#111111] tracking-[-0.02em]">
            Ordenar y filtrar
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F6F6F4] flex items-center justify-center text-[#111111] cursor-pointer border-0 bg-transparent"
          >
            <X className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Sort Options */}
        <div className="space-y-2.5 text-left">
          <h4 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#71717A]">
            Ordenar por
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'default', label: 'Más populares' },
              { value: 'price-asc', label: 'Menor precio' },
              { value: 'price-desc', label: 'Mayor precio' },
              { value: 'name-asc', label: 'Nombre A - Z' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value as CatalogSort)}
                className={cn(
                  'py-2.5 px-3 rounded-[4px] border text-[11.5px] font-semibold text-center cursor-pointer transition-all',
                  sortBy === opt.value
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#E5E5E3] bg-[#F6F6F4] text-[#111111]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Options */}
        <div className="space-y-2.5 text-left">
          <h4 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#71717A]">
            Disponibilidad
          </h4>
          <button
            type="button"
            onClick={() => setOnlyInStock(prev => !prev)}
            className={cn(
              'w-full flex items-center justify-between py-2.5 px-3.5 rounded-[4px] border text-xs font-semibold cursor-pointer transition-all',
              onlyInStock
                ? 'border-[#111111] bg-[#F6F6F4] text-[#111111]'
                : 'border-[#E5E5E3] bg-white text-[#52525B]'
            )}
          >
            <span>Mostrar solo productos disponibles</span>
            <div
              className={cn(
                'w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all',
                onlyInStock
                  ? 'bg-[#111111] border-[#111111] text-white'
                  : 'border-zinc-300 bg-white'
              )}
            >
              {onlyInStock && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 bg-[#111111] text-white rounded-full text-[11.5px] font-bold uppercase tracking-[0.08em] active:scale-[0.99] transition-all cursor-pointer border-0"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  )
}
