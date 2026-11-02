'use client'

import { User, Calendar, DollarSign, Award } from 'lucide-react'
import { KpiStatCard } from '@/components/ui/kpi-stat-card'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiStatCard
        label="Clientes totales"
        value={totalUniqueCustomers.toLocaleString('es-CO')}
        hint="Perfiles y compradores reales"
        icon={User}
      />
      <KpiStatCard
        label="Clientes activos (30 días)"
        value={active30Days.toLocaleString('es-CO')}
        hint="Interacción en los últimos 30 días"
        icon={Calendar}
      />
      <KpiStatCard
        label="Ingresos de clientes"
        value={`$${totalLtvSum.toLocaleString('es-CO')}`}
        hint="Suma de pedidos guardados"
        icon={DollarSign}
      />
      <KpiStatCard
        label="Valor promedio por cliente"
        value={`$${avgLtv.toLocaleString('es-CO')}`}
        hint="Ingresos divididos por cliente"
        icon={Award}
      />
    </div>
  )
}
