import React from 'react'
import {
  Ticket,
  CheckCircle,
  Calendar,
  XCircle,
  RotateCcw,
} from 'lucide-react'

interface DescuentosStatsCardsProps {
  totalCount: number
  activeCount: number
  scheduledCount: number
  inactiveCount: number
  totalUses: number
}

export function DescuentosStatsCards({
  totalCount,
  activeCount,
  scheduledCount,
  inactiveCount,
  totalUses,
}: DescuentosStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Total Coupons */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Descuentos totales</span>
          <span className="text-xl xl:text-2xl font-black text-zinc-950 tracking-tight mt-1.5 block leading-none">{totalCount}</span>
          <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">Todos los descuentos</span>
        </div>
      </div>

      {/* Active Coupons */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Activos</span>
          <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{activeCount}</span>
          <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">
            {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% del total
          </span>
        </div>
      </div>

      {/* Scheduled Coupons */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Programados</span>
          <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{scheduledCount}</span>
          <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">
            {totalCount > 0 ? Math.round((scheduledCount / totalCount) * 100) : 0}% del total
          </span>
        </div>
      </div>

      {/* Inactive Coupons */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Inactivos</span>
          <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{inactiveCount}</span>
          <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">
            {totalCount > 0 ? Math.round((inactiveCount / totalCount) * 100) : 0}% del total
          </span>
        </div>
      </div>

      {/* Total Uses */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex items-start gap-3.5 hover:shadow-none transition-all col-span-2 md:col-span-1">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
          <RotateCcw className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block tracking-wider leading-none">Usos totales</span>
          <span className="text-xl xl:text-2xl font-black text-zinc-955 tracking-tight mt-1.5 block leading-none">{totalUses.toLocaleString('es-CO')}</span>
          <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">En todos los descuentos</span>
        </div>
      </div>
    </div>
  )
}
