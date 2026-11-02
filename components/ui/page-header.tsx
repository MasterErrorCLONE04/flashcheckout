import * as React from 'react'
import { cn } from '@/lib/utils'

export type PageStatusTone = 'emerald' | 'zinc' | 'amber' | 'none'

export interface PageHeaderProps {
  title: string
  subtitle?: React.ReactNode
  statusDot?: PageStatusTone
  badge?: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

const DOT_TONES: Record<Exclude<PageStatusTone, 'none'>, string> = {
  emerald: 'bg-emerald-500',
  zinc: 'bg-zinc-400',
  amber: 'bg-amber-500',
}

export function PageHeader({
  title,
  subtitle,
  statusDot = 'emerald',
  badge,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-10 h-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <div className="text-xs font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              {statusDot !== 'none' && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0 animate-pulse',
                    DOT_TONES[statusDot]
                  )}
                />
              )}
              <span className="leading-relaxed">{subtitle}</span>
            </div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  )
}

export interface PageTabItem<T extends string = string> {
  id: T
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  count?: number
  badge?: string
}

export interface PageTabsProps<T extends string = string> {
  tabs: ReadonlyArray<PageTabItem<T>>
  activeTab: T
  onTabChange: (tab: T) => void
  accent?: 'zinc' | 'emerald'
  className?: string
}

export function PageTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  accent = 'zinc',
  className,
}: PageTabsProps<T>) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap select-none',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5',
              isActive
                ? accent === 'emerald'
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums leading-none',
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-500'
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600 leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

