'use client'

import React from 'react'
import Link from 'next/link'
import {
  Inbox,
  Check,
  ShoppingBag,
  ArrowUpRight,
} from 'lucide-react'
import { DashboardActivity } from './types'

interface DashboardRecentActivityProps {
  activities: DashboardActivity[]
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800">
            <Inbox className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Actividad Reciente
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              Últimos pedidos y movimientos
            </p>
          </div>
        </div>
        <Link
          href="/pedidos"
          className="text-[10.5px] font-bold text-zinc-500 hover:text-zinc-950 inline-flex items-center gap-0.5 transition-colors"
        >
          <span>Historial</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40">
          <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-2">
            <Inbox className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-zinc-950">Sin actividad reciente</p>
          <p className="text-[10.5px] text-zinc-400 mt-0.5 max-w-[200px] leading-relaxed">
            Los nuevos pedidos y pagos confirmados aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map(activity => (
            <Link
              key={activity.id}
              href={activity.href || '/pedidos'}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50/50 hover:bg-zinc-100/80 transition-colors border border-zinc-200/70 text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                  {activity.type === 'payment' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-950 truncate">{activity.title}</p>
                  <p className="text-[10px] font-mono font-semibold text-zinc-400 mt-0.5">
                    #{activity.code} · {activity.timeText}
                  </p>
                </div>
              </div>
              {activity.amount !== undefined && (
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-zinc-950 tabular-nums">
                    ${activity.amount.toLocaleString('es-CO')}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
