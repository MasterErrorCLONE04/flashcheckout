'use client'

import React from 'react'
import Link from 'next/link'
import {
  Settings,
  Plus,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardQuickMetricsCardProps {
  productsCount: number
  isSubscribed: boolean
  loadingStripe: boolean
  onStripeRedirect: () => void
}

export function DashboardQuickMetricsCard({
  productsCount,
  isSubscribed,
  loadingStripe,
  onStripeRedirect,
}: DashboardQuickMetricsCardProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between min-h-[180px]">
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 tracking-tight mb-4">Métricas rápidas</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              <span>Productos</span>
            </div>
            <span className="text-zinc-900 font-bold">
              {productsCount} / {isSubscribed ? 'Sin límite' : '10'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                <span>Límite del plan {isSubscribed ? 'Premium' : 'gratuito'}</span>
              </div>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  isSubscribed ? "bg-zinc-850 w-full" : 
                  productsCount >= 10 ? "bg-rose-500 w-full" :
                  productsCount >= 8 ? "bg-amber-500" : "bg-zinc-500"
                )}
                style={isSubscribed ? {} : { width: `${Math.min((productsCount / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isSubscribed ? (
        <button
          onClick={onStripeRedirect}
          disabled={loadingStripe}
          className="w-full h-9 mt-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-650 flex items-center justify-center gap-1.5 bg-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {loadingStripe ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span>Gestionar Suscripción</span>
        </button>
      ) : (
        <Link
          href="/pricing"
          className="w-full h-9 mt-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-650 flex items-center justify-center gap-1.5 bg-white shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span>Actualizar Plan</span>
        </Link>
      )}
    </div>
  )
}
