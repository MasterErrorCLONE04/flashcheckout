'use client'

import Link from 'next/link'
import { Radio } from 'lucide-react'

type ExploreLiveAndTrendsWidgetProps = {
  onOpenLiveModal?: () => void
}

export default function ExploreLiveAndTrendsWidget({
  onOpenLiveModal,
}: ExploreLiveAndTrendsWidgetProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Card Top: Solicitar muestras */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="mb-4 text-sm font-bold text-[#111827] dark:text-white">
            Solicitar muestras
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/explorar?sort=products"
              className="group rounded-md bg-[#f8f9fa] dark:bg-white/5 p-3 text-center border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all"
            >
              <div className="aspect-[4/3] w-full rounded bg-zinc-200 dark:bg-zinc-800 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80"
                  alt="Tendencias"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Tendencias
              </span>
            </Link>

            <Link
              href="/explorar?sort=recent"
              className="group rounded-md bg-[#f8f9fa] dark:bg-white/5 p-3 text-center border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all"
            >
              <div className="aspect-[4/3] w-full rounded bg-zinc-200 dark:bg-zinc-800 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80"
                  alt="Recién lanzado"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Recién lanzado
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Card Bottom: Tiendas EN VIVO */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                Tiendas EN VIVO
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              🟢 EN VIVO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenLiveModal}
              className="group rounded-xl bg-[#f8f9fa] dark:bg-white/5 p-2 border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all text-left"
            >
              <div className="relative aspect-[4/3] w-full rounded-lg bg-zinc-900 mb-2 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80"
                  alt="Live Demo"
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
              <span className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                Preguntas y respuestas ...
              </span>
            </button>

            <button
              onClick={onOpenLiveModal}
              className="group rounded-xl bg-[#f8f9fa] dark:bg-white/5 p-2 border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all text-left"
            >
              <div className="relative aspect-[4/3] w-full rounded-lg bg-zinc-900 mb-2 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80"
                  alt="Live Offer"
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
              <span className="block text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                Descuentos EN VIVO
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
