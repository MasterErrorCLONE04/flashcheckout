import * as React from 'react'
import { cn } from '@/lib/utils'

export interface KpiStatCardProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  iconClassName?: string
  className?: string
}

export function KpiStatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  className,
}: KpiStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-5 bg-white border border-zinc-200/90 flex items-center justify-between gap-4 transition-all duration-200 hover:border-zinc-300',
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        <p className="text-[11px] font-semibold tracking-wide text-zinc-500 truncate">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums leading-none">
          {value}
        </p>
        {hint && (
          <div className="text-[11px] font-medium text-zinc-400 truncate">
            {hint}
          </div>
        )}
      </div>

      {Icon && (
        <div
          className={cn(
            'w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shrink-0 text-zinc-500',
            iconClassName
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}

