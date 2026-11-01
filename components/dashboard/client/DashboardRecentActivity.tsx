'use client'

import React from 'react'
import Link from 'next/link'
import {
  Inbox,
  Check,
  ShoppingBag,
} from 'lucide-react'
import { DashboardActivity } from './types'

interface DashboardRecentActivityProps {
  activities: DashboardActivity[]
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Actividad reciente</h4>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 py-8 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/20 my-2">
          <div className="w-9 h-9 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center mb-2.5">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-zinc-955">Sin actividad reciente</p>
          <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">Las actividades y pedidos de tu tienda aparecerán listados aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Link 
              key={activity.id} 
              href={activity.href || '#'} 
              className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200/50"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  {activity.type === 'payment' ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{activity.title}</p>
                  <p className="text-[9px] font-semibold text-zinc-400 mt-0.5">#{activity.code}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {activity.amount !== undefined && (
                  <p className="text-xs font-bold text-zinc-650">${activity.amount.toLocaleString('es-CO')}</p>
                )}
                <p className="text-[8px] font-semibold text-zinc-400 mt-0.5">{activity.timeText}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link href="/pedidos" className="w-full h-9 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-650 flex items-center justify-center bg-white shadow-sm active:scale-95 transition-all mt-4">
        <span>Ver toda la actividad</span>
      </Link>
    </div>
  )
}
