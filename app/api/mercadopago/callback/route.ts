import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  const redirectUrl = `${base}/configuracion`

  // 1. Verificar autenticación con Clerk
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(`${base}/sign-in`)
  }

  // 2. Si el usuario rechazó o hubo error
  if (error || !code) {
    console.error('[Mercado Pago OAuth Error] Error or missing code:', { error, code })
    return NextResponse.redirect(`${redirectUrl}?mp_connected=error&error_reason=${error || 'no_code'}`)
  }

  try {
    // 3. Buscar la tienda del usuario
    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      console.error('[Mercado Pago OAuth Error] Store not found for user:', userId)
      return NextResponse.redirect(`${redirectUrl}?mp_connected=error&error_reason=no_store`)
    }

    const appId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID || ''
    const clientSecret = process.env.MERCADOPAGO_ACCESS_TOKEN || '' // Mercado Pago usa el ACCESS_TOKEN de la app plataforma como client_secret

    if (!appId || !clientSecret) {
      console.error('[Mercado Pago OAuth Error] Missing app credentials in Env Variables')
      return NextResponse.redirect(`${redirectUrl}?mp_connected=error&error_reason=missing_env`)
    }

    // 4. Intercambiar el código de autorización
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
        'Authorization': `Bearer ${clientSecret}`
      },
      body: params.toString()
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('[Mercado Pago OAuth Response Error] Failed to exchange code:', errBody)
      return NextResponse.redirect(`${redirectUrl}?mp_connected=error&error_reason=exchange_failed`)
    }

    const data = await tokenRes.json()

    // 5. Guardar credenciales en la base de datos
    await prisma.store.update({
      where: { id: store.id },
      data: {
        mpAccessToken: data.access_token,
        mpPublicKey: data.public_key,
        mpUserId: String(data.user_id),
        mpConnected: true
      }
    })

    console.log(`[Mercado Pago OAuth Success] Store ${store.slug} connected successfully. MP User ID: ${data.user_id}`)
    return NextResponse.redirect(`${redirectUrl}?mp_connected=success`)

  } catch (err: any) {
    console.error('[Mercado Pago OAuth Callback Exception]:', err)
    return NextResponse.redirect(`${redirectUrl}?mp_connected=error&error_reason=exception`)
  }
}
