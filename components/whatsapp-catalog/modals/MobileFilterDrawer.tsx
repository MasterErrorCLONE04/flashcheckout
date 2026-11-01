'use client'

import React from 'react'
import { X, Check } from 'lucide-react'
import { cn } from "@/lib/utils"
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
  setOnlyInStock
}: MobileFilterDrawerProps) {
  if (!isOpen) return null

  return (
    <div className={cn("inset-0 z-50 flex items-end justify-center lg:hidden", !!device ? "absolute" : "fixed")}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={cn("inset-0 bg-black/40 backdrop-blur-sm transition-opacity", !!device ? "absolute" : "fixed")}
      />
      {/* Sheet Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Ordenar y Filtrar</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-650 cursor-pointer border-none bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sort Options */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-zinc-800">Ordenar por</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'default', label: 'Destacados' },
              { value: 'price-asc', label: 'Menor precio' },
              { value: 'price-desc', label: 'Mayor precio' },
              { value: 'name-asc', label: 'Nombre A-Z' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value as CatalogSort)}
                className={cn(
                  "py-2.5 px-3 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition-all active:scale-[0.97]",
                  sortBy === opt.value
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Options */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-zinc-800">Disponibilidad</h4>
          <button
            onClick={() => setOnlyInStock(prev => !prev)}
            className={cn(
              "w-full flex items-center justify-between py-2.5 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all",
              onlyInStock
                ? "border-emerald-600 bg-emerald-50/50 text-emerald-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
            )}
          >
            <span>Mostrar solo productos en stock</span>
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              onlyInStock ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-300 bg-white"
            )}>
              {onlyInStock && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Apply Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-none active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  )
}
