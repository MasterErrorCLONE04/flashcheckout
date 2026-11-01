'use client'

import { User, Calendar, DollarSign, Award } from 'lucide-react'

interface CustomerKpiCardsProps {
  totalUniqueCustomers: number
  active30Days: number
  totalLtvSum: number
  avgLtv: number
}

export function CustomerKpiCards({
  totalUniqueCustomers,
  active30Days,
  totalLtvSum,
  avgLtv,
}: CustomerKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Total Customers */}
      <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Clientes totales</span>
          <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">{totalUniqueCustomers.toLocaleString('es-CO')}</h3>
          <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
            <span>Perfiles y compradores reales</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
          <User className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Active Customers */}
      <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Clientes activos (30 días)</span>
          <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">{active30Days.toLocaleString('es-CO')}</h3>
          <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
            <span>Interaccion en los ultimos 30 dias</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Total Revenue */}
      <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Ingresos de clientes</span>
          <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">${totalLtvSum.toLocaleString('es-CO')}</h3>
          <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
            <span>Suma de pedidos guardados</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Avg Customer LTV */}
      <div className="premium-card p-5.5 bg-white border border-zinc-200/80 rounded-lg flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider  block">Valor promedio por cliente</span>
          <h3 className="text-xl font-bold text-zinc-955 tracking-tight tabular-nums">${avgLtv.toLocaleString('es-CO')}</h3>
          <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
            <span>Ingresos divididos por cliente</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
          <Award className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

