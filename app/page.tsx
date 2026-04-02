import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import LandingContent from '@/components/LandingContent'

export default async function HomePage() {
  const { userId } = await auth()
  const stores = await prisma.store.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: 12
  })

  return <LandingContent userId={userId || null} stores={stores} />
}
