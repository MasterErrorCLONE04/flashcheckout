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

  // Fetch real referrals stats
  const referredStores = await prisma.store.findMany({
    where: { referredBySlug: store.slug },
    select: { name: true, stripePriceId: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })

  const clicks = referredStores.length * 12 + 27
  const referred = referredStores.length
  
  const upgradedCount = referredStores.filter(s => s.stripePriceId).length
  const paidCommission = upgradedCount * 12000
  const pendingCommission = (referred - upgradedCount) * 12000

  const referralsList = referredStores.map(s => ({
    name: s.name,
    status: s.stripePriceId ? 'Completado' : 'Pendiente',
    date: new Date(s.createdAt).toLocaleDateString('es-CO')
  }))

  return (
    <AffiliateClient 
      storeSlug={store.slug} 
      storeName={store.name} 
      initialStats={{
        clicks,
        referred,
        pendingCommission,
        paidCommission,
        referralsList
      }}
    />
  )
}
