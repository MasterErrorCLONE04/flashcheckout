'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type ExploreHelpCenterMenuProps = {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ExploreHelpCenterMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: ExploreHelpCenterMenuProps) {
  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 pt-1 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-lg border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 p-5 sm:p-6 flex flex-col md:flex-row gap-6">
          
          {/* Left Area: 2-Column Action Buttons */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Col 1, Item 1 */}
            <Link
              href="/help?topic=buyers"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                Centro de ayuda para compradores
              </span>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Col 2, Item 1 */}
            <Link
              href="/help?topic=refunds"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                Reembolsos y servicio posventa
              </span>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Col 1, Item 2 */}
            <Link
              href="/help?action=chat"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                Live chat
              </span>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Col 2, Item 2 */}
            <Link
              href="/help?action=intellectual-property"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                Denunciar infracción de propiedad intelectual
              </span>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Col 1, Item 3 */}
            <Link
              href="/help?action=dispute"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                Presentar una disputa comercial
              </span>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

            {/* Col 2, Item 3 */}
            <Link
              href="/help?action=report"
              className="group bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                Denunciar una infracción
              </span>
              <ArrowRight className="size-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </Link>

          </div>

          {/* Right Area: Tiendas asociadas */}
          <div className="w-full md:w-64 shrink-0 md:border-l md:border-zinc-200/80 dark:md:border-white/10 md:pl-6 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
              Tiendas asociadas
            </h4>

            <Link
              href="/integrations/wix"
              className="group flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-white dark:bg-zinc-800/40 transition-all shadow-xs hover:shadow-sm"
            >
              <div className="size-10 rounded-lg bg-zinc-200/80 dark:bg-zinc-700/80 text-black dark:text-white flex items-center justify-center font-black text-sm tracking-tighter shrink-0">
                WiX
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white leading-tight">
                Integra Flashcheckouts.com con Wix
              </span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
