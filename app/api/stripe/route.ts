import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { getErrorMessage } from '@/lib/api/route-utils'

type StripeStore = {
  id: string
  stripeCustomerId: string | null
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const store = (await prisma.store.findFirst({
      where: { userId },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    })) as StripeStore | null

    if (!store) {
      return new NextResponse('Store not found', { status: 404 })
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/suscripcion`

    if (store.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: store.stripeCustomerId,
        return_url: returnUrl,
      })

      return NextResponse.json({ url: stripeSession.url })
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID?.trim()
    if (!priceId) {
      return NextResponse.json(
        {
          error: 'Configuracion incompleta',
          details:
            'Falta STRIPE_PRO_PRICE_ID en el servidor. Añadelo en .env.local (ID que empieza por price_).',
        },
        { status: 500 }
      )
    }

    if (priceId.startsWith('prod_')) {
      return NextResponse.json(
        {
          error: 'Configuracion incorrecta',
          details:
            'STRIPE_PRO_PRICE_ID es un ID de producto (prod_...). En Stripe Dashboard → Productos → tu producto → copia el ID del precio recurrente (price_), no el del producto.',
        },
        { status: 500 }
      )
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: returnUrl,
      cancel_url: returnUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        storeId: store.id,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error: unknown) {
    console.error('STRIPE_ERROR', error)
    return NextResponse.json(
      { error: 'Internal Error', details: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
