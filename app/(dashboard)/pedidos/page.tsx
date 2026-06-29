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
    where: {
      storeId: store.id,
      OR: [
        {
          mpPreferenceId: null,
          stripeCheckoutSessionId: null,
        },
        {
          paymentStatus: 'PAID',
        },
        {
          status: 'paid',
        },
      ],
    },
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
    <OrderList initialOrders={serializedOrders} storeName={store.name} />
  )
}
