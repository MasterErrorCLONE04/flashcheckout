import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StoreSettingsManager from '@/components/StoreSettingsManager'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const store = await prisma.store.findFirst({
    where: { userId }
  })

  if (!store) redirect('/dashboard')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tighter glow-text uppercase">Configuración de Comandos</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Personaliza la identidad visual y operativa de tu tienda.
        </p>
      </div>

      <div className="w-full space-y-8">
        <StoreSettingsManager initialStore={store} />
        {/* Stripe Connect desactivado por migración a Mercado Pago */}
        {/* <StripeConnectSection /> */}
      </div>
    </div>
  )
}
