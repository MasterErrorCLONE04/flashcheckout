'use client'

import { Target, Building2, ShieldCheck } from 'lucide-react'

type ExploreQuickServicesBarProps = {
  userName?: string | null
  onOpenQuoteModal?: () => void
  onOpenLiveModal?: () => void
  onOpenProtectModal?: () => void
}

export default function ExploreQuickServicesBar({
  userName,
  onOpenQuoteModal,
  onOpenLiveModal,
  onOpenProtectModal,
}: ExploreQuickServicesBarProps) {
  const displayName = userName ? userName : 'David'

  return (
    <div className="py-2 my-2">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Welcome Greeting */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#111827] dark:text-white">
            Bienvenido a Flashcheckouts.com, {displayName}
          </span>
        </div>

        {/* Quick Service Links with exact Icons & Labels from screenshot */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <button
            onClick={onOpenQuoteModal}
            className="bg-transparent flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors group cursor-pointer"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold group-hover:scale-105 transition-transform">
              <Target className="size-4" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Solicitud de Cotización</span>
          </button>

          <button
            onClick={onOpenLiveModal}
            className="bg-transparent flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors group cursor-pointer"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold text-xs group-hover:scale-105 transition-transform">
              <Building2 className="size-4" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Feria comercial en línea</span>
          </button>

          <button
            onClick={onOpenProtectModal}
            className="bg-transparent flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors group cursor-pointer"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold text-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-4" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Proveedor clave en la industria</span>
          </button>
        </div>
      </div>
    </div>
  )
}
