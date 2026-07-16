import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SmartPayBrebClient from '@/components/SmartPayBrebClient'

export const dynamic = 'force-dynamic'

export default async function SmartPayPage({
  params
}: {
  params: Promise<{ orderId: string }> | { orderId: string }
}) {
  // Await params if it is a promise (Next.js 15/16 convention)
  const resolvedParams = await params
  const { orderId } = resolvedParams

  // 1. Fetch order details with the store context
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          whatsapp: true,
          mpAccessToken: true,
          mpPublicKey: true,
          settings: true
        }
      }
    }
  })

  if (!order) {
    return notFound()
  }

  // 2. Resolve the payment URL
  let paymentUrl = ''
  if (order.mpPreferenceId) {
    // If the preference ID is generated, construct the official Mercado Pago redirection link
    // Mercado Pago Sandbox/Production URL depending on if they are in sandbox or live (init_point handles both)
    paymentUrl = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${order.mpPreferenceId}`
  } else {
    // Fallback URL if Mercado Pago is not connected or manual transfer
    paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${order.store.slug}`
  }

  // 3. Serialize items safely
  const items = Array.isArray(order.items) ? (order.items as any[]) : []

  return (
    <SmartPayBrebClient
      order={{
        id: order.id,
        customerName: order.customerName,
        total: order.total,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt.toISOString()
      }}
      store={{
        name: order.store.name,
        logoUrl: order.store.logoUrl,
        whatsapp: order.store.whatsapp
      }}
      items={items}
      paymentUrl={paymentUrl}
      brebConfig={getBrebConfig(order.store.settings)}
    />
  )
}

function getBrebConfig(settings: unknown) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  const config = (settings as Record<string, unknown>).brebConfig
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null

  const brebConfig = config as Record<string, unknown>
  return {
    enabled: Boolean(brebConfig.enabled),
    keyValue: typeof brebConfig.keyValue === 'string' ? brebConfig.keyValue : '',
    bankProvider: typeof brebConfig.bankProvider === 'string' ? brebConfig.bankProvider : '',
    merchantDisplayName: typeof brebConfig.merchantDisplayName === 'string' ? brebConfig.merchantDisplayName : '',
    participantId: typeof brebConfig.participantId === 'string' ? brebConfig.participantId : '',
    keyTypeCode: typeof brebConfig.keyTypeCode === 'string' ? brebConfig.keyTypeCode : '',
  }
}
