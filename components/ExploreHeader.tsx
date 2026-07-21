import Link from 'next/link'
import { Zap } from 'lucide-react'
import ExploreSearch from '@/components/ExploreSearch'
import ExploreThemeToggle from '@/components/ExploreThemeToggle'
import type { ExploreTheme } from '@/components/ExploreTypes'

export default function ExploreHeader({
  query,
  userId,
  theme,
}: {
  query: string
  userId: string | null
  theme: ExploreTheme
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90">
      <div className="mx-auto flex min-h-20 max-w-[1800px] flex-wrap items-center gap-4 px-5 py-4 md:flex-nowrap md:gap-6 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 group transition-all hover:opacity-85">
          <span className="flex size-10 items-center justify-center rounded-xl bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] dark:bg-white dark:text-zinc-950 group-hover:scale-105 transition-transform">
            <Zap className="size-5 fill-white stroke-white text-white dark:fill-zinc-950 dark:stroke-zinc-950 dark:text-zinc-950" />
          </span>
          <span className="text-2xl font-bold tracking-[-0.04em] text-zinc-950 dark:text-white">Directorios</span>
        </Link>

        <div className="order-3 w-full md:order-none md:mx-auto md:max-w-[670px]">
          <ExploreSearch initialQuery={query} />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <ExploreThemeToggle theme={theme} />
          <div className="hidden h-10 w-px bg-zinc-200 dark:bg-white/10 md:block" />
          {userId ? (
            <Link href="/dashboard" className="rounded-xl bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(0,0,0,0.18)] dark:bg-white dark:text-zinc-950">
              Mi cuenta
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-black text-zinc-950 shadow-sm transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/10 dark:text-white">
                Entrar
              </Link>
              <Link href="/sign-up" className="hidden rounded-xl bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(0,0,0,0.18)] dark:bg-white dark:text-zinc-950 sm:inline-flex">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
