import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import StoreSettingsManager from '@/components/StoreSettingsManager'

export const dynamic = 'force-dynamic'

import { getActiveStore } from '@/lib/store-context'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const isPro = await checkSubscription()

  return (
    <div className="pb-12 animate-in">
      <StoreSettingsManager initialStore={store} isPro={isPro} />
    </div>
  )
}
