'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TabId } from './types'

interface DescuentosTabsProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  totalCount: number
  activeCount: number
  scheduledCount: number
  inactiveCount: number
}

export function DescuentosTabs({
  activeTab,
  onSelectTab,
  totalCount,
  activeCount,
  scheduledCount,
  inactiveCount,
}: DescuentosTabsProps) {
  const tabs = [
    { id: 'Todas' as const, label: 'Todas', count: totalCount },
    { id: 'Activas' as const, label: 'Activas', count: activeCount },
    { id: 'Programadas' as const, label: 'Programadas', count: scheduledCount },
    { id: 'Inactivas' as const, label: 'Inactivas', count: inactiveCount },
  ]

  return (
    <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === tab.id 
              ? 'border-zinc-900 text-zinc-900' 
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          {tab.label}
          <span className={cn(
            "px-1.5 py-0.2 rounded text-[10px] font-extrabold",
            activeTab === tab.id ? "bg-zinc-100 border border-zinc-200 text-zinc-800" : "bg-zinc-100 text-zinc-500"
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}
