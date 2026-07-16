'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  BriefcaseBusiness,
  ChevronRight,
  Grid2X2,
  Home,
  PackageCheck,
  PawPrint,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Utensils,
} from 'lucide-react'
import { EXPLORE_CATEGORIES, formatCurrency, normalizeCategory } from '@/components/ExploreData'
import type { ExploreTheme } from '@/components/ExploreTypes'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS = {
  Todos: Grid2X2,
  Tecnologia: PackageCheck,
  Moda: Shirt,
  Hogar: Home,
  Mascotas: PawPrint,
  Alimentos: Utensils,
  Belleza: Sparkles,
  Servicios: BriefcaseBusiness,
}

export default function ExploreSidebar({
  selectedCategory,
  minPrice,
  maxPrice,
  sort,
  theme,
}: {
  selectedCategory: string
  minPrice: number
  maxPrice: number
  sort: string
  theme: ExploreTheme
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const createHref = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })

    const nextQuery = params.toString()
    return nextQuery ? `${pathname}?${nextQuery}` : pathname
  }

  const updatePrice = (nextMin: number, nextMax: number) => {
    const safeMin = Math.max(0, Math.min(nextMin, 5000000))
    const safeMax = Math.max(safeMin, Math.min(nextMax, 5000000))
    router.push(createHref({
      minPrice: safeMin > 0 ? String(safeMin) : null,
      maxPrice: safeMax < 5000000 ? String(safeMax) : null,
    }))
  }

  const updateSort = (value: string) => {
    router.push(createHref({ sort: value === 'recent' ? null : value }))
  }

  return (
    <aside className="hidden min-h-[calc(100vh-80px)] border-r border-zinc-200/70 bg-white/55 px-9 py-9 dark:border-white/10 dark:bg-white/[0.03] xl:block">
      <h2 className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Categorías</h2>
      <nav className="space-y-2">
        {EXPLORE_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.name as keyof typeof CATEGORY_ICONS]
          const isActive = normalizeCategory(selectedCategory) === category.name

          return (
            <Link
              key={category.name}
              href={createHref({ category: category.name === 'Todos' ? null : category.name })}
              className={cn(
                'flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-black transition',
                isActive
                  ? 'bg-emerald-50 text-zinc-950 shadow-sm dark:bg-emerald-400/15 dark:text-white'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
              )}
            >
              <Icon className={cn('size-5', isActive ? 'text-emerald-600' : 'text-zinc-400')} />
              {category.label}
            </Link>
          )
        })}
      </nav>

      <div className="my-8 h-px bg-zinc-200 dark:bg-white/10" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="size-4 text-zinc-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Filtros avanzados</h2>
        </div>
        <ChevronRight className="size-4 rotate-90 text-zinc-400" />
      </div>

      <div className="space-y-5">
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">Rango de precio</p>
          <input
            type="range"
            min="0"
            max="5000000"
            step="50000"
            value={maxPrice}
            onChange={(event) => updatePrice(minPrice, Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-emerald-600"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="text-[11px] font-bold text-zinc-400">Mínimo</span>
              <input
                type="number"
                min="0"
                max="5000000"
                step="50000"
                value={minPrice}
                onChange={(event) => updatePrice(Number(event.target.value), maxPrice)}
                className="mt-1 w-full bg-transparent text-base font-black text-zinc-950 outline-none dark:text-white"
                aria-label="Precio mínimo"
              />
            </label>
            <label className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="text-[11px] font-bold text-zinc-400">Máximo</span>
              <input
                type="number"
                min="0"
                max="5000000"
                step="50000"
                value={maxPrice}
                onChange={(event) => updatePrice(minPrice, Number(event.target.value))}
                className="mt-1 w-full bg-transparent text-base font-black text-zinc-950 outline-none dark:text-white"
                aria-label="Precio máximo"
              />
            </label>
          </div>
          <p className="text-center text-xs font-bold text-zinc-400">{formatCurrency(minPrice)} - {formatCurrency(maxPrice)}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">Ordenar por</span>
          <select
            value={sort}
            onChange={(event) => updateSort(event.target.value)}
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 outline-none transition focus:border-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
          >
            <option value="recent">Más recientes</option>
            <option value="products">Más productos</option>
            <option value="priceAsc">Menor precio</option>
            <option value="priceDesc">Mayor precio</option>
          </select>
        </label>

        <Link href={createHref({ sort: sort === 'recent' ? 'products' : 'recent' })} className="flex h-12 items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white text-sm font-black text-zinc-950 shadow-sm transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-white">
          <SlidersHorizontal className="size-4" />
          {sort === 'recent' ? 'Más productos' : 'Más recientes'}
        </Link>

        <Link href={theme === 'dark' ? '/explorar?theme=dark' : '/explorar'} className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-zinc-400 transition hover:text-zinc-700 dark:hover:text-white">
          Limpiar filtros
        </Link>
      </div>
    </aside>
  )
}
