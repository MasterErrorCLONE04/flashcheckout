'use client'

import React from 'react'
import { Download, Plus } from 'lucide-react'

interface DescuentosHeaderProps {
  onExport: () => void
  onOpenCreate: () => void
}

export function DescuentosHeader({ onExport, onOpenCreate }: DescuentosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Descuentos</h1>
        <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          Crea y gestiona descuentos y cupones para tu negocio.
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none"
        >
          <Download className="w-4 h-4 text-zinc-450" />
          Exportar
        </button>
        <button 
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none active:scale-98 cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          Nuevo descuento
        </button>
      </div>
    </div>
  )
}
