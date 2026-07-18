import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import TiendaClient from '@/components/TiendaClient'

export const dynamic = 'force-dynamic'

export default async function TiendaDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // 1. Obtener la tienda real del comerciante
  const store = await prisma.store.findFirst({
    where: { userId }
  })

  if (!store) return <StoreCreationWizard />

  // 2. Obtener productos reales de la tienda para la vista previa del catálogo
  const dbProducts = await prisma.product.findMany({
    where: {
      storeId: store.id,
      active: true
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  const productsData = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    imageUrl: p.imageUrl,
    stock: p.stock
  }))

  const storeData = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    category: store.category,
    whatsapp: store.whatsapp,
    bio: store.bio,
    logoUrl: store.logoUrl,
    aiSettings: store.aiSettings,
    active: store.active
  }

  return (
    <TiendaClient initialStore={storeData} products={productsData} />
  )
}
