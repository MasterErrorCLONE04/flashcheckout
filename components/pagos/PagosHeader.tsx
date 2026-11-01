'use client'

import { Download } from 'lucide-react'

interface PagosHeaderProps {
  onExport: () => void
}

export function PagosHeader({ onExport }: PagosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-955">Pagos</h1>
        <p className="text-xs xl:text-sm font-semibold text-zinc-400">Gestiona y supervisa todos los pagos de tu negocio.</p>
      </div>
      <button 
        onClick={onExport} 
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none self-end sm:self-auto"
      >
        <Download className="w-4 h-4 text-zinc-450" />
        Exportar
      </button>
    </div>
  )
}
