import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import ExploreDirectoryShell from '@/components/ExploreDirectoryShell'
import type { ExploreSearchParams, ExploreStore, ExploreTheme } from '@/components/ExploreTypes'

export const dynamic = 'force-dynamic'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>
}) {
  const params = await searchParams
  const { userId } = await auth()
  const query = params.q?.trim() || ''
  const category = params.category || 'Todos'
  const minPrice = parsePriceParam(params.minPrice, 0)
  const maxPrice = Math.max(minPrice, parsePriceParam(params.maxPrice, 5000000))
  const sort = params.sort || 'recent'
  const theme: ExploreTheme = params.theme === 'dark' ? 'dark' : 'light'

  const normalizedCategory = category === 'Tecnologia' ? 'Tecnología' : category
  const stores = await prisma.store.findMany({
    where: {
      active: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { category: { contains: query, mode: 'insensitive' as const } },
              { bio: { contains: query, mode: 'insensitive' as const } },
              { products: { some: { active: true, name: { contains: query, mode: 'insensitive' as const } } } },
            ],
          }
        : {}),
      ...(category !== 'Todos'
        ? { category: { equals: normalizedCategory, mode: 'insensitive' as const } }
        : {}),
      products: {
        some: {
          price: { gte: minPrice, lte: maxPrice },
          active: true
        }
      }
    },
    include: {
      products: {
        where: { active: true },
        select: { id: true, name: true, price: true, imageUrl: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  const sortedStores = sortStores(stores, sort).slice(0, 18)

  const totalStores = await prisma.store.count({
    where: {
      active: true,
      products: { some: { active: true } },
    },
  })


  return (
    <ExploreDirectoryShell
      stores={sortedStores}
      totalStores={totalStores}
      query={query}
      selectedCategory={category}
      minPrice={minPrice}
      maxPrice={maxPrice}
      sort={sort}
      theme={theme}
      userId={userId}
    />
  )
}

function sortStores(stores: ExploreStore[], sort: string) {
  const getMinPrice = (store: ExploreStore) => {
    if (store.products.length === 0) return Number.POSITIVE_INFINITY
    return Math.min(...store.products.map((product) => product.price))
  }

  const getMaxPrice = (store: ExploreStore) => {
    if (store.products.length === 0) return 0
    return Math.max(...store.products.map((product) => product.price))
  }

  return [...stores].sort((a, b) => {
    if (sort === 'products') return b._count.products - a._count.products
    if (sort === 'priceAsc') return getMinPrice(a) - getMinPrice(b)
    if (sort === 'priceDesc') return getMaxPrice(b) - getMaxPrice(a)
    return 0
  })
}

function parsePriceParam(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || '', 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(0, Math.min(parsed, 5000000))
}

/*
      <main className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters * /}
          <MarketplaceSidebarFilters 
            stores={[]} 
            initialStoreId="" 
            initialMaxPrice={maxPrice === 10000000 ? 5000000 : maxPrice} 
            isStoreView={true}
          />

          {/* Stores Grid * /}
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
        
        {/* Indicador de productos en hover * /}
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
*/
