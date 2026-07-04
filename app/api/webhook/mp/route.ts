import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mpPayment } from '@/lib/mercadopago'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { sendInvoiceToWhatsApp } from '@/lib/whatsapp/send-invoice'


export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || searchParams.get('topic')
    const id = searchParams.get('data.id') || searchParams.get('id')

    console.log(`[MP Webhook] Received notification: type=${type}, id=${id}`)

    // Solo procesamos notificaciones de pagos
    if (type === 'payment' && id) {
      // ✅ SIEMPRE verificamos el estado del pago consultando a la API de Mercado Pago
      // Esto previene fraude o payloads falsos.
      const payment = await mpPayment.get({ id })
      
      const orderId = payment.external_reference
      const status = payment.status

      if (!orderId) {
        console.error('[MP Webhook] No external_reference found in payment', id)
        return new Response('No order reference', { status: 400 })
      }

      console.log(`[MP Webhook] Processing Order ${orderId}: Status is ${status}`)

      let newStatus: 'PAID' | 'FAILED' | 'PENDING' = 'PENDING'
      let legacyStatus = 'pending_payment'

      if (status === 'approved') {
        newStatus = 'PAID'
        legacyStatus = 'paid'
      } else if (['rejected', 'cancelled'].includes(status || '')) {
        newStatus = 'FAILED'
        legacyStatus = 'cancelled'
      } else {
        newStatus = 'PENDING'
        legacyStatus = 'pending_payment'
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: newStatus,
          status: legacyStatus,
          mpPaymentId: String(id),
        },
      })

      // Resolve dynamic waClient for notifications
      let clientToUse: any = waClient;
      let store: any = null;
      try {
        store = await prisma.store.findUnique({
          where: { id: order.storeId },
        });
        if (store && store.whatsappInstanceName && store.whatsappConnected) {
          const { evolutionClient } = await import('@/lib/whatsapp/evolution');
          clientToUse = {
            sendText: (to: string, msg: string) => evolutionClient.sendText(store.whatsappInstanceName!, to, msg),
            sendButtons: (to: string, msg: string, btns: any[]) => evolutionClient.sendButtons(store.whatsappInstanceName!, to, msg, btns)
          };
        }
      } catch (err) {
        console.error('[MP Webhook] Error resolving dynamic waClient:', err);
      }

      if (order.source === 'WHATSAPP' && order.customerWhatsAppId && newStatus === 'PAID') {
        try {
          await clientToUse.sendText(
            order.customerWhatsAppId,
            `¡Pago confirmado! 🎉\n\nTu pedido *#${order.id.slice(-6)}* por un total de $${order.total.toLocaleString()} ha sido procesado exitosamente.\n\n¡Gracias por usar StoreFCheckout! 🚀`
          )
          // Enviar factura electrónica por WhatsApp
          await sendInvoiceToWhatsApp(orderId)
        } catch (error) {
          console.error('[MP Webhook] Failed to send WhatsApp confirmation', error)
        }
      }

      // Notificar al dueño de la tienda por WhatsApp sobre la nueva venta y sugerir domicilio
      if (newStatus === 'PAID') {
        try {
          if (store && store.whatsapp) {
            await clientToUse.sendText(
              store.whatsapp,
              `📦 *¡Nuevo pedido recibido!* 🎉\n\nHola, tienes una nueva venta en tu tienda *${store.name}*:\n\n*Detalles del pedido:*\n• *ID:* #${order.id.slice(-6)}\n• *Cliente:* ${order.customerName}\n• *Teléfono:* ${order.customerPhone || 'N/A'}\n• *Dirección de Entrega:* ${order.address}, ${order.city}\n• *Total:* $${order.total.toLocaleString('es-CO')}`
            )

            await clientToUse.sendButtons(
              store.whatsapp,
              `🚚 *¿Te gustaría solicitar nuestro Servicio de Domicilio?*\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequeña cuota de *$5.000 COP* (se descontará del pago final de la orden).`,
              [
                { id: `delivery_yes_${order.id}`, title: 'SÍ' },
                { id: `delivery_no_${order.id}`, title: 'NO' }
              ]
            )
          }
        } catch (error) {
          console.error('[MP Webhook] Failed to notify store owner via WhatsApp', error)
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (e) {
    console.error('[MP Webhook Error]', e)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
