'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export default function ExploreSearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
    <form onSubmit={handleSubmit} className="relative flex w-full items-center">
      <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Busca marcas, categorías o tiendas..."
        className="h-12 w-full rounded-full border border-zinc-200/80 bg-white pl-12 pr-16 text-sm font-semibold text-zinc-700 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-black/[0.03]"
      />
      <button
        type="submit"
        className="absolute right-1.5 flex size-9 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:scale-105 active:scale-95"
        aria-label="Buscar"
      >
        <Search className="size-4" />
      </button>
    </form>
  )
}
