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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tighter glow-text uppercase">Configuración de Comandos</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Personaliza la identidad visual y operativa de tu tienda.
        </p>
      </div>

      <div className="w-full space-y-8">
        <SettingsForm initialStore={store} />
        {/* Stripe Connect desactivado por migración a Mercado Pago */}
        {/* <StripeConnectSection /> */}
      </div>
    </div>
  )
}
