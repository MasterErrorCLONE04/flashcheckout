import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { sendInvoiceToWhatsApp } from '@/lib/whatsapp/send-invoice'
import { waClient } from '@/lib/whatsapp/cloud-api'
import {
  logWebhookError,
  logWebhookEvent,
  logWebhookWarn,
} from '@/lib/webhooks'

type OrderItemJson = {
  productId: string
  name: string
  qty: number
  price: number
}

type AutomationTemplate = {
  id: string
  customTemplate: string | null
}

type WhatsAppNotifier = {
  sendText: (to: string, message: string) => Promise<unknown>
  sendButtons?: (
    to: string,
    message: string,
    buttons: Array<{ id: string; title: string }>
  ) => Promise<unknown>
}

type PaymentProcessingOutcome = 'processed' | 'duplicate' | 'amount_mismatch' | 'missing_order_id'

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription
  if (fromParent) {
    return typeof fromParent === 'string' ? fromParent : fromParent.id
  }

  const legacy = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null
    }
  ).subscription

  if (!legacy) return null
  return typeof legacy === 'string' ? legacy : legacy.id
}

function subscriptionPeriodAndPrice(sub: Stripe.Subscription) {
  const item = sub.items.data[0]
  const periodEndSec = item?.current_period_end
  const price = item?.price
  const priceId = typeof price === 'string' ? price : price?.id ?? null

  return {
    stripePriceId: priceId,
    stripeCurrentPeriodEnd:
      periodEndSec != null ? new Date(periodEndSec * 1000) : null,
  }
}

async function fulfillStoreOrderPayment(
  session: Stripe.Checkout.Session,
  context: { eventId: string }
) : Promise<PaymentProcessingOutcome> {
  const orderId = session.metadata?.orderId
  if (!orderId) {
    logWebhookWarn('stripe', 'missing_order_id', {
      eventId: context.eventId,
      sessionId: session.id,
    })
    return 'missing_order_id'
  }

  logWebhookEvent('stripe', 'processing_payment', {
    eventId: context.eventId,
    orderId,
    sessionId: session.id,
  })

  let outcome: PaymentProcessingOutcome = 'processed'

  await prisma.$transaction(async tx => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    })

    if (
      !order ||
      order.status !== 'pending_payment' ||
      order.stripeCheckoutSessionId === session.id ||
      order.paymentStatus === 'PAID'
    ) {
      outcome = 'duplicate'
      return
    }

    if (
      session.amount_total != null &&
      session.currency === 'cop' &&
      session.amount_total !== order.total
    ) {
      outcome = 'amount_mismatch'
      return
    }

    const items = order.items as OrderItemJson[]
    for (const line of items) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.qty } },
      })
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        stripeCheckoutSessionId: session.id,
      },
    })
  })

  if (outcome !== 'processed') {
    if (outcome === 'duplicate') {
      logWebhookEvent('stripe', 'duplicate', {
        eventId: context.eventId,
        orderId,
        sessionId: session.id,
      })
    } else if (outcome === 'amount_mismatch') {
      logWebhookWarn('stripe', 'amount_mismatch', {
        eventId: context.eventId,
        orderId,
        sessionId: session.id,
      })
    }

    return outcome
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    })

    if (order?.storeId) {
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
          .replace(/{{tienda}}/g, order.store.name)

        let clientToUse: WhatsAppNotifier = waClient
        const store = order.store
        if (store.whatsappInstanceName && store.whatsappConnected) {
          const { evolutionClient } = await import('@/lib/whatsapp/evolution')
          clientToUse = {
            sendText: (to: string, message: string) =>
              evolutionClient.sendText(store.whatsappInstanceName!, to, message),
          }
        }

        await clientToUse.sendText(recipient, formattedMsg)
        await prisma.automation.update({
          where: { id: aut.id },
          data: { sentToday: { increment: 1 } },
        })
      }
    }
  } catch (error) {
    logWebhookError('stripe', 'payment_confirmation_failed', {
      eventId: context.eventId,
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  try {
    await sendInvoiceToWhatsApp(orderId)
  } catch (error) {
    logWebhookError('stripe', 'invoice_delivery_failed', {
      eventId: context.eventId,
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order?.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: order.storeId },
      })
      if (store?.whatsapp) {
        await waClient.sendText(
          store.whatsapp,
          `Nuevo pedido recibido.\n\nTienes una nueva venta en tu tienda *${store.name}*:\n\n*Detalles del pedido:*\n- *ID:* #${order.id.slice(-6)}\n- *Cliente:* ${order.customerName}\n- *Telefono:* ${order.customerPhone || 'N/A'}\n- *Direccion de Entrega:* ${order.address}, ${order.city}\n- *Total:* $${order.total.toLocaleString('es-CO')}`
        )

        await waClient.sendButtons(
          store.whatsapp,
          `¿Te gustaria solicitar nuestro Servicio de Domicilio?\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequena cuota de $5.000 COP (se descontara del pago final de la orden).`,
          [
            { id: `delivery_yes_${order.id}`, title: 'SI' },
            { id: `delivery_no_${order.id}`, title: 'NO' },
          ]
        )
      }
    }
  } catch (error) {
    logWebhookError('stripe', 'store_notification_failed', {
      eventId: context.eventId,
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  return 'processed'
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature')

  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
    return new NextResponse('Missing Stripe webhook secret', { status: 500 })
  }

  if (!signature) {
    return new NextResponse('Missing Stripe signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown'
    logWebhookWarn('stripe', 'signature_rejected', {
      error: msg,
    })
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 })
  }

  try {
    logWebhookEvent('stripe', 'received', {
      eventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
    })

    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account
      if (account.id) {
        await prisma.store.updateMany({
          where: { stripeConnectAccountId: account.id },
          data: { stripeConnectChargesEnabled: !!account.charges_enabled },
        })
        logWebhookEvent('stripe', 'account_updated', {
          eventId: event.id,
          accountId: account.id,
          chargesEnabled: !!account.charges_enabled,
        })
      }
      return new NextResponse(null, { status: 200 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.mode === 'payment' && session.metadata?.orderId) {
        const outcome = await fulfillStoreOrderPayment(session, { eventId: event.id })
        if (outcome !== 'processed') {
          logWebhookEvent('stripe', 'ignored', {
            eventId: event.id,
            eventType: event.type,
            reason: outcome,
            orderId: session.metadata.orderId,
          })
          return new NextResponse(null, { status: 200 })
        }
        logWebhookEvent('stripe', 'processed', {
          eventId: event.id,
          eventType: event.type,
          mode: session.mode,
          orderId: session.metadata.orderId,
        })
        return new NextResponse(null, { status: 200 })
      }

      if (
        session.mode === 'subscription' &&
        session.metadata?.storeId &&
        session.subscription
      ) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const { stripePriceId, stripeCurrentPeriodEnd } =
          subscriptionPeriodAndPrice(subscription)

        await prisma.store.update({
          where: { id: session.metadata.storeId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: stripePriceId ?? undefined,
            stripeCurrentPeriodEnd: stripeCurrentPeriodEnd ?? undefined,
          },
        })
        logWebhookEvent('stripe', 'subscription_updated', {
          eventId: event.id,
          subscriptionId: subscription.id,
          storeId: session.metadata.storeId,
        })
        return new NextResponse(null, { status: 200 })
      }

      logWebhookEvent('stripe', 'ignored', {
        eventId: event.id,
        eventType: event.type,
        reason: 'unsupported_checkout_session',
      })
      return new NextResponse(null, { status: 200 })
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const subId = invoiceSubscriptionId(invoice)
      if (!subId) {
        logWebhookWarn('stripe', 'missing_subscription_id', {
          eventId: event.id,
          eventType: event.type,
        })
        return new NextResponse(null, { status: 200 })
      }

      const subscription = await stripe.subscriptions.retrieve(subId)
      const { stripePriceId, stripeCurrentPeriodEnd } =
        subscriptionPeriodAndPrice(subscription)

      await prisma.store.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: stripePriceId ?? undefined,
          stripeCurrentPeriodEnd: stripeCurrentPeriodEnd ?? undefined,
        },
      })
      logWebhookEvent('stripe', 'invoice_processed', {
        eventId: event.id,
        subscriptionId: subscription.id,
      })
      return new NextResponse(null, { status: 200 })
    }

    logWebhookEvent('stripe', 'ignored', {
      eventId: event.id,
      eventType: event.type,
      reason: 'unsupported_event_type',
    })
  } catch (error) {
    logWebhookError('stripe', 'handler_error', {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return new NextResponse('Webhook handler error', { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
