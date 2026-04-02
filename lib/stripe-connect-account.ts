import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

type StoreRow = {
  id: string
  stripeConnectAccountId: string | null
}

/**
 * Crea la cuenta Connect Express si no existe y devuelve el ID de Stripe.
 */
export async function ensureConnectAccount(
  store: StoreRow,
  clerkUserId: string,
  email: string | undefined
): Promise<string> {
  if (store.stripeConnectAccountId) {
    return store.stripeConnectAccountId
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'CO',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      storeId: store.id,
      clerkUserId,
    },
  })

  await prisma.store.update({
    where: { id: store.id },
    data: {
      stripeConnectAccountId: account.id,
      stripeConnectChargesEnabled: false,
    },
  })

  return account.id
}
