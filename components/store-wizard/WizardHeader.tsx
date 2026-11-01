'use client'

import React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import CustomUserMenu from '@/components/dashboard/CustomUserMenu'
import { STEPS, StepType } from './types'

interface WizardHeaderProps {
  currentStep: number
  currentStepData: StepType
}

export function WizardHeader({ currentStep, currentStepData }: WizardHeaderProps) {
  return (
    <header className="h-14 w-full shrink-0 items-center justify-between border-b border-zinc-200/80 bg-[#FAFAFA] px-6 sticky top-0 z-40 flex">
      {/* Brand & Setup Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center shadow-xs">
          <Zap className="h-4.5 w-4.5 text-white fill-current" />
        </div>
        
        <span className="text-zinc-300 font-light select-none">/</span>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-950 tracking-tight">Flashcheckouts</span>
          <span className="text-zinc-300 font-light select-none">/</span>
          <span className="text-xs font-semibold text-zinc-500">Configuración de Tienda</span>
        </div>
      </div>

      {/* Center: Dynamic Step Timeline Pills */}
      <div className="hidden md:flex items-center gap-1.5 select-none bg-white border border-zinc-200/80 py-1.5 px-3 rounded-full shadow-2xs">
        <div className="flex items-center gap-1 mr-2">
          {STEPS.map((s) => {
            const isPast = s.num < currentStep
            const isCurrent = s.num === currentStep
            return (
              <div
                key={s.num}
                title={`${s.num}. ${s.label}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isCurrent ? "w-6 bg-zinc-950" : isPast ? "w-2.5 bg-emerald-500" : "w-1.5 bg-zinc-200"
                )}
              />
            )
          })}
        </div>
        <span className="text-[11px] font-bold text-zinc-900 tracking-tight">
          Paso {currentStep} de 8
        </span>
        <span className="text-zinc-300 text-xs">•</span>
        <span className="text-[11px] font-semibold text-zinc-500 truncate max-w-[140px]">
          {currentStepData.shortLabel}
        </span>
      </div>

      {/* Right Status & User Menu */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Guardado automático</span>
        </div>

        <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

        <CustomUserMenu />
      </div>
    </header>
  )
}
