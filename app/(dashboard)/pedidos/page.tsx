import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrderList from '@/components/OrderList'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export default async function PedidosPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: { driver: true },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize to plain objects for client component (Json → OrderItem[])
  const serializedOrders = orders.map((o: any) => ({
    ...o,
    items: o.items as { name: string; qty: number; price: number }[],
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6 pb-2 animate-in">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 font-display">Pedidos</h1>
            <div className="text-[15px] font-medium text-zinc-500 mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Monitoreo en Tiempo Real — <span className="text-zinc-950 font-bold">{serializedOrders.length} {serializedOrders.length === 1 ? 'MÓDULO ACTIVO' : 'MÓDULOS ACTIVOS'}</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>
      <OrderList initialOrders={serializedOrders} storeName={store.name} />
    </div>
  )
}
