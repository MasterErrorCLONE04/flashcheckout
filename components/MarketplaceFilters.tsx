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
        className="w-full h-12 bg-zinc-100 border-none rounded-full pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
      />
      <div className="absolute right-2 p-2">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg group-focus-within:bg-primary transition-colors">
          <Search className="w-4 h-4 text-white" />
        </div>
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
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Categories Section */}
      <div className="bg-white rounded-[24px] border border-black/[0.03] p-6 shadow-sm overflow-hidden">
        <h3 className="font-bold text-base text-black tracking-tight mb-6 px-1">Compra por categoría</h3>
        
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
                className={`group flex items-center justify-between p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-zinc-50' : 'hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-black text-white shadow-lg shadow-black/10' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-black'
                  }`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-semibold transition-all ${
                    isActive ? 'text-black' : 'text-zinc-500 group-hover:text-black'
                  }`}>
                    {cat.name}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-all ${
                  isActive ? 'text-black opacity-100' : 'text-zinc-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`} />
              </Link>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-black/[0.03] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-sm tracking-tight m-0 text-black">Filtros Pro</h3>
        </div>

        <div className="space-y-8">
          {/* Store Filter - Only show if NOT in store view */}
          {!isStoreView && (
            <div>
              <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-4 block">Tienda Registrada</label>
              <select 
                value={initialStoreId}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="w-full h-12 bg-zinc-50 border border-black/[0.03] rounded-2xl px-4 text-xs font-semibold focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
              >
                <option value="">Todas las tiendas</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Price Filter */}
          <div>
            <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-4 block">Rango de Precio</label>
            <div className="px-1">
              <input 
                type="range"
                min="0"
                max="5000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-black h-1.5 rounded-full bg-zinc-100 mb-4 cursor-pointer hover:accent-primary transition-all"
              />
              <div className="flex justify-between items-center bg-zinc-50 rounded-xl p-3 border border-black/[0.02]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Máximo</span>
                <span className="text-xs font-black text-black tracking-tight">${maxPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          <Link 
            href="/explorar" 
            className="w-full h-12 flex items-center justify-center gap-3 text-[11px] font-bold text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest mt-4"
          >
            <X className="w-3.5 h-3.5" />
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
