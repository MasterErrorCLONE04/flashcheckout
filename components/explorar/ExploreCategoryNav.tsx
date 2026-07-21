'use client'

import Link from 'next/link'
import {
  Bike,
  Trophy,
  Zap,
  Headphones,
  Wrench,
  Shirt,
  Grid,
  ChevronRight,
} from 'lucide-react'

const CATEGORIES = [
  { name: 'Vehículos y transporte', icon: Bike, slug: 'Vehículos' },
  { name: 'Deportes y entretenimiento', icon: Trophy, slug: 'Deportes' },
  { name: 'Energía renovable', icon: Zap, slug: 'Energía' },
  { name: 'Electrónica de consumo', icon: Headphones, slug: 'Tecnología' },
  { name: 'Maquinaria industrial', icon: Wrench, slug: 'Maquinaria' },
  { name: 'Ropa y accesorios', icon: Shirt, slug: 'Moda' },
  { name: 'Todas las categorías', icon: Grid, slug: 'Todos' },
]

export default function ExploreCategoryNav({ selectedCategory }: { selectedCategory: string }) {
  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 h-full flex flex-col justify-between">
      <div>
        <h3 className="mb-4 text-sm font-bold text-[#111827] dark:text-white">
          Compra por categoría
        </h3>

        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase()

            return (
              <Link
                key={cat.name}
                href={`/explorar?category=${encodeURIComponent(cat.slug)}`}
                className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-zinc-100 text-black dark:bg-white/10 dark:text-white font-bold'
                    : 'text-zinc-700 hover:bg-zinc-50 hover:text-black dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <span className="truncate text-xs font-semibold">{cat.name}</span>
                </div>
                <ChevronRight className="size-3.5 text-zinc-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
