import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import AffiliateClient from '@/components/AffiliateClient'

export default async function AffiliatePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
    select: { slug: true, name: true }
  })

  if (!store) {
    return <StoreCreationWizard />
  }

  return <AffiliateClient storeSlug={store.slug} storeName={store.name} />
}
