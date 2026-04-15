import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { 
  ShoppingBag, 
  Store, 
  ChevronRight,
  Zap,
  MapPin,
  Star
} from 'lucide-react'
import { MarketplaceSearch, MarketplaceSidebarFilters } from '@/components/MarketplaceFilters'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; minPrice?: string; maxPrice?: string; storeId?: string }
}) {
  const { userId } = await auth()
  const query = searchParams.q || ''
  const category = searchParams.category || 'Todos'
  const minPrice = parseInt(searchParams.minPrice || '0')
  const maxPrice = parseInt(searchParams.maxPrice || '10000000')

  // Fetch Stores instead of Products
  const stores = await (prisma.store as any).findMany({
    where: {
      active: true,
      name: { contains: query, mode: 'insensitive' },
      category: category !== 'Todos' ? category : undefined,
      // Filter stores that have products within the price range
      products: {
        some: {
          price: { gte: minPrice, lte: maxPrice },
          active: true
        }
      }
    },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 24
  })


  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1d1d1f] font-sans pb-20">
      {/* Brand Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/60 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-950">Directorios</span>
            </div>
          </Link>

          <MarketplaceSearch initialQuery={query} />

          <div className="flex items-center gap-6 shrink-0">
             {userId ? (
               <Link href="/productos" className="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-widest transition-colors">
                 Mi cuenta
               </Link>
             ) : (
               <Link href="/sign-in" className="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-widest transition-colors">
                 Entrar
               </Link>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <MarketplaceSidebarFilters 
            stores={[]} 
            initialStoreId="" 
            initialMaxPrice={maxPrice === 10000000 ? 5000000 : maxPrice} 
            isStoreView={true}
          />

          {/* Stores Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Tiendas Destacadas</h1>
                <p className="text-sm font-medium text-zinc-500">
                  {stores.length} marcas disponibles en tu región
                </p>
              </div>
            </div>

            {stores.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {stores.map((store: any) => (
                  <MarketStoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-zinc-200/60 p-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6">
                  <Store className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">No encontramos coincidencias</h3>
                <p className="text-sm text-zinc-500 font-normal max-w-xs mx-auto">Prueba ajustando los filtros o buscando otro término más general.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function MarketStoreCard({ store }: { store: any }) {
  const productCount = store._count?.products || 0;

  return (
    <Link href={`/tienda/${store.slug}`} className="group block">
      <div className="relative aspect-square w-full bg-[#FAFAFA] rounded-2xl border border-zinc-200/60 transition-all duration-300 group-hover:border-zinc-300 overflow-hidden flex items-center justify-center p-6">
        {store.logoUrl ? (
          <img 
            src={store.logoUrl} 
            className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2 mix-blend-multiply" 
            alt={store.name} 
          />
        ) : (
          <Store className="w-10 h-10 text-zinc-200 group-hover:text-zinc-300 transition-colors duration-300" />
        )}
        
        {/* Indicador de productos en hover */}
        <div className="absolute top-3 right-3 bg-white border border-zinc-200/80 rounded-full px-2.5 py-1 flex items-center gap-1.5 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ShoppingBag className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{productCount} prod.</span>
        </div>
      </div>

      <div className="mt-4 px-1 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <h3 className="font-semibold text-sm text-zinc-900 tracking-tight truncate group-hover:text-black transition-colors duration-300">
            {store.name}
          </h3>
          <p className="text-[12px] font-medium text-zinc-500 truncate">
            {store.category || 'Tienda Digital'}
          </p>
        </div>
        <div className="w-6 h-6 rounded-full border border-zinc-200/60 flex items-center justify-center bg-white text-zinc-400 group-hover:border-black group-hover:text-white group-hover:bg-black transition-all duration-300 shrink-0 mt-0.5">
          <ChevronRight className="w-3.5 h-3.5 translate-x-[0.5px]" />
        </div>
      </div>
    </Link>
  )
}
