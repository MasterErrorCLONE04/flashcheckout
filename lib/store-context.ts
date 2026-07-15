import { cookies } from 'next/headers'
import { Prisma, Store } from '@prisma/client'
import { prisma } from './prisma'

export async function getActiveStore(
  userId: string,
  include?: Prisma.StoreFindFirstArgs['include']
) {
  const cookieStore = await cookies()
  const activeStoreId = cookieStore.get('active_store_id')?.value

  let store: Store | null = null
  if (activeStoreId) {
    store = await prisma.store.findFirst({
      where: { id: activeStoreId, userId },
      ...(include && { include })
    })
  }

  if (!store) {
    store = await prisma.store.findFirst({
      where: { userId },
      ...(include && { include })
    })
  }

  return store
}
