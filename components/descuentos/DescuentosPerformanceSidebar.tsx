'use client'

import React from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Bot,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Coupon } from './types'

interface DescuentosPerformanceSidebarProps {
  coupons: Coupon[]
  totalUses: number
  pctPercent: number
  pctCount: number
  freeShipPercent: number
  freeShipCount: number
  fixedPercent: number
  fixedCount: number
  mostUsedCoupon: Coupon | null
  mostUsedPercent: number
}

export function DescuentosPerformanceSidebar({
  coupons,
  totalUses,
  pctPercent,
  pctCount,
  freeShipPercent,
  freeShipCount,
  fixedPercent,
  fixedCount,
  mostUsedCoupon,
  mostUsedPercent,
}: DescuentosPerformanceSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-6 text-left shrink-0">
      {/* Card 1: Rendimiento de descuentos */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-5 shadow-none">
        <div className="flex items-center justify-between">
          <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 tracking-wider">Rendimiento</h3>
          <div className="relative shrink-0 select-none">
            <select className="bg-zinc-50 border border-zinc-200 rounded-md pl-2 pr-7 py-1 text-[10px] xl:text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer appearance-none">
              <option value="month">Este mes</option>
              <option value="week">Esta semana</option>
              <option value="year">Este año</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-bold text-zinc-405 block tracking-wider leading-none">Usos por tipo de descuento</span>

          {/* NATIVE INTERACTIVE SVG RING DOUGHNUT CHART */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0 select-none">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F4F4F5" strokeWidth="11" />

                {/* Segment 1: Porcentaje */}
                {pctPercent > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#6F42C1" 
                    strokeWidth="11" 
                    strokeDasharray="251.327" 
                    strokeDashoffset={251.327 * (1 - pctPercent / 100)}
                  />
                )}

                {/* Segment 2: Envío gratis */}
                {freeShipPercent > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#71717A" 
                    strokeWidth="11" 
                    strokeDasharray="251.327" 
                    strokeDashoffset={251.327 * (1 - freeShipPercent / 100)}
                    style={{ transform: `rotate(${pctPercent * 3.6}deg)`, transformOrigin: '50px 50px' }}
                  />
                )}

                {/* Segment 3: Monto fijo */}
                {fixedPercent > 0 && (
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#FF7A00" 
                    strokeWidth="11" 
                    strokeDasharray="251.327" 
                    strokeDashoffset={251.327 * (1 - fixedPercent / 100)}
                    style={{ transform: `rotate(${(pctPercent + freeShipPercent) * 3.6}deg)`, transformOrigin: '50px 50px' }}
                  />
                )}
              </svg>

              {/* Central Text inside Doughnut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-zinc-955 tracking-tight leading-none">{totalUses}</span>
                <span className="text-[9px] font-semibold text-zinc-400 mt-1 tracking-tight">Total</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex-1 space-y-2 text-xs font-semibold text-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6F42C1] shrink-0" />
                  <span className="truncate text-zinc-650">Porcentaje</span>
                </div>
                <span className="text-zinc-955 font-extrabold ml-2">
                  {pctPercent}% <span className="text-zinc-400 font-semibold">({pctCount})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#71717A] shrink-0" />
                  <span className="truncate text-zinc-655">Envío gratis</span>
                </div>
                <span className="text-zinc-955 font-extrabold ml-2">
                  {freeShipPercent}% <span className="text-zinc-400 font-semibold">({freeShipCount})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
                  <span className="truncate text-zinc-650">Monto fijo</span>
                </div>
                <span className="text-zinc-955 font-extrabold ml-2">
                  {fixedPercent}% <span className="text-zinc-400 font-semibold">({fixedCount})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-zinc-100" />

        {/* Descuento más usado widget */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-405 block tracking-wider leading-none">Descuento más usado</span>
          {mostUsedCoupon ? (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-black text-zinc-900 leading-none">{mostUsedCoupon.code}</h5>
                  <span className="text-[10px] font-semibold text-zinc-400 mt-1 block">{mostUsedCoupon.tipoDesc}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-955 block leading-none">{mostUsedCoupon.usos} usos</span>
                  <span className="text-[10px] font-semibold text-zinc-405 mt-1 block">{mostUsedPercent}% del total</span>
                </div>
              </div>
              {/* Custom Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-800 rounded-full" style={{ width: `${mostUsedPercent}%` }} />
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-zinc-400">Sin datos de usos de cupones</span>
          )}
        </div>
      </div>

      {/* Card 2: Actividad reciente */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 tracking-wider">Actividad reciente</h3>

        <div className="space-y-3.5">
          {coupons.length > 0 ? (
            coupons.slice(0, 3).map((c, idx) => {
              const stateColors = {
                Activo: 'bg-zinc-500',
                Programado: 'bg-amber-500',
                Inactivo: 'bg-zinc-400'
              }
              return (
                <div key={c.id || idx} className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stateColors[c.estado as keyof typeof stateColors] || 'bg-zinc-400')} />
                    <span className="truncate text-zinc-800 leading-tight">Descuento {c.code} registrado</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">Reciente</span>
                </div>
              )
            })
          ) : (
            <span className="text-xs font-semibold text-zinc-400">Sin actividad registrada</span>
          )}
        </div>

        <div className="h-px w-full bg-zinc-100 pt-1" />

        <button className="text-xs xl:text-sm font-bold text-zinc-700 hover:text-zinc-950 flex items-center justify-between w-full px-1 pt-1 cursor-pointer select-none border-none bg-transparent">
          <span>Ver toda la actividad</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Card 3: Nova help box */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none relative overflow-hidden flex flex-col justify-between min-h-[160px]">
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <h4 className="text-xs xl:text-sm font-black text-zinc-955 tracking-tight leading-tight">¿Necesitas ayuda con descuentos?</h4>
            <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 leading-relaxed">Nova puede ayudarte a crear estrategias de descuentos efectivas.</p>
          </div>
          <div className="shrink-0 select-none">
            <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <Bot className="w-7 h-7" />
            </div>
          </div>
        </div>

        <Link href="/hablar-con-nova" className="w-full select-none">
          <button className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-lg shadow-none flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all border-none">
            <MessageCircle className="w-4.5 h-4.5 fill-current" />
            Hablar con Nova
          </button>
        </Link>
      </div>
    </div>
  )
}
