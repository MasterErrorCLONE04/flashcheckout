import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import AffiliateClient from '@/components/AffiliateClient'

export const dynamic = 'force-dynamic'

export default async function AffiliatePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)
  if (!store) {
    return <StoreCreationWizard />
  }

  // Real referrals from database (zero simulated click formulas)
  const referredStores = await prisma.store.findMany({
    where: { referredBySlug: store.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      stripePriceId: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const referredCount = referredStores.length
  const upgradedCount = referredStores.filter(s => Boolean(s.stripePriceId)).length
  const paidCommission = upgradedCount * 12000
  const pendingCommission = Math.max(0, referredCount - upgradedCount) * 12000

  const referralsList = referredStores.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    status: s.stripePriceId ? 'Suscripción Pro' : 'Registrada (Plan Gratis)',
    isPro: Boolean(s.stripePriceId),
    date: new Date(s.createdAt).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  return (
    <AffiliateClient
      storeSlug={store.slug}
      storeName={store.name}
      initialStats={{
        referred: referredCount,
        upgradedCount,
        pendingCommission,
        paidCommission,
        referralsList,
      }}
    />
  )
}
