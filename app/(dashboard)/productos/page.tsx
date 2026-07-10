import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import ProductManager from '@/components/ProductManager'
import StoreCreationWizard from '@/components/StoreCreationWizard'

import { getActiveStore } from '@/lib/store-context'

export default async function ProductosPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  })

  const isPro = await checkSubscription()

  return (
    <div className="animate-fade-in">
      <ProductManager initialProducts={products} storeId={store.id} storeSlug={store.slug} isPro={isPro} />
    </div>
  )
}
