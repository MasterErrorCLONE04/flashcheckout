import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { checkSubscription } from '@/lib/subscription'
import { getActiveStore } from '@/lib/store-context'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import StoreSettingsManager from '@/components/StoreSettingsManager'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const isPro = await checkSubscription()

  return <StoreSettingsManager initialStore={store} isPro={isPro} />
}
