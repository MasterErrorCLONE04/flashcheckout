'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocSection } from './types'

interface DocSidebarProps {
  activeSlug: string
  filteredSections: DocSection[]
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onViewChange: (id: string) => void
}

export function DocSidebar({
  activeSlug,
  filteredSections,
  searchTerm,
  onSearchTermChange,
  onViewChange,
}: DocSidebarProps) {
  return (
    <aside className="w-full md:w-[300px] h-auto md:h-full border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md overflow-y-auto px-6 py-8 z-40 shrink-0">
      <div className="mb-8">
        <DocBrand />
        <DocSearch value={searchTerm} onChange={onSearchTermChange} />
        <nav className="space-y-7">
          {filteredSections.map(group => (
            <DocNavGroup
              key={group.id}
              activeSlug={activeSlug}
              group={group}
              onViewChange={onViewChange}
            />
          ))}
        </nav>
      </div>
    </aside>
  )
}

function DocBrand() {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center shadow-md shadow-emerald-950/40">
          <Zap className="w-4.5 h-4.5 text-white fill-current" />
        </div>
        <span className="font-bold text-base tracking-tight text-white">
          Flash<span className="text-[#10B981]">Doc</span>
        </span>
      </Link>
      <div className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-0.5 flex items-center h-fit">
        <span className="text-[9px] font-black tracking-wider text-[#10B981] uppercase whitespace-nowrap">
          v2.0 Pro
        </span>
      </div>
    </div>
  )
}

function DocSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative mb-6 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#10B981] transition-colors" />
      <input
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Buscar documentación..."
        className="w-full h-10 pl-11 pr-4 bg-zinc-900/60 border border-zinc-850 rounded-lg text-xs font-semibold tracking-tight focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all placeholder:text-zinc-500 text-white"
      />
    </div>
  )
}

function DocNavGroup({
  activeSlug,
  group,
  onViewChange,
}: {
  activeSlug: string
  group: DocSection
  onViewChange: (id: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-[10px] font-black text-zinc-500 tracking-widest px-2.5 uppercase">
        {group.label}
      </h4>
      <div className="space-y-1">
        {group.items.map(item => {
          const isActive = activeSlug === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center px-3.5 py-2.5 rounded-lg text-xs transition-all duration-200 border text-left cursor-pointer font-bold',
                isActive
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function BackToDashboardButton() {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Link
        href="/dashboard"
        className="w-12 h-12 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200"
        title="Volver al Panel"
      >
        <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5px]" />
      </Link>
    </div>
  )
}

