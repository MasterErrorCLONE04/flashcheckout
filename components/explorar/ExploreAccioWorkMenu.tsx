'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Sparkles, CheckCircle2 } from 'lucide-react'

type ExploreAccioWorkMenuProps = {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ExploreAccioWorkMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: ExploreAccioWorkMenuProps) {
  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 pt-1 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-lg border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Accio Work Copy & CTA */}
          <div className="flex-1 space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-[#00a86b] text-white flex items-center justify-center font-black text-xs shadow-xs">
                ▲
              </div>
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Accio Work
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Tu <span className="text-[#00a86b] dark:text-[#00c883]">equipo IA de negocio</span> 24/7
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              Desde el diseño hasta la compra, deja que Accio Work se encargue de lo más pesado. ¡Impulsa tu ROI hoy!
            </p>

            <div className="pt-2">
              <Link
                href="/accio"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
              >
                <span>Descargar Accio Work</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Mock Dashboard Graphic */}
          <div className="w-full md:w-[500px] shrink-0 rounded-2xl bg-gradient-to-br from-emerald-100/80 via-teal-100/60 to-emerald-200/50 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-900/40 p-5 border border-emerald-200/60 dark:border-emerald-800/30 relative overflow-hidden group">
            
            {/* Mock Dashboard Window Frame */}
            <div className="rounded-xl border border-white/80 bg-white/90 shadow-lg dark:border-white/10 dark:bg-zinc-900/90 p-4 space-y-3 relative z-10">
              
              {/* Window Header Dots */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-400" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  24/7 Always working
                </span>
              </div>

              {/* AI Agents Grid */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 text-center space-y-1 border border-zinc-100 dark:border-white/5">
                  <div className="size-7 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <Bot className="size-4" />
                  </div>
                  <p className="text-[9px] font-bold text-zinc-900 dark:text-white">Accio AI</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 text-center space-y-1 border border-zinc-100 dark:border-white/5">
                  <div className="size-7 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="size-4" />
                  </div>
                  <p className="text-[9px] font-bold text-zinc-900 dark:text-white">Design</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 text-center space-y-1 border border-zinc-100 dark:border-white/5">
                  <div className="size-7 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <p className="text-[9px] font-bold text-zinc-900 dark:text-white">Sourcing</p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 text-center space-y-1 border border-zinc-100 dark:border-white/5">
                  <div className="size-7 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <p className="text-[9px] font-bold text-zinc-900 dark:text-white">ROAS Opt</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold flex items-center justify-between">
                <span>Sourcing Agent: Top tier suppliers matched</span>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
