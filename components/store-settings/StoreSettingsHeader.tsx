'use client'

import React from 'react'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TABS, TabId } from './constants'

interface StoreSettingsHeaderProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onSubmit: () => void
  loading: boolean
}

export function StoreSettingsHeader({
  activeTab,
  onTabChange,
  onSubmit,
  loading,
}: StoreSettingsHeaderProps) {
  return (
    <>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Configuración</h1>
          <p className="text-[12px] font-medium text-zinc-500 mt-1">Administra los ajustes generales de tu negocio.</p>
        </div>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold shadow-none border border-zinc-950 transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Guardar cambios</span>
        </button>
      </div>

      {/* ── Tab Navigation ────────────────────────────────── */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6 select-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabId)}
            className={cn(
              "pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0",
              activeTab === tab.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )
}
