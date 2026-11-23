import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

type AnalyticsOrderItem = {
  name?: string
  qty?: number | string
  price?: number | string
}

const PAID_STATUSES = ['paid', 'confirmed', 'in_transit', 'shipped_external', 'delivered']
const PAID_PAYMENT_STATUSES = ['PAID', 'CONFIRMED']

function isOrderPaid(order: { status: string; paymentStatus: string }): boolean {
  if (order.status === 'cancelled' || order.status === 'rejected') return false
  return (
    PAID_PAYMENT_STATUSES.includes(order.paymentStatus) ||
    PAID_STATUSES.includes(order.status)
  )
}

export default async function AnaliticaPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)
  if (!store) return <StoreCreationWizard />

  const [orders, whatsappSessionsCount, activeProductsCount] = await Promise.all([
    prisma.order.findMany({
      where: {
        storeId: store.id,
        status: { notIn: ['cancelled', 'rejected'] },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.whatsAppSession.count({
      where: { storeId: store.id },
    }),
    prisma.product.count({
      where: { storeId: store.id, active: true },
    }),
  ])

  const serializedOrders = orders.map(o => {
    const items = Array.isArray(o.items)
      ? (o.items as AnalyticsOrderItem[]).map(i => ({
          name: String(i.name || 'Producto'),
          qty: Math.max(1, Number(i.qty) || 1),
          price: Math.max(0, Number(i.price) || 0),
        }))
      : []

    return {
      id: o.id,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      city: o.city || 'Sin ciudad',
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      source: o.source || 'WEB',
      isPaid: isOrderPaid(o),
      isUploaded: o.paymentStatus === 'UPLOADED',
      createdAt: o.createdAt.toISOString(),
      items,
    }
  })

  return (
    <AnalyticsDashboard
      storeName={store.name}
      storeSlug={store.slug}
      orders={serializedOrders}
      whatsappSessionsCount={whatsappSessionsCount}
      activeProductsCount={activeProductsCount}
    />
  )
}
