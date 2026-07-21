'use client'

import Link from 'next/link'

export default function ExploreTopRankedWidget() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Card Top: Las mejores puntuaciones */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="mb-4 text-sm font-bold text-[#111827] dark:text-white">
            Las mejores puntuaciones
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/explorar?sort=rating"
              className="group rounded-md bg-[#f8f9fa] dark:bg-white/5 p-3 text-center border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all"
            >
              <div className="aspect-[4/3] w-full rounded bg-zinc-200 dark:bg-zinc-800 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80"
                  alt="Populares"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Populares
              </span>
            </Link>

            <Link
              href="/explorar?sort=products"
              className="group rounded-md bg-[#f8f9fa] dark:bg-white/5 p-3 text-center border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all"
            >
              <div className="aspect-[4/3] w-full rounded bg-zinc-200 dark:bg-zinc-800 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80"
                  alt="Más vendidos"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Más vendidos
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Card Bottom: Tiendas líderes & Respuesta rápida */}
      <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/explorar?filter=leaders"
            className="group rounded-xl bg-[#f8f9fa] dark:bg-white/5 p-3 text-center border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all"
          >
            <div className="aspect-[4/3] w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-2 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80"
                alt="Tiendas líderes"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              Tiendas líderes
            </span>
          </Link>

          <Link
            href="/explorar?filter=fast_response"
            className="group rounded-xl bg-[#f8f9fa] dark:bg-white/5 p-3 text-center border border-zinc-100 dark:border-white/5 hover:border-zinc-300 transition-all"
          >
            <div className="aspect-[4/3] w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-2 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80"
                alt="Respuesta rápida"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              Respuesta rápida
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
