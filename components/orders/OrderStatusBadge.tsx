'use client'

import { cn } from '@/lib/utils'
import { STATUS_OPTIONS } from './types'

export function StatusBadge({
  status,
  isSelected = false,
}: {
  status: string
  isSelected?: boolean
}) {
  const option = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]
  return (
    <span
      className={cn(
        'text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md border inline-block leading-none',
        isSelected ? 'text-white bg-white/10 border-white/20' : option.color
      )}
    >
      {option.label}
    </span>
  )
}

export function FilterTab({
  label,
  active,
  count,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl text-[9px] font-extrabold tracking-wider whitespace-nowrap transition-all border active:scale-95 cursor-pointer',
        active
          ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
          : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50'
      )}
    >
      {label}
      <span
        className={cn(
          'px-1.5 py-0.5 rounded-md font-extrabold min-w-[16px] text-center text-[8px]',
          active ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
        )}
      >
        {count}
      </span>
    </button>
  )
}

