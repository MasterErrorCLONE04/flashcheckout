import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    })

    if (!store) {
      return new NextResponse('Store not found', { status: 404 })
    }

    // Ruta a donde Stripe va a retornar al usuario tras una transacción o gestión
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/suscripcion`

    // Si el usuario YA es cliente de Stripe (es decir, ya ha pagado o intentado pagar antes),
    // lo enviamos al "Portal de Facturación" (Billing Portal) para que altere métodos de pago o cancele.
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
          error: 'Configuración incompleta',
          details:
            'Falta STRIPE_PRO_PRICE_ID en el servidor. Añádelo en .env.local (ID que empieza por price_).',
        },
        { status: 500 }
      )
    }
    if (priceId.startsWith('prod_')) {
      return NextResponse.json(
        {
          error: 'Configuración incorrecta',
          details:
            'STRIPE_PRO_PRICE_ID es un ID de producto (prod_…). En Stripe Dashboard → Productos → tu producto → copia el ID del precio recurrente (price_…), no el del producto.',
        },
        { status: 500 }
      )
    }

    // Si NUNCA ha pagado, lo mandamos al "Checkout" para que inicie la membresía
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: returnUrl,
      cancel_url: returnUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: undefined, // Si quisiéramos lo sacaríamos de clerk, pero dejamos que lo llene en Stripe
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

  } catch (error: any) {
    console.error('STRIPE_ERROR', error)
    return NextResponse.json(
      { error: 'Internal Error', details: error.message }, 
      { status: 500 }
    )
  }
}
