'use client'

import React from 'react'
import Link from 'next/link'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardStats } from './types'

interface DashboardKpiCardsProps {
  stats: DashboardStats
}

export function DashboardKpiCards({ stats }: DashboardKpiCardsProps) {
  const formatGrowth = (val: number) => {
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Ingresos de Hoy */}
      <Link href="/pedidos" className="group block">
        <div className="p-4 sm:p-5 bg-white border border-zinc-200 hover:border-zinc-950 rounded-2xl flex flex-col justify-between transition-all shadow-2xs h-full">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Ventas de Hoy
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                ${stats.revenueToday.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums',
                  stats.revenueGrowth >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                    : 'bg-zinc-100 text-zinc-600'
                )}
              >
                {formatGrowth(stats.revenueGrowth || 0)}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">vs ayer</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 tabular-nums truncate">
              Total: ${stats.totalRevenueVal.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </Link>

      {/* Card 2: Pedidos */}
      <Link href="/pedidos" className="group block">
        <div className="p-4 sm:p-5 bg-white border border-zinc-200 hover:border-zinc-950 rounded-2xl flex flex-col justify-between transition-all shadow-2xs h-full">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Pedidos Hoy
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                {stats.ordersToday}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums',
                  stats.ordersGrowth >= 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                    : 'bg-zinc-100 text-zinc-600'
                )}
              >
                {formatGrowth(stats.ordersGrowth || 0)}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">vs ayer</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 tabular-nums">
              {stats.totalOrdersCount} acumulados
            </span>
          </div>
        </div>
      </Link>

      {/* Card 3: Ticket Promedio & Conversión */}
      <Link href="/analitica" className="group block">
        <div className="p-4 sm:p-5 bg-white border border-zinc-200 hover:border-zinc-950 rounded-2xl flex flex-col justify-between transition-all shadow-2xs h-full">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Ticket Promedio
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                ${stats.avgTicketToday.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 tabular-nums">
                {stats.conversionRate.toFixed(1)}% conv.
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 inline-flex items-center gap-0.5">
              <span>Ver analítica</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>

      {/* Card 4: Conversaciones & Bot WhatsApp */}
      <Link href="/conversaciones" className="group block">
        <div className="p-4 sm:p-5 bg-white border border-zinc-200 hover:border-zinc-950 rounded-2xl flex flex-col justify-between transition-all shadow-2xs h-full">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Chats WhatsApp Hoy
              </span>
              <span className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight tabular-nums block mt-1.5">
                {stats.chatsTodayCount}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white text-zinc-700 flex items-center justify-center border border-zinc-200/80 transition-colors shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stats.activeChatsCount} activas (2h)
            </span>
            <span className="text-[10px] font-bold text-zinc-500 tabular-nums">
              {stats.whatsappPct}% ventas IA
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
