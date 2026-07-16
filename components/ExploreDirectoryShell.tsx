import { Search, Store } from 'lucide-react'
import ExploreAssistantPanel from '@/components/ExploreAssistantPanelAI'
import ExploreHeader from '@/components/ExploreHeader'
import ExploreHero from '@/components/ExploreHero'
import ExploreSidebar from '@/components/ExploreSidebar'
import ExploreStoreCard from '@/components/ExploreStoreCard'
import type { ExploreStore, ExploreTheme } from '@/components/ExploreTypes'

type ExploreDirectoryShellProps = {
  stores: ExploreStore[]
  totalStores: number
  query: string
  selectedCategory: string
  minPrice: number
  maxPrice: number
  sort: string
  theme: ExploreTheme
  userId: string | null
}

export default function ExploreDirectoryShell({
  stores,
  totalStores,
  query,
  selectedCategory,
  minPrice,
  maxPrice,
  sort,
  theme,
  userId,
}: ExploreDirectoryShellProps) {
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-[#fbfbfa] text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <ExploreHeader query={query} userId={userId} theme={theme} />

        <div className="mx-auto grid max-w-[1800px] grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)_390px]">
          <ExploreSidebar
            selectedCategory={selectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            theme={theme}
          />

          <main className="border-x border-zinc-200/70 px-6 py-9 dark:border-white/10 md:px-8 lg:px-10 lg:py-11">
            <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.055em] text-zinc-950 dark:text-white lg:text-[34px]">
                  Descubre <span className="text-emerald-600">tiendas increíbles</span>
                </h1>
                <p className="mt-2 text-base font-medium text-zinc-500 dark:text-zinc-400">Explora negocios verificados y encuentra lo que necesitas.</p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                <Store className="size-4 text-zinc-500 dark:text-zinc-300" />
                <span className="underline decoration-zinc-400 underline-offset-2">{totalStores}</span>
                tiendas disponibles
              </div>
            </div>

            <ExploreHero />

            <section id="resultados">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.045em] text-zinc-950 dark:text-white">Tiendas destacadas</h2>
                  <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {query ? `Resultados para "${query}"` : 'Recomendadas para ti'}
                  </p>
                </div>
              </div>

              {stores.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {stores.map((store) => (
                    <ExploreStoreCard key={store.id} store={store} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-zinc-200 bg-white p-16 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 dark:bg-white/10">
                    <Search className="size-8" />
                  </div>
                  <h3 className="text-xl font-black tracking-[-0.04em] text-zinc-950 dark:text-white">No encontramos coincidencias</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-zinc-500 dark:text-zinc-400">Prueba ajustando filtros o buscando una marca, categoría o producto más general.</p>
                </div>
              )}
            </section>
          </main>

          <ExploreAssistantPanel />
        </div>
      </div>
    </div>
  )
}
