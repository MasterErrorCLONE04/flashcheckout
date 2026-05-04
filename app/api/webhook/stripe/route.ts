import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendInvoiceToWhatsApp } from '@/lib/whatsapp/send-invoice'
import { waClient } from '@/lib/whatsapp/cloud-api'


type OrderItemJson = {
  productId: string
  name: string
  qty: number
  price: number
}

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
  const priceId =
    typeof price === 'string' ? price : price?.id ?? null
  return {
    stripePriceId: priceId,
    stripeCurrentPeriodEnd:
      periodEndSec != null ? new Date(periodEndSec * 1000) : null,
  }
}

async function fulfillStoreOrderPayment(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  if (!orderId) {
    console.error('Webhook: orderId faltante en metadata')
    return
  }

  await prisma.$transaction(async tx => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    })

    if (!order || order.status !== 'pending_payment') {
      return
    }

    if (
      session.amount_total != null &&
      session.currency === 'cop' &&
      session.amount_total !== order.total
    ) {
      console.error(
        'Webhook: total no coincide con el pedido',
        session.amount_total,
        order.total
      )
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

  // Enviar factura electrónica por WhatsApp
  try {
    await sendInvoiceToWhatsApp(orderId)
  } catch (error) {
    console.error('[Stripe Webhook] Failed to send WhatsApp confirmation / invoice', error)
  }

  // Notificar al dueño de la tienda por WhatsApp sobre la nueva venta y sugerir domicilio
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order && order.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: order.storeId },
      })
      if (store && store.whatsapp) {
        await waClient.sendText(
          store.whatsapp,
          `📦 *¡Nuevo pedido recibido!* 🎉\n\nHola, tienes una nueva venta en tu tienda *${store.name}*:\n\n*Detalles del pedido:*\n• *ID:* #${order.id.slice(-6)}\n• *Cliente:* ${order.customerName}\n• *Teléfono:* ${order.customerPhone || 'N/A'}\n• *Dirección de Entrega:* ${order.address}, ${order.city}\n• *Total:* $${order.total.toLocaleString('es-CO')}`
        )

        await waClient.sendButtons(
          store.whatsapp,
          `🚚 *¿Te gustaría solicitar nuestro Servicio de Domicilio?*\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequeña cuota de *$5.000 COP* (se descontará del pago final de la orden).`,
          [
            { id: `delivery_yes_${order.id}`, title: 'SÍ' },
            { id: `delivery_no_${order.id}`, title: 'NO' }
          ]
        )
      }
    }
  } catch (error) {
    console.error('[Stripe Webhook] Failed to notify store owner via WhatsApp', error)
  }
}

export async function POST(req: Request) {
  const body = await req.text()

  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown'
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 })
  }

  try {
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account
      if (account.id) {
        await prisma.store.updateMany({
          where: { stripeConnectAccountId: account.id },
          data: { stripeConnectChargesEnabled: !!account.charges_enabled },
        })
      }
      return new NextResponse(null, { status: 200 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.mode === 'payment' && session.metadata?.orderId) {
        await fulfillStoreOrderPayment(session)
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
        return new NextResponse(null, { status: 200 })
      }

      return new NextResponse(null, { status: 200 })
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const subId = invoiceSubscriptionId(invoice)
      if (!subId) {
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
      return new NextResponse(null, { status: 200 })
    }
  } catch (e) {
    console.error('STRIPE_WEBHOOK_HANDLER', e)
    return new NextResponse('Webhook handler error', { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
