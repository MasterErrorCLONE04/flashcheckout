import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { FREE_STORE_LIMIT, PRO_STORE_LIMIT } from './store-limits'

export { FREE_STORE_LIMIT, PRO_STORE_LIMIT }

const DAY_IN_MS = 86_400_000

export async function checkSubscriptionForUser(userId: string): Promise<boolean> {
  if (!userId) return false

  const stores = await prisma.store.findMany({
    where: { userId },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  })

  if (stores.length === 0) return false

  const proPriceId = process.env.STRIPE_PRO_PRICE_ID?.trim()

  return stores.some(store => {
    if (!store.stripePriceId) return false
    if (store.stripeCurrentPeriodEnd) {
      return store.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()
    }
    return Boolean(proPriceId && store.stripePriceId === proPriceId)
  })
}

export async function getStorePlanStatus(userId: string): Promise<{
  isPro: boolean
  maxStores: number
  currentStores: number
}> {
  const [isPro, currentStores] = await Promise.all([
    checkSubscriptionForUser(userId),
    prisma.store.count({ where: { userId } }),
  ])

  return {
    isPro,
    maxStores: isPro ? PRO_STORE_LIMIT : FREE_STORE_LIMIT,
    currentStores,
  }
}

export const checkSubscription = async (): Promise<boolean> => {
  const { userId } = await auth()
  if (!userId) return false
  return checkSubscriptionForUser(userId)
}
