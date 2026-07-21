'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Camera, Sparkles, CheckCircle2 } from 'lucide-react'

type ExploreSearchHeroProps = {
  initialQuery: string
  onOpenImageSearch?: () => void
}

export default function ExploreSearchHero({
  initialQuery,
  onOpenImageSearch,
}: ExploreSearchHeroProps) {
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'ai' | 'products' | 'stores' | 'international'>('stores')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }

    const nextQuery = params.toString()
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname)
  }

  return (
    <div className="relative pt-8 pb-6 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        {/* Mode Tabs Above Search Box */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-12 mb-7 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`bg-transparent flex items-center gap-1.5 pb-2 transition-all ${
              activeTab === 'ai'
                ? 'text-[#111827] dark:text-white border-b-[3px] border-[#111827] dark:border-white font-black'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>Modo IA</span>
            <Sparkles className="size-5 sm:size-6 text-zinc-900 dark:text-white inline" />
          </button>

          <span className="text-zinc-300 dark:text-zinc-700 font-light">|</span>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`bg-transparent pb-2 transition-all ${
              activeTab === 'products'
                ? 'text-[#111827] dark:text-white border-b-[3px] border-[#111827] dark:border-white font-black'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Productos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stores')}
            className={`bg-transparent pb-2 transition-all ${
              activeTab === 'stores'
                ? 'text-[#111827] dark:text-white border-b-[3px] border-[#111827] dark:border-white font-black'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Tiendas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('international')}
            className={`bg-transparent pb-2 transition-all ${
              activeTab === 'international'
                ? 'text-[#111827] dark:text-white border-b-[3px] border-[#111827] dark:border-white font-black'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Internacional
          </button>
        </div>

        {/* Rounded Rectangular 2-Level Search Box (Wider) */}
        <form onSubmit={handleSearch} className="relative mx-auto max-w-4xl sm:max-w-5xl">
          <div className="rounded-xl border border-zinc-200/90 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all text-left flex flex-col justify-between min-h-[110px]">
            {/* Top Row: Full-width text input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="carteras de mujer de marcas al por mayor"
              className="w-full bg-transparent text-sm sm:text-base font-normal text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none pb-4"
            />

            {/* Bottom Row: Left camera action & Right black submit pill button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onOpenImageSearch}
                className="bg-transparent flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                <Camera className="size-4.5 text-zinc-900 dark:text-white" />
                <span>Buscar con imagen</span>
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-full bg-[#1c1c1e] dark:bg-white hover:bg-black dark:hover:bg-zinc-200 px-6 py-2 text-xs sm:text-sm font-bold text-white dark:text-zinc-950 shadow-sm transition-transform active:scale-95"
              >
                <Search className="size-4" />
                <span>Buscar</span>
              </button>
            </div>
          </div>
        </form>

        {/* Centered Heading & Badges below search */}
        <div className="mt-6 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
            Conéctate con 34K+ tiendas verificadas
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-zinc-500" />
              +5K industrias cubiertas
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-zinc-500" />
              Precios directo de tienda
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-zinc-500" />
              Muestras y personalización disponibles
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
