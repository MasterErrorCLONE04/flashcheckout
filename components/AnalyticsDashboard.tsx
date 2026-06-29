'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Target, ArrowUpRight, Percent, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

type AnalyticsStats = {
  totalRevenue: number
  totalOrders: number
  averageValue: number
  conversionRate: number
  funnel: {
    inquiries: number
    carts: number
    checkouts: number
    purchases: number
  }
  popularProducts: {
    name: string
    sold: number
    revenue: number
  }[]
  searchKeywords: {
    keyword: string
    count: number
  }[]
}

export default function AnalyticsDashboard({
  stats,
}: {
  stats: AnalyticsStats
}) {
  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Revenue */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Ventas Totales</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">${stats.totalRevenue.toLocaleString('es-CO')}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Orders */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Pedidos Completados</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">{stats.totalOrders}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: AOV */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Ticket Promedio</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">${Math.round(stats.averageValue).toLocaleString('es-CO')}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Conversion */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Tasa Conversión Chat</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">{stats.conversionRate}%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Funnel Analysis */}
        <div className="lg:col-span-6 premium-card p-6 bg-white border border-zinc-200/60 rounded-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-[14px]">Embudo de Conversión Conversional</h3>
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wider mt-0.5">Efectividad del Bot en WhatsApp</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1: Inquiries */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-700">
                <span>1. Interacciones de Chat</span>
                <span className="tabular-nums">{stats.funnel.inquiries} usuarios</span>
              </div>
              <div className="h-4 w-full bg-zinc-100 rounded-lg overflow-hidden relative">
                <div className="h-full bg-zinc-950 rounded-lg w-full transition-all duration-500" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">100%</span>
              </div>
            </div>

            {/* Step 2: Carts */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-700">
                <span>2. Carritos Creados</span>
                <span className="tabular-nums">{stats.funnel.carts} usuarios</span>
              </div>
              <div className="h-4 w-full bg-zinc-100 rounded-lg overflow-hidden relative">
                <div 
                  className="h-full bg-zinc-950 rounded-lg transition-all duration-500" 
                  style={{ width: `${(stats.funnel.carts / stats.funnel.inquiries) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">
                  {Math.round((stats.funnel.carts / stats.funnel.inquiries) * 100)}%
                </span>
              </div>
            </div>

            {/* Step 3: Checkouts */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-700">
                <span>3. Inicios de Pago</span>
                <span className="tabular-nums">{stats.funnel.checkouts} usuarios</span>
              </div>
              <div className="h-4 w-full bg-zinc-100 rounded-lg overflow-hidden relative">
                <div 
                  className="h-full bg-zinc-950 rounded-lg transition-all duration-500" 
                  style={{ width: `${(stats.funnel.checkouts / stats.funnel.inquiries) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">
                  {Math.round((stats.funnel.checkouts / stats.funnel.inquiries) * 100)}%
                </span>
              </div>
            </div>

            {/* Step 4: Completed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-700">
                <span>4. Pedidos Completados</span>
                <span className="tabular-nums">{stats.funnel.purchases} usuarios</span>
              </div>
              <div className="h-4 w-full bg-zinc-100 rounded-lg overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 rounded-lg transition-all duration-500" 
                  style={{ width: `${(stats.funnel.purchases / stats.funnel.inquiries) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">
                  {Math.round((stats.funnel.purchases / stats.funnel.inquiries) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top Products & Search Keywords */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Products */}
          <div className="premium-card p-6 bg-white border border-zinc-200/60 rounded-lg space-y-4">
            <h4 className="font-bold text-zinc-900 text-xs tracking-wider">Productos más vendidos</h4>
            <div className="divide-y divide-zinc-100 text-xs">
              {stats.popularProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div>
                    <span className="font-bold text-zinc-800">{p.name}</span>
                    <span className="block text-[10px] text-zinc-400 font-bold mt-0.5">{p.sold} unidades vendidas</span>
                  </div>
                  <span className="font-black text-zinc-950 tabular-nums">${p.revenue.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Keywords */}
          <div className="premium-card p-6 bg-white border border-zinc-200/60 rounded-lg space-y-4">
            <h4 className="font-bold text-zinc-900 text-xs tracking-wider">Términos buscados en Chatbot</h4>
            <div className="flex flex-wrap gap-2">
              {stats.searchKeywords.map((k, idx) => (
                <div 
                  key={idx} 
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200/40 rounded-lg text-xs font-bold text-zinc-700 flex items-center gap-1.5"
                >
                  <span>"{k.keyword}"</span>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-px rounded-md">{k.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
