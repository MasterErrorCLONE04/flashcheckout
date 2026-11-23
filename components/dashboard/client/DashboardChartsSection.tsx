'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  StackedBarChart,
  WeeklySalesAreaChart,
  SalesChannelDonut,
} from '@/components/DashboardCharts'
import { BarChart3, TrendingUp, ShieldCheck, AlertTriangle, Truck, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardStats } from './types'

interface DashboardChartsSectionProps {
  stats: DashboardStats
  chartData: any[]
}

export function DashboardChartsSection({ stats, chartData }: DashboardChartsSectionProps) {
  const [chartType, setChartType] = useState<'stacked' | 'area'>('stacked')

  const periodTotal = chartData.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
  const whatsappPct =
    stats.totalRevenueVal > 0
      ? Math.round((stats.whatsappTotalVal / stats.totalRevenueVal) * 100)
      : 0
  const webPct = stats.totalRevenueVal > 0 ? 100 - whatsappPct : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT (8 COLS): Evolución Comercial */}
      <div className="lg:col-span-8 p-5 rounded-2xl border border-zinc-200 bg-white flex flex-col justify-between min-h-[340px] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Evolución de Ingresos
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold tabular-nums">
                ${periodTotal.toLocaleString('es-CO')} en el periodo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Desglose diario de ventas confirmadas por Tienda Web y WhatsApp IA
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[10.5px] font-bold text-zinc-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-zinc-900" />
                Web
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-zinc-400" />
                WhatsApp
              </span>
            </div>

            {/* Chart Type Switcher */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
              <button
                type="button"
                onClick={() => setChartType('stacked')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border-0',
                  chartType === 'stacked'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Canales</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border-0',
                  chartType === 'area'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Curva</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-[240px] mt-4">
          {chartType === 'stacked' ? (
            <StackedBarChart data={chartData} />
          ) : (
            <WeeklySalesAreaChart
              data={chartData.map(d => ({ date: d.date, value: d.total }))}
            />
          )}
        </div>
      </div>

      {/* RIGHT (4 COLS): Distribución por Canal & Pulso Operativo */}
      <div className="lg:col-span-4 p-5 rounded-2xl border border-zinc-200 bg-white flex flex-col justify-between min-h-[340px] shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Canales & Operación
            </h4>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Participación de ventas y estado operativo
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 tabular-nums">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Salud {stats.healthScore}/100
          </span>
        </div>

        <div className="h-36 w-full relative flex items-center justify-center my-1">
          <SalesChannelDonut
            whatsappTotal={stats.whatsappTotalVal}
            webTotal={stats.webTotalVal}
          />
        </div>

        {/* Channel Bars */}
        <div className="space-y-2 text-[11px] font-semibold text-zinc-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-950" />
              <span>Tienda Web & Enlaces</span>
            </div>
            <span className="text-zinc-950 font-bold tabular-nums">
              {webPct}% (${stats.webTotalVal.toLocaleString('es-CO')})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>WhatsApp Bot IA</span>
            </div>
            <span className="text-zinc-950 font-bold tabular-nums">
              {whatsappPct}% (${stats.whatsappTotalVal.toLocaleString('es-CO')})
            </span>
          </div>
        </div>

        {/* Operational Counters Row */}
        <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-zinc-100">
          <Link
            href="/verificaciones"
            className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-center transition-colors"
          >
            <div className="flex items-center justify-center gap-1 text-zinc-950 font-black text-xs tabular-nums">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>{stats.pendingProofsCount}</span>
            </div>
            <span className="text-[9.5px] font-bold text-zinc-500 block mt-0.5 truncate">
              Por validar
            </span>
          </Link>

          <Link
            href="/pedidos"
            className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-center transition-colors"
          >
            <div className="flex items-center justify-center gap-1 text-zinc-950 font-black text-xs tabular-nums">
              <Truck className="w-3 h-3 text-zinc-700" />
              <span>{stats.waitingDriversCount}</span>
            </div>
            <span className="text-[9.5px] font-bold text-zinc-500 block mt-0.5 truncate">
              Por despachar
            </span>
          </Link>

          <Link
            href="/productos"
            className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 text-center transition-colors"
          >
            <div className="flex items-center justify-center gap-1 text-zinc-950 font-black text-xs tabular-nums">
              <Package className="w-3 h-3 text-rose-500" />
              <span>{stats.lowStockCount}</span>
            </div>
            <span className="text-[9.5px] font-bold text-zinc-500 block mt-0.5 truncate">
              Stock crítico
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
