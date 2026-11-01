import React from 'react'
import { WeeklySalesAreaChart, SalesChannelDonut } from '@/components/DashboardCharts'
import { DashboardStats } from './types'

interface DashboardChartsSectionProps {
  stats: DashboardStats
  chartData: any[]
}

export function DashboardChartsSection({ stats, chartData }: DashboardChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Chart 1: Ventas últimos 7 días */}
      <div className="md:col-span-7 p-5 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between h-[340px]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Ventas últimos 7 días</h4>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
            <span>${stats.totalRevenueVal.toLocaleString('es-CO')}</span>
            <span className="text-[10px]">▲ {stats.revenueGrowth.toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex-1 w-full h-full mt-4 min-h-[220px]">
          <WeeklySalesAreaChart data={chartData.map(d => ({ date: d.date, value: d.total }))} />
        </div>
      </div>

      {/* Chart 2: Ventas por canal (Donut) */}
      <div className="md:col-span-5 p-5 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between h-[340px]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Ventas por canal</h4>
        </div>

        <div className="h-40 w-full relative flex items-center justify-center">
          <SalesChannelDonut whatsappTotal={stats.whatsappTotalVal} webTotal={stats.webTotalVal} />
        </div>

        <div className="space-y-1.5 text-[11px] font-semibold text-zinc-500 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>WhatsApp</span>
            </div>
            <span className="text-zinc-900 font-bold">
              {stats.totalRevenueVal > 0 ? Math.round((stats.whatsappTotalVal / stats.totalRevenueVal) * 100) : 0}% (${stats.whatsappTotalVal.toLocaleString('es-CO')})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-900" />
              <span>Tienda Web y Enlaces</span>
            </div>
            <span className="text-zinc-900 font-bold">
              {stats.totalRevenueVal > 0 ? Math.round((stats.webTotalVal / stats.totalRevenueVal) * 100) : 0}% (${stats.webTotalVal.toLocaleString('es-CO')})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
