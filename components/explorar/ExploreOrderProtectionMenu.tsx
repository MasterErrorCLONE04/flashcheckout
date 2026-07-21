'use client'

import Link from 'next/link'
import {
  ShieldCheck,
  RefreshCw,
  Truck,
  Wrench,
  ArrowRight,
  Shield,
} from 'lucide-react'

type ExploreOrderProtectionMenuProps = {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ExploreOrderProtectionMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: ExploreOrderProtectionMenuProps) {
  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 pt-1 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-lg border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Trade Assurance Brand & Title */}
          <div className="flex-1 space-y-4 max-w-lg">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
              <div className="size-6 rounded-md bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                $
              </div>
              <span className="text-zinc-900 dark:text-white font-extrabold tracking-tight">
                Trade Assurance
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Estás protegido desde el pago hasta la entrega
            </h3>

            <div className="pt-2">
              <Link
                href="/explorar?action=protection"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#ff5000] hover:bg-[#e04600] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
              >
                Más información
              </Link>
            </div>
          </div>

          {/* Right Column: 2x2 Feature Cards Grid */}
          <div className="w-full md:w-[600px] shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Pagos seguros */}
            <Link
              href="/explorar?action=protection#payments"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 p-4 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white">
                  Pagos seguros
                </span>
              </div>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Card 2: Garantía de devolución de dinero */}
            <Link
              href="/explorar?action=protection#refund"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 p-4 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <RefreshCw className="size-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white">
                  Garantía de devolución de dinero
                </span>
              </div>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Card 3: Entrega a tiempo garantizada */}
            <Link
              href="/explorar?action=protection#delivery"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 p-4 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Truck className="size-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white">
                  Entrega a tiempo garantizada
                </span>
              </div>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Card 4: Protecciones postventa */}
            <Link
              href="/explorar?action=protection#aftersales"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 p-4 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Wrench className="size-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white">
                  Protecciones postventa
                </span>
              </div>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

          </div>

        </div>
      </div>
    </div>
  )
}
