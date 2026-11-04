'use client'

import React from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionDetailHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ElementType
  onBack: () => void
  isEnabled?: boolean
  onToggleEnabled?: () => void
  isAlwaysOn?: boolean
}

export function SectionDetailHeader({
  title,
  subtitle,
  icon: Icon,
  onBack,
  isEnabled = true,
  onToggleEnabled,
  isAlwaysOn = false,
}: SectionDetailHeaderProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-xs mb-4 text-left select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer border-0 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>

        {/* Section Title & Icon */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          {Icon && <Icon className="w-4 h-4 text-zinc-700 shrink-0" />}
          <div className="min-w-0 text-center">
            <h3 className="text-xs font-extrabold text-zinc-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-zinc-400 truncate leading-none">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Visibility Switch */}
        {!isAlwaysOn && onToggleEnabled ? (
          <button
            type="button"
            onClick={onToggleEnabled}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 shrink-0',
              isEnabled
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            )}
            title={isEnabled ? 'Sección visible en la tienda' : 'Sección oculta en la tienda'}
          >
            {isEnabled ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Oculta</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md shrink-0">
            Fijo
          </span>
        )}
      </div>
    </div>
  )
}

