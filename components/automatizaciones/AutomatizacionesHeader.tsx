'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutomationFilterTab } from './types'

interface AutomatizacionesHeaderProps {
  filterTab: AutomationFilterTab
  onSelectTab: (tab: AutomationFilterTab) => void
  totalCount: number
  activeCount: number
  inactiveCount: number
  onOpenCreate: () => void
}

export function AutomatizacionesHeader({
  filterTab,
  onSelectTab,
  totalCount,
  activeCount,
  inactiveCount,
  onOpenCreate,
}: AutomatizacionesHeaderProps) {
  return (
    <>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Automatizaciones</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            Activa y gestiona las automatizaciones de tu negocio.
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none select-none shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva automatización</span>
        </button>
      </div>

      {/* Grid tabs row */}
      <div className="flex gap-1 border-b border-zinc-150 pb-px text-[11px] font-bold text-zinc-500">
        <button
          onClick={() => onSelectTab('all')}
          className={cn(
            'pb-2.5 px-2 relative transition-colors shrink-0 cursor-pointer',
            filterTab === 'all' ? 'text-zinc-900 font-extrabold' : 'hover:text-zinc-900'
          )}
        >
          Todas{' '}
          <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">
            {totalCount}
          </span>
          {filterTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('active')}
          className={cn(
            'pb-2.5 px-2 relative transition-colors shrink-0 cursor-pointer',
            filterTab === 'active' ? 'text-zinc-900 font-extrabold' : 'hover:text-zinc-900'
          )}
        >
          Activas{' '}
          <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">
            {activeCount}
          </span>
          {filterTab === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => onSelectTab('inactive')}
          className={cn(
            'pb-2.5 px-2 relative transition-colors shrink-0 cursor-pointer',
            filterTab === 'inactive' ? 'text-zinc-900 font-extrabold' : 'hover:text-zinc-900'
          )}
        >
          Inactivas{' '}
          <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">
            {inactiveCount}
          </span>
          {filterTab === 'inactive' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
          )}
        </button>
      </div>
    </>
  )
}

