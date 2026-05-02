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

      if (order.source === 'WHATSAPP' && order.customerWhatsAppId && newStatus === 'PAID') {
        try {
          await waClient.sendText(
            order.customerWhatsAppId,
            `¡Pago confirmado! 🎉\n\nTu pedido *#${order.id.slice(-6)}* por un total de $${order.total.toLocaleString()} ha sido procesado exitosamente.\n\n¡Gracias por usar StoreFCheckout! 🚀`
          )
          // Enviar factura electrónica por WhatsApp
          await sendInvoiceToWhatsApp(orderId)
        } catch (error) {
          console.error('[MP Webhook] Failed to send WhatsApp confirmation', error)
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (e) {
    console.error('[MP Webhook Error]', e)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
