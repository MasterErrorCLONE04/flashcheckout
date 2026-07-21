import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mpPayment } from '@/lib/mercadopago'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { sendInvoiceToWhatsApp } from '@/lib/whatsapp/send-invoice'
import {
  logWebhookError,
  logWebhookEvent,
  logWebhookWarn,
  parseJsonBody,
  verifyMercadoPagoWebhookSignature,
} from '@/lib/webhooks'

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

type MercadoPagoWebhookBody = {
  action?: string
  api_version?: string
  data?: {
    id?: string | number
  }
  date_created?: string
  id?: string | number
  live_mode?: boolean
  type?: string
  user_id?: string | number
}

const MERCADOPAGO_WEBHOOK_SECRET =
  process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || ''

function toStringId(value: string | number | undefined | null) {
  return value == null ? null : String(value)
}

function resolvePaymentStatus(status: string) {
  if (status === 'approved') {
    return { paymentStatus: 'PAID' as const, legacyStatus: 'paid' }
  }

  if (['rejected', 'cancelled'].includes(status || '')) {
    return { paymentStatus: 'FAILED' as const, legacyStatus: 'cancelled' }
  }

  return { paymentStatus: 'PENDING' as const, legacyStatus: 'pending_payment' }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || searchParams.get('topic')
    const dataId = searchParams.get('data.id') || searchParams.get('id')
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')
    const rawBody = await req.text()
    const body = parseJsonBody<MercadoPagoWebhookBody>(rawBody)

    logWebhookEvent('mercadopago', 'received', {
      topic: type,
      dataId,
      requestId: xRequestId,
      notificationId: toStringId(body?.id),
      action: body?.action,
    })

    if (!type) {
      logWebhookWarn('mercadopago', 'missing_type', {
        requestId: xRequestId,
        dataId,
      })
      return NextResponse.json({ error: 'Missing notification type' }, { status: 400 })
    }

    if (type !== 'payment') {
      logWebhookEvent('mercadopago', 'ignored', {
        reason: 'unsupported_topic',
        topic: type,
        requestId: xRequestId,
      })
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (!dataId) {
      logWebhookWarn('mercadopago', 'missing_data_id', {
        requestId: xRequestId,
        topic: type,
      })
      return NextResponse.json({ error: 'Missing data.id' }, { status: 400 })
    }

    if (!body) {
      logWebhookWarn('mercadopago', 'invalid_json', {
        requestId: xRequestId,
        dataId,
      })
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!MERCADOPAGO_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      logWebhookError('mercadopago', 'missing_webhook_secret', {
        requestId: xRequestId,
        dataId,
      })
      return NextResponse.json({ error: 'Webhook config error' }, { status: 500 })
    }

    if (
      MERCADOPAGO_WEBHOOK_SECRET &&
      !verifyMercadoPagoWebhookSignature({
        dataId,
        secret: MERCADOPAGO_WEBHOOK_SECRET,
        xRequestId,
        xSignature,
      })
    ) {
      logWebhookWarn('mercadopago', 'signature_rejected', {
        requestId: xRequestId,
        dataId,
        hasSignature: Boolean(xSignature),
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!MERCADOPAGO_WEBHOOK_SECRET) {
      logWebhookWarn('mercadopago', 'signature_skipped', {
        requestId: xRequestId,
        dataId,
        reason: 'missing_secret',
      })
    }

    const payment = await mpPayment.get({ id: dataId })
    const orderId = payment.external_reference
    const status = payment.status

    if (!orderId) {
      logWebhookWarn('mercadopago', 'missing_order_reference', {
        requestId: xRequestId,
        dataId,
        paymentStatus: status,
      })
      return NextResponse.json({ error: 'No order reference' }, { status: 400 })
    }

    const { paymentStatus: newStatus, legacyStatus } = resolvePaymentStatus(status || '')

    logWebhookEvent('mercadopago', 'processing', {
      requestId: xRequestId,
      dataId,
      orderId,
      paymentStatus: status,
    })

    if (newStatus === 'PENDING') {
      logWebhookEvent('mercadopago', 'ignored', {
        requestId: xRequestId,
        dataId,
        orderId,
        paymentStatus: status,
        reason: 'non_terminal_status',
      })
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentStatus: true,
        mpPaymentId: true,
        storeId: true,
        customerPhone: true,
        customerWhatsAppId: true,
        customerName: true,
        total: true,
        address: true,
        city: true,
      },
    })

    if (!currentOrder) {
      logWebhookWarn('mercadopago', 'order_not_found', {
        requestId: xRequestId,
        dataId,
        orderId,
      })
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (currentOrder.mpPaymentId === String(dataId) && currentOrder.paymentStatus === newStatus) {
      logWebhookEvent('mercadopago', 'duplicate', {
        requestId: xRequestId,
        dataId,
        orderId,
        paymentId: dataId,
        paymentStatus: newStatus,
      })
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newStatus,
        status: legacyStatus,
        mpPaymentId: String(dataId),
      },
    })

    logWebhookEvent('mercadopago', 'order_updated', {
      requestId: xRequestId,
      dataId,
      orderId: order.id,
      paymentStatus: newStatus,
      legacyStatus,
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
        const activeStore = store
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        clientToUse = {
          sendText: (to: string, message: string) =>
            evolutionClient.sendText(activeStore.whatsappInstanceName!, to, message),
          sendButtons: (
            to: string,
            message: string,
            buttons: Array<{ id: string; title: string }>
          ) => evolutionClient.sendButtons(activeStore.whatsappInstanceName!, to, message, buttons),
        }
      }
    } catch (err) {
      logWebhookError('mercadopago', 'client_resolution_failed', {
        requestId: xRequestId,
        dataId,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
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
          const defaultMsg =
            '¡Pago confirmado!\n\nTu pedido *#{{pedido_id}}* por un total de ${{total}} en *{{tienda}}* ha sido procesado exitosamente. ¡Gracias por tu compra!'
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
        logWebhookError('mercadopago', 'payment_confirmation_failed', {
          requestId: xRequestId,
          dataId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
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
        logWebhookError('mercadopago', 'store_notification_failed', {
          requestId: xRequestId,
          dataId,
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    logWebhookEvent('mercadopago', 'processed', {
      requestId: xRequestId,
      dataId,
      orderId,
      paymentStatus: newStatus,
    })

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    logWebhookError('mercadopago', 'handler_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
