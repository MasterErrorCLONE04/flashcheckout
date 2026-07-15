import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mpPayment } from '@/lib/mercadopago'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { sendInvoiceToWhatsApp } from '@/lib/whatsapp/send-invoice'

type WhatsAppNotifier = {
  sendText: (to: string, message: string) => Promise<unknown>
  sendButtons: (
    to: string,
    message: string,
    buttons: Array<{ id: string; title: string }>
  ) => Promise<unknown>
}

type AutomationTemplate = {
  id: string
  customTemplate: string | null
}

type StoreNotificationTarget = {
  id: string
  name: string
  whatsapp: string
  whatsappInstanceName: string | null
  whatsappConnected: boolean
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || searchParams.get('topic')
    const id = searchParams.get('data.id') || searchParams.get('id')

    console.log(`[MP Webhook] Received notification: type=${type}, id=${id}`)

    if (type !== 'payment' || !id) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

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
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newStatus,
        status: legacyStatus,
        mpPaymentId: String(id),
      },
    })

    let clientToUse: WhatsAppNotifier = waClient
    let store: StoreNotificationTarget | null = null

    try {
      store = await prisma.store.findUnique({
        where: { id: order.storeId },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          whatsappInstanceName: true,
          whatsappConnected: true,
        },
      })

      if (store?.whatsappInstanceName && store.whatsappConnected) {
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        clientToUse = {
          sendText: (to: string, message: string) =>
            evolutionClient.sendText(store.whatsappInstanceName!, to, message),
          sendButtons: (
            to: string,
            message: string,
            buttons: Array<{ id: string; title: string }>
          ) => evolutionClient.sendButtons(store.whatsappInstanceName!, to, message, buttons),
        }
      }
    } catch (err) {
      console.error('[MP Webhook] Error resolving dynamic waClient:', err)
    }

    if (newStatus === 'PAID') {
      try {
        const aut = (await prisma.automation.findFirst({
          where: {
            storeId: order.storeId,
            name: { equals: 'Pedido pagado', mode: 'insensitive' },
            active: true,
          },
          select: { id: true, customTemplate: true },
        })) as AutomationTemplate | null

        const recipient = order.customerPhone || order.customerWhatsAppId
        if (aut && recipient) {
          const defaultMsg = `¡Pago confirmado!\n\nTu pedido *#{{pedido_id}}* por un total de ${{total}} en *{{tienda}}* ha sido procesado exitosamente. ¡Gracias por tu compra!`
          const template = aut.customTemplate || defaultMsg
          const formattedMsg = template
            .replace(/{{cliente}}/g, order.customerName || 'Cliente')
            .replace(/{{pedido_id}}/g, order.id.slice(-6).toUpperCase())
            .replace(/{{total}}/g, order.total.toLocaleString('es-CO'))
            .replace(/{{tienda}}/g, store?.name || 'Tienda')

          await clientToUse.sendText(recipient, formattedMsg)
          await prisma.automation.update({
            where: { id: aut.id },
            data: { sentToday: { increment: 1 } },
          })
        }

        await sendInvoiceToWhatsApp(orderId)
      } catch (error) {
        console.error('[MP Webhook] Failed to send WhatsApp confirmation', error)
      }
    }

    if (newStatus === 'PAID' && store?.whatsapp) {
      try {
        await clientToUse.sendText(
          store.whatsapp,
          `Nuevo pedido recibido.\n\nTienes una nueva venta en tu tienda *${store.name}*:\n\n*Detalles del pedido:*\n- *ID:* #${order.id.slice(-6)}\n- *Cliente:* ${order.customerName}\n- *Telefono:* ${order.customerPhone || 'N/A'}\n- *Direccion de Entrega:* ${order.address}, ${order.city}\n- *Total:* $${order.total.toLocaleString('es-CO')}`
        )

        await clientToUse.sendButtons(
          store.whatsapp,
          `¿Te gustaria solicitar nuestro Servicio de Domicilio?\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequena cuota de $5.000 COP (se descontara del pago final de la orden).`,
          [
            { id: `delivery_yes_${order.id}`, title: 'SI' },
            { id: `delivery_no_${order.id}`, title: 'NO' },
          ]
        )
      } catch (error) {
        console.error('[MP Webhook] Failed to notify store owner via WhatsApp', error)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[MP Webhook Error]', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
