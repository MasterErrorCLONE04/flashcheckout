import { cookies } from 'next/headers'
import { Prisma, Store } from '@prisma/client'
import { prisma } from './prisma'

export async function getActiveStore(
  userId: string,
  include?: Prisma.StoreFindFirstArgs['include'],
  preferredStoreId?: string | null
) {
  const cookieStore = await cookies()
  const targetStoreId = preferredStoreId || cookieStore.get('active_store_id')?.value

  let store: Store | null = null
  if (targetStoreId) {
    store = await prisma.store.findFirst({
      where: { id: targetStoreId, userId },
      ...(include && { include }),
    })
  }

  if (!store) {
    store = await prisma.store.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      ...(include && { include }),
    })
  }

  return store
}
