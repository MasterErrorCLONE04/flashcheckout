'use client'

import { Search, Store as StoreIcon, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import ExploreStoreCardV2 from '@/components/explorar/ExploreStoreCardV2'
import type { ExploreStore } from '@/components/ExploreTypes'

type ExploreResultsGridProps = {
  stores: ExploreStore[]
  totalStores: number
  query: string
  selectedCategory: string
}

export default function ExploreResultsGrid({
  stores,
  totalStores,
  query,
  selectedCategory,
}: ExploreResultsGridProps) {
  return (
    <section id="resultados" className="py-6">
      {/* Header bar for grid */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200/80 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
            Tiendas Verificadas & Marcas Destacadas
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {query
              ? `Mostrando resultados para "${query}"`
              : selectedCategory !== 'Todos'
              ? `Categoría: ${selectedCategory}`
              : 'Explora marcas recomendadas en la red Flashcheckout'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3.5 py-1.5 text-xs font-extrabold text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
          <StoreIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>{stores.length} mostradas</span>
          <span className="text-zinc-400">/ {totalStores} en total</span>
        </div>
      </div>

      {/* Grid rendering */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {stores.map((store) => (
            <ExploreStoreCardV2 key={store.id} store={store} />
          ))}
        </div>
      ) : (
        /* Clean Empty State */
        <div className="rounded-[28px] border border-zinc-200 bg-white p-12 sm:p-16 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900/40">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Search className="size-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-white">
            No encontramos tiendas que coincidan
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            Intenta ajustar la búsqueda, restablecer los filtros de categoría o explorar términos más generales.
          </p>
          <div className="mt-6">
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <RefreshCcw className="size-4" />
              <span>Ver todas las tiendas</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
