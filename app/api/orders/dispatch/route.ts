import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initiateDispatchOffer } from '@/lib/dispatch/matching-algorithm'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, deliveryType, externalCarrier, trackingNumber, storeLat = 4.6097, storeLng = -74.0817 } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // A. Envío Externo (Transportadora / Repartidor propio)
    if (deliveryType === 'EXTERNAL') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'shipped_external',
          deliveryType: 'EXTERNAL',
          externalCarrier: externalCarrier || 'Envío Externo',
          trackingNumber: trackingNumber || null,
        },
      })

      // Enviar notificación automática por WhatsApp al cliente
      const recipient = order.customerPhone || order.customerWhatsAppId
      if (recipient) {
        const carrierName = externalCarrier || 'repartidor externo'
        const trackingText = trackingNumber ? ` (Guía: ${trackingNumber})` : ''
        const msg =
          `🚚 *¡Tu pedido ha sido enviado!*\n\n` +
          `Hola *${order.customerName}*, tu pedido #${order.id.slice(-6).toUpperCase()} en *${order.store.name}* va en camino mediante *${carrierName}*${trackingText}.\n\n` +
          `Cuando recibas tu paquete en tus manos, confirma respondiendo *'RECIBIDO'* a este chat para finalizar tu pedido.`

        try {
          if (order.store.whatsappInstanceName && order.store.whatsappConnected) {
            const { evolutionClient } = await import('@/lib/whatsapp/evolution')
            await evolutionClient.sendText(order.store.whatsappInstanceName, recipient, msg)
          }
        } catch (msgErr) {
          console.error('[Dispatch External Notify Error]', msgErr)
        }
      }

      return NextResponse.json({ success: true, mode: 'EXTERNAL', order: updatedOrder })
    }

    // B. Despacho Interno por Algoritmo FlashCheckout
    const dispatchResult = await initiateDispatchOffer(orderId, storeLat, storeLng)

    if (!dispatchResult.success) {
      return NextResponse.json({
        success: false,
        message: dispatchResult.message,
        rankedDrivers: [],
      })
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { driverOffers: true },
    })

    return NextResponse.json({
      success: true,
      mode: 'INTERNAL',
      assignedDriver: dispatchResult.assignedDriver,
      rankedDriversCount: dispatchResult.rankedCount,
      order: updatedOrder,
    })
  } catch (error: unknown) {
    console.error('[API Order Dispatch Error]', error)
    return NextResponse.json(
      { error: 'Error al procesar el despacho' },
      { status: 500 }
    )
  }
}
