import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

const DAY_IN_MS = 86_400_000

export const checkSubscription = async () => {
  const { userId } = await auth()

  if (!userId) {
    return false
  }

  const store = await prisma.store.findFirst({
    where: { userId },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  })

  if (!store) {
    return false
  }

  const isValid =
    store.stripePriceId &&
    store.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

  return !!isValid
}
