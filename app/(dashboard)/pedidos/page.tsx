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
    orderBy: { createdAt: 'desc' },
  })

  // Serialize to plain objects for client component (Json → OrderItem[])
  const serializedOrders = orders.map((o: any) => ({
    ...o,
    items: o.items as { name: string; qty: number; price: number }[],
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Pedidos</h1>
          <div className="text-sm font-medium text-zinc-500 mt-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            Monitoreo en Tiempo Real — {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </div>
        </div>
      </div>
      <OrderList initialOrders={serializedOrders} storeName={store.name} />
    </div>
  )
}
