import type { ExploreCategory } from '@/components/ExploreTypes'

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { name: 'Todos', label: 'Todos' },
  { name: 'Tecnologia', label: 'Tecnología' },
  { name: 'Moda', label: 'Moda' },
  { name: 'Hogar', label: 'Hogar' },
  { name: 'Mascotas', label: 'Mascotas' },
  { name: 'Alimentos', label: 'Alimentos' },
  { name: 'Belleza', label: 'Belleza' },
  { name: 'Servicios', label: 'Servicios' },
]

export const CATEGORY_THEMES: Record<string, { cover: string }> = {
  Tecnologia: { cover: 'from-zinc-950 via-zinc-800 to-zinc-600' },
  Moda: { cover: 'from-pink-300 via-rose-200 to-amber-100' },
  Hogar: { cover: 'from-stone-200 via-emerald-100 to-lime-100' },
  Mascotas: { cover: 'from-orange-200 via-amber-100 to-lime-100' },
  Alimentos: { cover: 'from-amber-200 via-yellow-100 to-emerald-100' },
  Belleza: { cover: 'from-fuchsia-200 via-pink-100 to-white' },
  Servicios: { cover: 'from-sky-200 via-blue-100 to-white' },
  General: { cover: 'from-emerald-100 via-teal-50 to-white' },
}

export function normalizeCategory(category?: string | null) {
  if (!category) return 'General'

  return category.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`
}
