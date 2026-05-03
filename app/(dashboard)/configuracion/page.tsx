import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import StoreSettingsManager from '@/components/StoreSettingsManager'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const store = await prisma.store.findFirst({
    where: { userId }
  })

  if (!store) return <StoreCreationWizard />

  const isPro = await checkSubscription()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Configuración</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Personaliza la identidad visual y operativa de tu tienda.
        </p>
      </div>

      <div className="w-full space-y-8">
        <StoreSettingsManager initialStore={store} isPro={isPro} />
      </div>
    </div>
  )
}
