import React from 'react'
import Link from 'next/link'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'
import { DashboardStats } from './types'

interface DashboardKpiCardsProps {
  stats: DashboardStats
}

export function DashboardKpiCards({ stats }: DashboardKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Ventas de Hoy */}
      <Link href="/pedidos" className="contents">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Ventas de hoy</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                ${stats.revenueToday.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
              <span>▲ {Math.abs(stats.revenueGrowth || 0).toFixed(1)}%</span>
              <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 2: Pedidos */}
      <Link href="/pedidos" className="contents">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Pedidos</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                {stats.ordersToday}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <ShoppingCart className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
              <span>▲ {Math.abs(stats.ordersGrowth || 0).toFixed(1)}%</span>
              <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 3: Ticket Promedio */}
      <Link href="/analitica" className="contents">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Ticket promedio</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                ${stats.avgTicketToday.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
              <span>▲ {Math.abs(stats.avgTicketGrowth || 0).toFixed(1)}%</span>
              <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 4: Clientes Nuevos */}
      <Link href="/clientes" className="contents">
        <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Clientes nuevos</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                {stats.activeChatsCount}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
              <span>▲ 0.0%</span>
              <span className="text-zinc-400 font-normal font-sans tracking-wider text-[9px] ml-1">vs ayer</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
