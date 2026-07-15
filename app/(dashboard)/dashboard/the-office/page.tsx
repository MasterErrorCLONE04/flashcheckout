import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import TheOfficeClient from '@/components/TheOfficeClient'

export const dynamic = 'force-dynamic'

type OfficeSettings = Record<string, unknown>

export default async function TheOfficePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const storeData = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    category: store.category || 'Moda',
    whatsapp: store.whatsapp,
    whatsappConnected: store.whatsappConnected,
    mpConnected: store.mpConnected,
    settings: (store.settings as OfficeSettings) || {}
  }

  // Fetch some metrics to display inside agent profiles
  const [productsCount, ordersCount, pendingOrdersCount, outOfStockCount] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id, status: 'pending' } }),
    prisma.product.count({ where: { storeId: store.id, stock: 0 } })
  ])

  return (
    <TheOfficeClient 
      store={storeData} 
      productsCount={productsCount}
      ordersCount={ordersCount}
      pendingOrdersCount={pendingOrdersCount}
      outOfStockCount={outOfStockCount}
    />
  )
}
