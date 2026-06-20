import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ManualVerificationPanel from '@/components/dashboard/ManualVerificationPanel'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

export default async function VerificacionesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      paymentStatus: 'UPLOADED',
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serializar objetos para cliente (Json -> OrderItem[])
  const serializedOrders = orders.map((o: any) => ({
    ...o,
    items: o.items as { name: string; qty: number; price: number }[],
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-4 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-display">Verificar Pagos</h1>
            <div className="text-[13px] font-medium text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Validación Manual — <span className="text-zinc-955 font-bold uppercase">{store.name}</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>
      <ManualVerificationPanel initialOrders={serializedOrders} />
    </div>
  )
}
