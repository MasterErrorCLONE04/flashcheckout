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
  const hasPriceFilter = minPrice > 0 || maxPrice < 5000000
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
      ...(category !== 'Todos' && category !== 'Tiendas'
        ? { category: { equals: normalizedCategory, mode: 'insensitive' as const } }
        : {}),
      ...(hasPriceFilter
        ? {
            products: {
              some: {
                price: { gte: minPrice, lte: maxPrice },
                active: true,
              },
            },
          }
        : {}),
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
