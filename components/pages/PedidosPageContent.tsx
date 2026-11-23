import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrderList from '@/components/OrderList'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import { getActiveStore } from '@/lib/store-context'

export const dynamic = 'force-dynamic'

export default async function PedidosPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
    },
    include: { driver: true },
    orderBy: { createdAt: 'desc' },
  })

  const serializedOrders = orders.map(o => ({
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone || o.customerWhatsAppId || null,
    address: o.address,
    city: o.city,
    items: Array.isArray(o.items)
      ? (o.items as Array<{ name?: string; title?: string; qty?: number; quantity?: number; price?: number }>).map(
          it => ({
            name: it.name || it.title || 'Producto',
            qty: Number(it.qty ?? it.quantity ?? 1) || 1,
            price: Number(it.price ?? 0) || 0,
          })
        )
      : [],
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    proofImageUrl: o.proofImageUrl || null,
    externalCarrier: o.externalCarrier || null,
    trackingNumber: o.trackingNumber || null,
    createdAt: o.createdAt.toISOString(),
    deliveryRequested: o.deliveryRequested,
    source: o.source || 'WEB',
    driverId: o.driverId,
    driver: o.driver,
  }))

  return <OrderList initialOrders={serializedOrders} storeName={store.name} />
}
