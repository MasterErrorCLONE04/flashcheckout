import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import TheOfficeClient from '@/components/TheOfficeClient'

export const dynamic = 'force-dynamic'

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
    settings: (store.settings as any) || {}
  }

  // Fetch some metrics to display inside agent profiles
  const [productsCount, ordersCount] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id } })
  ])

  return (
    <TheOfficeClient 
      store={storeData} 
      productsCount={productsCount}
      ordersCount={ordersCount}
    />
  )
}
