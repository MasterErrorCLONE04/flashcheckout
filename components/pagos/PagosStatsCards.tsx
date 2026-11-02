'use client'

import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface PagosStatsCardsProps {
  totalVolume: number
  countExitosos: number
  countPendientes: number
  countFallidos: number
  formatCurrency: (val: number) => string
}

export function PagosStatsCards({
  totalVolume,
  countExitosos,
  countPendientes,
  countFallidos,
  formatCurrency,
}: PagosStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Volumen total */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Volumen total</span>
            <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
          </div>
          <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">
            ${formatCurrency(totalVolume)}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 mt-1 select-none">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>15% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
          </div>
        </div>
      </div>

      {/* Pagos exitosos */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Pagos exitosos</span>
            <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
          </div>
          <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">
            {countExitosos}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 mt-1 select-none">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>14% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
          </div>
        </div>
      </div>

      {/* Pagos pendientes */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Pagos pendientes</span>
            <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
          </div>
          <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">
            {countPendientes}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 mt-1 select-none">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>8% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
          </div>
        </div>
      </div>

      {/* Pagos fallidos */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-4 flex items-start gap-3.5 transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Pagos fallidos</span>
            <span className="text-[10px] font-bold text-zinc-300 leading-none">ⓘ</span>
          </div>
          <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight block leading-none">
            {countFallidos}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 mt-1 select-none">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>25% <span className="text-zinc-400 font-semibold">vs el mes pasado</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
