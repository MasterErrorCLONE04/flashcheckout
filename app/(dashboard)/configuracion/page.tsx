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
    <div className="space-y-4 pb-12 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-display">Configuración</h1>
            <div className="text-[13px] font-medium text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Gestión de Tienda — <span className="text-zinc-950 font-bold">AJUSTES Y PREFERENCIAS</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>

      <div className="w-full">
        <StoreSettingsManager initialStore={store} isPro={isPro} />
      </div>
    </div>
  )
}
