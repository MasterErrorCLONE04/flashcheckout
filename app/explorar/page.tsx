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
    <div className="min-h-screen bg-[#F4F4F7] text-[#1d1d1f] font-sans pb-20">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] px-6 py-5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Directorio de Tiendas</span>
          </Link>

          <MarketplaceSearch initialQuery={query} />

          <div className="flex items-center gap-4 shrink-0">
             {userId ? (
               <Link href="/dashboard" className="text-xs font-bold text-zinc-400 hover:text-black uppercase tracking-widest transition-colors">
                 Mi cuenta
               </Link>
             ) : (
               <Link href="/sign-in" className="text-xs font-bold text-primary hover:text-primary/70 uppercase tracking-widest transition-colors">
                 Iniciar sesión
               </Link>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-10">

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <MarketplaceSidebarFilters 
            stores={[]} // We don't need the store list for products anymore
            initialStoreId="" 
            initialMaxPrice={maxPrice === 10000000 ? 5000000 : maxPrice} 
            isStoreView={true}
          />

          {/* Stores Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Resultados: {stores.length} {stores.length === 1 ? 'tienda encontrada' : 'tiendas encontradas'}
              </p>
            </div>

            {stores.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-8 gap-y-12">
                {stores.map((store: any) => (
                  <MarketStoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] border border-black/[0.03] p-24 text-center">
                <Store className="w-12 h-12 text-zinc-100 mx-auto mb-6" />
                <h3 className="text-lg font-bold text-black tracking-tight mb-2">No encontramos tiendas</h3>
                <p className="text-sm text-zinc-400 font-medium">Intenta ajustando el rango de precios o la categoría.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function MarketStoreCard({ store }: { store: any }) {
  return (
    <Link href={`/tienda/${store.slug}`} className="group flex flex-col gap-4">
      {/* Brand Box */}
      <div className="aspect-square w-full bg-white rounded-[2rem] border border-black/[0.03] shadow-sm flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-black/5 group-hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.01]" />
        
        {store.logoUrl ? (
          <img 
            src={store.logoUrl} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10" 
            alt={store.name} 
          />
        ) : (
          <Store className="w-12 h-12 text-zinc-200 relative z-10" />
        )}
      </div>

      {/* Brand Info - Below Card */}
      <div className="px-1">
        <h3 className="font-bold text-sm text-[#1d1d1f] tracking-tight truncate group-hover:text-primary transition-colors">
          {store.name}
        </h3>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
          {store.category || 'General'}
        </p>
      </div>
    </Link>
  )
}
