'use client'

import { cn } from '@/lib/utils'
import { STATUS_OPTIONS } from './types'

export function StatusBadge({
  status,
  paymentStatus,
  isSelected = false,
}: {
  status: string
  paymentStatus?: string
  isSelected?: boolean
}) {
  let effectiveStatus = status
  if (
    (status === 'pending' || status === 'pending_payment') &&
    (paymentStatus === 'PAID' || paymentStatus === 'CONFIRMED')
  ) {
    effectiveStatus = 'paid'
  } else if (
    (status === 'pending' || status === 'pending_payment') &&
    paymentStatus === 'UPLOADED'
  ) {
    effectiveStatus = 'payment_review'
  }

  const option =
    STATUS_OPTIONS.find(s => s.value === effectiveStatus) ?? STATUS_OPTIONS[0]

  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 leading-none whitespace-nowrap',
        isSelected ? 'text-white bg-white/15 border-white/20' : option.color
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
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-md text-[11px] font-bold whitespace-nowrap transition-all border-0 cursor-pointer',
        active
          ? 'bg-white text-zinc-950 shadow-2xs'
          : 'bg-transparent text-zinc-500 hover:text-zinc-900'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'px-1.5 py-0.2 rounded text-[9.5px] font-extrabold tabular-nums',
          active ? 'bg-zinc-950 text-white' : 'bg-zinc-200/70 text-zinc-600'
        )}
      >
        {count}
      </span>
    </button>
  )
}
