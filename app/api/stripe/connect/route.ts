import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { ensureConnectAccount } from '@/lib/stripe-connect-account'
import { getErrorMessage } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

async function syncChargesFlag(storeId: string, accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)
  const enabled = !!account.charges_enabled
  await prisma.store.update({
    where: { id: storeId },
    data: { stripeConnectChargesEnabled: enabled },
  })
  return {
    chargesEnabled: enabled,
    detailsSubmitted: !!account.details_submitted,
  }
}

/** Estado de Connect + sincroniza charges_enabled desde Stripe. */
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId },
      select: {
        id: true,
        stripeConnectAccountId: true,
        stripeConnectChargesEnabled: true,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    if (!store.stripeConnectAccountId) {
      return NextResponse.json({
        connected: false,
        chargesEnabled: false,
        detailsSubmitted: false,
        accountId: null,
      })
    }

    const { chargesEnabled, detailsSubmitted } = await syncChargesFlag(
      store.id,
      store.stripeConnectAccountId
    )

    return NextResponse.json({
      connected: true,
      chargesEnabled,
      detailsSubmitted,
      accountId: store.stripeConnectAccountId,
    })
  } catch (error: unknown) {
    console.error('STRIPE_CONNECT_GET', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error al consultar Stripe') },
      { status: 500 }
    )
  }
}

type Body = {
  intent?: 'ensure_account' | 'account_session'
}

/**
 * - ensure_account: crea cuenta Connect si falta (automatización en segundo plano).
 * - account_session: asegura cuenta + devuelve client_secret para Connect.js embebido.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as Body
    const intent = body.intent ?? 'account_session'

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress ?? undefined

    const store = await prisma.store.findFirst({
      where: { userId },
      select: {
        id: true,
        stripeConnectAccountId: true,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const accountId = await ensureConnectAccount(store, userId, email)

    if (intent === 'ensure_account') {
      return NextResponse.json({ accountId })
    }

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: {
          enabled: true,
        },
      },
    })

    if (!accountSession.client_secret) {
      return NextResponse.json(
        { error: 'Stripe no devolvió client_secret' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clientSecret: accountSession.client_secret })
  } catch (error: unknown) {
    console.error('STRIPE_CONNECT_POST', error)
    const stripeError = error as { code?: string; message?: string }
    
    // Si el error es que Connect no está activado en el Dashboard de Stripe
    if (stripeError.code === 'authentication_error' && stripeError.message?.includes('Connect')) {
      return NextResponse.json({ 
        error: 'Stripe Connect no está activado en tu cuenta de Stripe. Por favor, ve a tu Dashboard de Stripe (sección Connect) y haz clic en "Comenzar" para activarlo.' 
      }, { status: 403 })
    }

    return NextResponse.json({ error: getErrorMessage(error, 'Error desconocido') }, { status: 500 })
  }
}
