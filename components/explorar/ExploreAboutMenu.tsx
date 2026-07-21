'use client'

import Link from 'next/link'
import { QrCode } from 'lucide-react'

type ExploreAboutMenuProps = {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ExploreAboutMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: ExploreAboutMenuProps) {
  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 pt-1 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-lg border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 p-5 sm:p-6 flex flex-col md:flex-row gap-6">
          
          {/* Left Area: 2 Main Showcase Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Card 1: Por qué elegir */}
            <Link
              href="/about"
              className="group flex flex-col space-y-3"
            >
              <div className="h-40 rounded-xl overflow-hidden border border-zinc-200/80 dark:border-white/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
                  alt="Por qué elegir Flashcheckouts.com"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Por qué elegir Flashcheckouts.com
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  50M+ compradores ya compran de proveedores verificados aquí, en un marketplace B2B impulsado por asistentes de compras con IA
                </p>
              </div>
            </Link>

            {/* Card 2: CoCreate Pitch */}
            <Link
              href="/cocreate"
              className="group flex flex-col space-y-3"
            >
              <div className="h-40 rounded-xl overflow-hidden border border-zinc-200/80 dark:border-white/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80"
                  alt="Presentación de CoCreate"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-xs font-black text-amber-300 tracking-wider uppercase">
                    CoCreate Pitch Event
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Presentación de CoCreate
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  Presenta tu startup ante jueces de élite en un escenario global, con una bolsa de premios total de $1,000,000
                </p>
              </div>
            </Link>

          </div>

          {/* Right Area: Mobile App Download & QR Code */}
          <div className="w-full md:w-72 shrink-0 md:border-l md:border-zinc-200/80 dark:md:border-white/10 md:pl-6 space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Descarga la app de Flashcheckouts.com
            </h4>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
              Encuentra productos, comunícate con proveedores y administra y paga tus pedidos desde la app donde quieras y cuando quieras.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {/* QR Code Container */}
              <div className="size-20 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                <QrCode className="size-full text-zinc-800 dark:text-zinc-200" />
              </div>

              {/* Store App Badges */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  className="bg-black hover:bg-zinc-800 text-white rounded-lg px-3 py-1.5 flex items-center gap-2 border border-zinc-800 transition-colors"
                >
                  <span className="text-[9px] font-bold tracking-tight uppercase leading-none block">
                    Google Play
                  </span>
                </button>
                <button
                  type="button"
                  className="bg-black hover:bg-zinc-800 text-white rounded-lg px-3 py-1.5 flex items-center gap-2 border border-zinc-800 transition-colors"
                >
                  <span className="text-[9px] font-bold tracking-tight uppercase leading-none block">
                    App Store
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
