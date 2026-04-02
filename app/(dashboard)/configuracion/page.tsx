import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/SettingsForm'
import StripeConnectSection from '@/components/StripeConnectSection'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
    select: {
      id: true,
      name: true,
      whatsapp: true,
      bio: true,
      logoUrl: true,
    },
  })

  if (!store) redirect('/') // if no store, they should see onboarding

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza cómo se ve tu tienda ante los clientes.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        <SettingsForm initialStore={store} />
        {/* Stripe Connect desactivado por migración a Mercado Pago */}
        {/* <StripeConnectSection /> */}
      </div>
    </div>
  )
}
