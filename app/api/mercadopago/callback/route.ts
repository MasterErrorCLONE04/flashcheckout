import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type MercadoPagoTokenResponse = {
  access_token?: string
  public_key?: string
  user_id?: string | number
}

function redirectWithError(base: string, reason: string) {
  return NextResponse.redirect(`${base}?mp_connected=error&error_reason=${reason}`)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  const redirectUrl = `${base}/configuracion`

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(`${base}/sign-in`)
  }

  if (error || !code) {
    console.error('[Mercado Pago OAuth Error] Error or missing code:', { error, code })
    return redirectWithError(redirectUrl, error || 'no_code')
  }

  try {
    const store = await prisma.store.findFirst({
      where: { userId },
    })

    if (!store) {
      console.error('[Mercado Pago OAuth Error] Store not found for user:', userId)
      return redirectWithError(redirectUrl, 'no_store')
    }

    const appId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID || ''
    const clientSecret =
      process.env.MERCADOPAGO_CLIENT_SECRET || process.env.MERCADOPAGO_ACCESS_TOKEN || ''

    if (!appId || !clientSecret) {
      console.error('[Mercado Pago OAuth Error] Missing app credentials in Env Variables')
      return redirectWithError(redirectUrl, 'missing_env')
    }

    const params = new URLSearchParams()
    params.append('client_id', appId)
    params.append('client_secret', clientSecret)
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', `${base}/api/mercadopago/callback`)

    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('[Mercado Pago OAuth Response Error] Failed to exchange code:', errBody)
      return redirectWithError(redirectUrl, 'exchange_failed')
    }

    const data = (await tokenRes.json()) as MercadoPagoTokenResponse

    await prisma.store.update({
      where: { id: store.id },
      data: {
        mpAccessToken: data.access_token ?? null,
        mpPublicKey: data.public_key ?? null,
        mpUserId: data.user_id != null ? String(data.user_id) : null,
        mpConnected: true,
      },
    })

    console.log(`[Mercado Pago OAuth Success] Store ${store.slug} connected successfully. MP User ID: ${data.user_id}`)
    return NextResponse.redirect(`${redirectUrl}?mp_connected=success`)
  } catch (error: unknown) {
    console.error('[Mercado Pago OAuth Callback Exception]:', error)
    return redirectWithError(redirectUrl, 'exception')
  }
}
