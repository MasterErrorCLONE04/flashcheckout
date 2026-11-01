'use client'

import Link from 'next/link'
import { Landmark } from 'lucide-react'

export function PagosOptimizaBanner() {
  return (
    <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 text-left">
        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 shrink-0 select-none">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs xl:text-sm font-bold text-zinc-900 tracking-tight leading-tight">Optimiza tus cobros</h4>
          <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 leading-normal">
            Conecta más métodos de pago y aumenta tus conversiones de venta virtual.
          </p>
        </div>
      </div>
      
      <Link href="/integraciones" className="shrink-0 select-none">
        <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-98">
          Gestionar métodos de pago
        </button>
      </Link>
    </div>
  )
}
