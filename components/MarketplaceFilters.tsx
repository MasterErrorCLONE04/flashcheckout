'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Zap, 
  ChevronRight, 
  Cpu, 
  Shirt, 
  Home, 
  Dog, 
  UtensilsCrossed, 
  Sparkles, 
  Briefcase,
  LayoutGrid
} from 'lucide-react'
import Link from 'next/link'

interface StoreInfo {
  id: string
  name: string
}

export function MarketplaceSearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(pathname + '?' + createQueryString('q', query))
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl group flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca marcas o categorías favoritas..."
        className="w-full h-11 bg-white border border-zinc-200/60 rounded-full pl-6 pr-14 text-sm font-medium focus:ring-4 focus:ring-black/[0.03] focus:border-zinc-300 transition-all outline-none"
      />
      <div className="absolute right-1.5 p-1">
        <button 
          type="submit"
          className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Search className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </form>
  )
}

export function MarketplaceSidebarFilters({ 
  stores, 
  initialStoreId, 
  initialMaxPrice,
  isStoreView = false
}: { 
  stores: StoreInfo[]
  initialStoreId: string
  initialMaxPrice: number
  isStoreView?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)
      return params.toString()
    },
    [searchParams]
  )

  const handleStoreChange = (id: string) => {
    router.push(pathname + '?' + createQueryString('storeId', id))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (maxPrice !== initialMaxPrice) {
        router.push(pathname + '?' + createQueryString('maxPrice', maxPrice.toString()))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [maxPrice, initialMaxPrice, pathname, createQueryString, router])

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-8">
      {/* Categories Section */}
      <div className="space-y-5">
        <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-[0.15em] px-1">Categorías</h3>
        
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const currentCat = searchParams.get('category') || 'Todos'
            const isActive = currentCat === cat.name
            
            const targetParams = new URLSearchParams(searchParams.toString())
            if (cat.name === 'Todos') targetParams.delete('category')
            else targetParams.set('category', cat.name)

            return (
              <Link
                key={cat.name}
                href={`${pathname}?${targetParams.toString()}`}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-white border border-zinc-200/60 shadow-sm' : 'hover:bg-zinc-100/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600'
                  }`}>
                    <cat.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-[13.5px] font-semibold transition-all ${
                    isActive ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-900'
                  }`}>
                    {cat.name}
                  </span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 mr-1" />}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-zinc-200/60">
        <div className="flex items-center gap-2 px-1">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-[0.15em]">Filtros Avanzados</h3>
        </div>

        <div className="space-y-8">
          {/* Store Filter - Only show if NOT in store view */}
          {!isStoreView && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Tienda</label>
              <select 
                value={initialStoreId}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="w-full h-11 bg-white border border-zinc-200/60 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-black/[0.03] transition-all cursor-pointer appearance-none outline-none"
              >
                <option value="">Todas las tiendas</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Price Filter */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Rango de Precio</label>
            <div className="px-1">
              <input 
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-zinc-950 h-1 rounded-full bg-zinc-200 mb-6 cursor-pointer"
              />
              <div className="flex justify-between items-center bg-white rounded-xl p-3 border border-zinc-200/60 shadow-sm">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">Máximo</span>
                <span className="text-sm font-bold text-zinc-950 tracking-tight">${maxPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          <Link 
            href="/explorar" 
            className="w-full h-11 flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest outline-none"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </Link>
        </div>
      </div>
    </aside>
  )
}

const CATEGORIES = [
  { name: 'Tecnología', icon: Cpu },
  { name: 'Moda', icon: Shirt },
  { name: 'Hogar', icon: Home },
  { name: 'Mascotas', icon: Dog },
  { name: 'Alimentos', icon: UtensilsCrossed },
  { name: 'Belleza', icon: Sparkles },
  { name: 'Servicios', icon: Briefcase },
  { name: 'Todos', icon: LayoutGrid },
]
