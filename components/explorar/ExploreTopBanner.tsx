'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, X } from 'lucide-react'

export default function ExploreTopBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 text-white text-xs sm:text-sm font-medium py-2.5 px-4 border-b border-emerald-500/20 shadow-sm">
      <div className="mx-auto max-w-[1800px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="size-3 text-emerald-400 animate-pulse" /> Flash AI
          </span>
          <span className="truncate font-semibold text-zinc-200">
            Inteligencia Artificial activa para recomendar tiendas verificadas, comparar precios y solicitar cotizaciones directas.
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/explorar?mode=ai"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
          >
            Probar Modo IA
            <ArrowRight className="size-3.5" />
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Cerrar banner"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
