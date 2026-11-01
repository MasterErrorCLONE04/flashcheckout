'use client'

import { Plus, Lock } from 'lucide-react'
import Link from 'next/link'

interface ProductManagerHeaderProps {
  productsCount: number
  isPro: boolean
  canAddProduct: boolean
  onAddProduct: () => void
}

export function ProductManagerHeader({
  productsCount,
  isPro,
  canAddProduct,
  onAddProduct,
}: ProductManagerHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Suministros y Activos</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Inventario operativo — <span className="text-zinc-900 font-bold">{productsCount} módulos activos</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          {!isPro && (
            <div className="bg-zinc-50 border border-zinc-200 text-zinc-600 px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>{productsCount} / 10 espacios usados</span>
            </div>
          )}
          
          {canAddProduct ? (
            <button
              onClick={onAddProduct}
              className="flex items-center justify-center gap-2 h-9 px-3.5 bg-zinc-950 text-white hover:bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Producto</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 bg-amber-50/50 border border-amber-200/60 rounded-lg px-3.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-amber-900 leading-none">Límite alcanzado</span>
                <Link 
                  href="/configuracion"
                  className="text-amber-600 hover:text-amber-700 underline underline-offset-2 text-[10px] font-semibold mt-1"
                >
                  Actualizar a Pro
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
