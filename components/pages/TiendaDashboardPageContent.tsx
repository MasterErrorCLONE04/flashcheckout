import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { getDemoPreviewProducts } from '@/lib/store-blueprints/demo-products'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import TiendaClient from '@/components/TiendaClient'

export const dynamic = 'force-dynamic'

export default async function TiendaDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // 1. Obtener la tienda activa del comerciante (respeta selector multi-negocio)
  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  // 2. Obtener todos los productos activos (hasta 48) con categorías y variantes para colecciones/swatches
  const dbProducts = await prisma.product.findMany({
    where: {
      storeId: store.id,
      active: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 48,
  })

  const productsData =
    dbProducts.length > 0
      ? dbProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          imageUrl: p.imageUrl,
          stock: p.stock,
          category: p.category,
          description: p.description,
          options: p.options,
        }))
      : getDemoPreviewProducts(store.category, store.bio)

  const storeData = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    category: store.category,
    whatsapp: store.whatsapp,
    bio: store.bio,
    logoUrl: store.logoUrl,
    aiSettings: store.aiSettings,
    active: store.active,
  }

  return <TiendaClient key={storeData.id} initialStore={storeData} products={productsData} />
}
