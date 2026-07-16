'use client'

import { Moon, Sun } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ExploreTheme } from '@/components/ExploreTypes'

export default function ExploreThemeToggle({ theme }: { theme: ExploreTheme }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDark = theme === 'dark'

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('theme', isDark ? 'light' : 'dark')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="hidden size-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 md:flex"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
