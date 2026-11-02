'use client'

import {
  ShoppingBag,
  Download,
  Clock,
  CheckCircle,
  CalendarDays,
  Route,
  WalletCards,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KpiStatCard } from '@/components/ui/kpi-stat-card'
import { formatCurrency } from './types'

export function OrderEmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh] w-full animate-in fade-in duration-300">
      <div className="text-center py-20 px-8 premium-card rounded-lg border-dashed border-zinc-200 bg-white/50 max-w-md w-full shadow-none">
        <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-base font-semibold text-zinc-950 tracking-tight">
          Sin pedidos
        </h3>
        <p className="text-zinc-500 text-xs font-medium mt-2 leading-relaxed">
          Tus pedidos aparecerán aquí automáticamente en tiempo real.
        </p>
      </div>
    </div>
  )
}

interface OrderHeaderAndKpisProps {
  totalRevenue: number
  pendingCount: number
  shippedCount: number
  deliveredCount: number
  onExportCsv: () => void
}

export function OrderHeaderAndKpis({
  totalRevenue,
  pendingCount,
  shippedCount,
  deliveredCount,
  onExportCsv,
}: OrderHeaderAndKpisProps) {
  return (
    <>
      <PageHeader
        title="Listado de Pedidos"
        statusDot="emerald"
        subtitle="Monitoreo y gestión de pedidos en tiempo real."
        actions={
          <>
            <Badge variant="outline" className="h-9 px-3.5 rounded-lg text-xs font-semibold gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
              <span>Hoy</span>
            </Badge>
            <Button variant="outline" onClick={onExportCsv}>
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Exportar ventas</span>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          label="Ventas netas"
          value={formatCurrency(totalRevenue)}
          hint="Pedidos no cancelados"
          icon={WalletCards}
        />
        <KpiStatCard
          label="Pedidos nuevos"
          value={pendingCount}
          hint="Esperando confirmación"
          icon={Clock}
        />
        <KpiStatCard
          label="En reparto"
          value={shippedCount}
          hint="Despacho activo"
          icon={Route}
        />
        <KpiStatCard
          label="Entregados"
          value={deliveredCount}
          hint="Cerrados correctamente"
          icon={CheckCircle}
        />
      </div>
    </>
  )
}
